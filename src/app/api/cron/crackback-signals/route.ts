// src/app/api/cron/crackback-signals/route.ts
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@sanity/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

type TrackedCompany = {
  _id: string
  name: string
  ticker?: string
  slug?: string
  sector?: string
  subsector?: string
  crackbackPriority?: "high" | "medium" | "low"
  coverageStatus?: "active" | "watch" | "paused"
  primaryAngle?: string
  squibTriggers?: string[]
  whyItMatters?: string
  investorRelationsUrl?: string
  earningsCalendarUrl?: string
  isCoreWatchlist?: boolean
  lastEarningsDate?: string
  nextEarningsDate?: string
  lastCoveredAt?: string
  lastMinedAt?: string
  notes?: string
}

type Candidate = {
  title: string
  suggestedHeadline: string
  signal: string
  statOrQuote: string
  whyItMatters: string
  theCrackback: string
}

type ScoreResult = {
  publishScore: number
  decision: "publish" | "hold" | "reject"
  reason: string
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96)
}

function priorityRank(priority?: string) {
  if (priority === "high") return 0
  if (priority === "medium") return 1
  return 2
}

function failsHeadlineGuardrail(candidate: Candidate) {
  const headline = (candidate.suggestedHeadline || candidate.title || "").trim()
  const lower = headline.toLowerCase()

  if (!headline) return true
  if (headline.length > 90) return true

  const bannedWords = [
    "strategy",
    "initiative",
    "innovation",
    "synergy",
    "growth",
    "expansion",
  ]

  if (bannedWords.some((word) => lower.includes(word))) {
    return true
  }

  const genericPhrases = [
    "continues to",
    "focused on",
    "highlights",
    "strong momentum",
    "long-term value",
    "platform approach",
    "driving growth",
    "expanding ecosystem",
  ]

  if (genericPhrases.some((phrase) => lower.includes(phrase))) {
    return true
  }

  return false
}

function hasContradictionShape(candidate: Candidate) {
  const text = [
    candidate.suggestedHeadline,
    candidate.theCrackback,
    candidate.whyItMatters,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const contradictionSignals = [
    "but",
    "without",
    "instead",
    "not ",
    "more than",
    "less than",
    "quietly",
    "even as",
    "despite",
    "rather than",
  ]

  return contradictionSignals.some((phrase) => text.includes(phrase))
}

function adjustPublishScore(score: ScoreResult, candidate: Candidate): ScoreResult {
  let adjusted = score.publishScore

  if (hasContradictionShape(candidate)) {
    adjusted += 5
  }

  if (failsHeadlineGuardrail(candidate)) {
    adjusted -= 10
  }

  if (adjusted > 100) adjusted = 100
  if (adjusted < 0) adjusted = 0

  const decision: "publish" | "hold" | "reject" =
    adjusted >= 85
      ? "publish"
      : adjusted >= 65
      ? "hold"
      : "reject"

  return {
    ...score,
    publishScore: adjusted,
    decision,
  }
}

async function getTrackedCompanies(limit = 6): Promise<TrackedCompany[]> {
  const raw = await sanity.fetch(
    `*[
      _type == "trackedCompany" &&
      coverageStatus in ["active", "watch"] &&
      defined(name)
    ]{
      _id,
      name,
      ticker,
      "slug": slug.current,
      sector,
      subsector,
      crackbackPriority,
      coverageStatus,
      primaryAngle,
      squibTriggers,
      whyItMatters,
      investorRelationsUrl,
      earningsCalendarUrl,
      isCoreWatchlist,
      lastEarningsDate,
      nextEarningsDate,
      lastCoveredAt,
      lastMinedAt,
      notes
    }`
  )

  return raw
    .sort((a: TrackedCompany, b: TrackedCompany) => {
      const aCore = a.isCoreWatchlist ? 1 : 0
      const bCore = b.isCoreWatchlist ? 1 : 0
      if (bCore !== aCore) return bCore - aCore

      const pr = priorityRank(a.crackbackPriority) - priorityRank(b.crackbackPriority)
      if (pr !== 0) return pr

      const aMined = a.lastMinedAt ? new Date(a.lastMinedAt).getTime() : 0
      const bMined = b.lastMinedAt ? new Date(b.lastMinedAt).getTime() : 0
      if (aMined !== bMined) return aMined - bMined

      return a.name.localeCompare(b.name)
    })
    .slice(0, limit)
}

// Version 1: use company metadata and light fallback text.
// Later you can replace this with real IR/transcript fetching.
async function getSourceForCompany(company: TrackedCompany) {
  const fallbackTextByCompany: Record<string, string> = {
    Costco:
      "Costco executives have discussed expanding into denser markets using parking decks and mixed-use developments above warehouses. This allows the company to enter urban areas where land is scarce while maintaining the membership warehouse model.",
    Netflix:
      "Netflix executives have increasingly emphasized the growth of the ad-supported tier as a major long-term driver. The company noted that advertising allows Netflix to reach a broader audience at lower price points while generating additional revenue per member through ads. Management also highlighted improving advertising technology and targeting capabilities as a key investment area.",
    Disney:
      "Disney executives emphasized that the company is moving its streaming business toward sustained profitability through a mix of pricing adjustments, advertising growth, and bundling Disney+, Hulu, and ESPN+.",
    Roblox:
      "Roblox executives highlighted that the platform’s growth is driven by its global developer community, which creates experiences that attract and retain users. The company emphasized the self-reinforcing creator economy.",
    Hasbro:
      "Hasbro has increasingly relied on Magic: The Gathering as a high-margin growth engine, especially through Universes Beyond and premium releases that behave more like a licensing platform than a toy line.",
  }

  const parts = [
    company.primaryAngle,
    company.whyItMatters,
    company.notes,
    fallbackTextByCompany[company.name],
  ].filter(Boolean)

  return {
    sourceType: "other",
    sourceTitle: `${company.name} automated source`,
    sourceUrl: company.investorRelationsUrl || "",
    sourceText: parts.join("\n\n"),
    primaryAngle:
      company.primaryAngle ||
      `${company.name} has a hidden business engine worth tracking.`,
    squibTriggers:
      company.squibTriggers?.length
        ? company.squibTriggers
        : [
            "platform economics",
            "pricing power",
            "margin expansion",
            "distribution advantage",
          ],
  }
}

async function generateCandidates(company: TrackedCompany): Promise<Candidate[]> {
  const source = await getSourceForCompany(company)

  const system = `
You are the Crackback Signal Miner.

The Crackback identifies hidden business mechanics inside major companies.

Signals should feel like sharp observations — not summaries.

Your job is to extract small details that reveal a larger business story.

GOOD SIGNALS:
• highlight a specific behavior, quote, stat, or pattern
• reveal the real economic engine of the company
• feel slightly mischievous or skeptical
• read like a sharp newsroom observation

BAD SIGNALS:
• generic strategy summaries
• earnings recap language
• investor relations phrasing
• vague statements about growth or innovation

Headlines should be short, punchy, and specific.

GOOD HEADLINE EXAMPLES:

Apple executives said "AI disruption" 17 times but never defined it
Costco's real moat isn't price. It's parking.
Netflix quietly built an ad business without calling it one
Roblox isn't a game company. It's a developer economy
Uber's biggest innovation might be surge pricing psychology

BAD HEADLINE EXAMPLES:

Company focuses on long-term growth strategy
Executives highlight strong platform momentum
Company continues to expand its ecosystem

Each signal must include:

title
suggestedHeadline
signal
statOrQuote
whyItMatters
theCrackback

RULES:

• suggestedHeadline should feel like a journalistic observation
• signal should describe the specific detail
• statOrQuote should include the concrete quote/stat if available
• theCrackback should interpret the business mechanics behind it
• prefer headlines built around contradiction, tension, or a revealing mismatch
• prefer small details that imply a much bigger story

Write tightly and concretely.

Avoid corporate language.
Avoid filler.
Prefer specificity over completeness.
`

  const user = `
Company: ${company.name}
Ticker: ${company.ticker || ""}
Sector: ${company.sector || ""}
Subsector: ${company.subsector || ""}
Primary angle: ${source.primaryAngle}
Squib triggers: ${source.squibTriggers.join(", ")}
Why it matters: ${company.whyItMatters || ""}

Source type: ${source.sourceType}
Source title: ${source.sourceTitle}
Source URL: ${source.sourceUrl}

Source text:
"""
${source.sourceText}
"""

Headlines must be:

• under 14 words
• concrete
• slightly surprising
• built around a specific observation

Avoid words like:
strategy
initiative
innovation
synergy
growth
expansion
ecosystem
platform
`

  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "signal_candidates",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            candidates: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  suggestedHeadline: { type: "string" },
                  signal: { type: "string" },
                  statOrQuote: { type: "string" },
                  whyItMatters: { type: "string" },
                  theCrackback: { type: "string" },
                },
                required: [
                  "title",
                  "suggestedHeadline",
                  "signal",
                  "statOrQuote",
                  "whyItMatters",
                  "theCrackback",
                ],
              },
            },
          },
          required: ["candidates"],
        },
      },
    },
  })

  const parsed = JSON.parse(response.output_text)
  return parsed.candidates ?? []
}

async function scoreCandidate(company: TrackedCompany, candidate: Candidate): Promise<ScoreResult> {
  const system = `
You are scoring a Crackback signal for publication.

Return:
- publishScore: integer 0 to 100
- decision: publish, hold, or reject
- reason: one short sentence

Reward:
- specificity
- originality
- business mechanics
- sharp voice
- real interpretive value
- pithy wording
- small details that imply a bigger business story
- contradiction, tension, or revealing mismatch

Punish:
- vagueness
- generic business-news phrasing
- investor-relations language
- weak or obvious observations

Signals with vague headlines should receive very low scores.
Signals built around a concrete observation should score highly.
Prefer signals whose headline or interpretation is built around a contradiction, tension, or revealing mismatch.
Reward pithy wording and small details that imply a bigger business story.
`

  const user = `
Company: ${company.name}
Primary angle: ${company.primaryAngle || ""}
Candidate title: ${candidate.title}
Suggested headline: ${candidate.suggestedHeadline}
Signal: ${candidate.signal}
Stat or quote: ${candidate.statOrQuote}
Why it matters: ${candidate.whyItMatters}
The Crackback: ${candidate.theCrackback}

Headlines must be:

• under 14 words
• concrete
• slightly surprising
• built around a specific observation

Avoid words like:
strategy
initiative
innovation
synergy
growth
expansion
ecosystem
platform
`

  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "signal_score",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            publishScore: { type: "integer" },
            decision: {
              type: "string",
              enum: ["publish", "hold", "reject"],
            },
            reason: { type: "string" },
          },
          required: ["publishScore", "decision", "reason"],
        },
      },
    },
  })

  return JSON.parse(response.output_text)
}

async function findDuplicate(companyId: string, candidate: Candidate) {
  return sanity.fetch(
    `*[
      _type == "signalCandidate" &&
      company._ref == $companyId &&
      (
        suggestedHeadline == $headline ||
        title == $title
      ) &&
      _createdAt > dateTime(now()) - 60 * 60 * 24 * 14
    ][0]._id`,
    {
      companyId,
      headline: candidate.suggestedHeadline,
      title: candidate.title,
    }
  )
}

async function createSignalCandidate(
  company: TrackedCompany,
  candidate: Candidate,
  source: Awaited<ReturnType<typeof getSourceForCompany>>,
  status: "suggested" | "approved" | "published" | "rejected",
  publishScore: number
) {
  const now = new Date().toISOString()
  const baseTitle = candidate.suggestedHeadline || candidate.title
  const slug = slugify(baseTitle)

  return sanity.create({
    _type: "signalCandidate",
    title: candidate.title,
    slug: { _type: "slug", current: slug },
    company: { _type: "reference", _ref: company._id },
    sourceType: source.sourceType,
    sourceTitle: source.sourceTitle,
    sourceUrl: source.sourceUrl || undefined,
    signal: candidate.signal,
    statOrQuote: candidate.statOrQuote,
    whyItMatters: candidate.whyItMatters,
    theCrackback: candidate.theCrackback,
    suggestedHeadline: candidate.suggestedHeadline,
    status,
    publishedAt: status === "published" ? now : undefined,
    createdFromMinerAt: now,
    publishScore,
  })
}

export async function GET(req: NextRequest) {
  const key = (req.nextUrl.searchParams.get("key") || "").trim()
  const secret = (process.env.CRON_SECRET || "").trim()

  if (!secret || key !== secret) {
    return unauthorized()
  }

  const companies = await getTrackedCompanies(6)

  type ScoredCandidate = {
    company: TrackedCompany
    source: Awaited<ReturnType<typeof getSourceForCompany>>
    candidate: Candidate
    score: ScoreResult
  }

  const allScored: ScoredCandidate[] = []
  const results: Array<{
    company: string
    generated: number
    skippedDuplicates: number
    published: number
    approved: number
    rejected: number
  }> = []

  for (const company of companies) {
    const source = await getSourceForCompany(company)
    const candidates = await generateCandidates(company)

    let generated = 0
    let skippedDuplicates = 0

    for (const candidate of candidates) {
      const duplicate = await findDuplicate(company._id, candidate)
      if (duplicate) {
        skippedDuplicates += 1
        continue
      }

      const rawScore = await scoreCandidate(company, candidate)
      const score = adjustPublishScore(rawScore, candidate)

      if (failsHeadlineGuardrail(candidate) && score.publishScore < 65) {
        allScored.push({
          company,
          source,
          candidate,
          score: {
            ...score,
            decision: "reject",
            reason: "Headline failed guardrail and did not clear quality threshold.",
          },
        })
      } else {
        allScored.push({
          company,
          source,
          candidate,
          score,
        })
      }

      generated += 1
    }

    results.push({
      company: company.name,
      generated,
      skippedDuplicates,
      published: 0,
      approved: 0,
      rejected: 0,
    })
  }

  // Sort globally by score, highest first
  allScored.sort((a, b) => b.score.publishScore - a.score.publishScore)

  // Publishing rules
  const MAX_PUBLISHED_TOTAL = 3
  const MIN_PUBLISH_SCORE = 80
  const MIN_APPROVED_SCORE = 65
  const publishedCompanyIds = new Set<string>()
  let publishedCount = 0

  for (const item of allScored) {
    const { company, source, candidate, score } = item

    let status: "suggested" | "approved" | "published" | "rejected" = "approved"

    const canPublish =
      score.decision === "publish" &&
      score.publishScore >= MIN_PUBLISH_SCORE &&
      publishedCount < MAX_PUBLISHED_TOTAL &&
      !publishedCompanyIds.has(company._id)

    if (canPublish) {
      status = "published"
      publishedCount += 1
      publishedCompanyIds.add(company._id)
    } else if (
      score.decision === "reject" ||
      score.publishScore < 50
    ) {
      status = "rejected"
    } else if (score.publishScore < MIN_APPROVED_SCORE) {
      status = "rejected"
    } else {
      status = "approved"
    }

    await createSignalCandidate(
      company,
      candidate,
      source,
      status,
      score.publishScore
    )

    const resultRow = results.find((r) => r.company === company.name)
    if (resultRow) {
      if (status === "published") resultRow.published += 1
      if (status === "approved") resultRow.approved += 1
      if (status === "rejected") resultRow.rejected += 1
    }
  }

  // Update company timestamps
  const now = new Date().toISOString()

  for (const company of companies) {
    const resultRow = results.find((r) => r.company === company.name)

    await sanity
      .patch(company._id)
      .set({
        lastMinedAt: now,
        ...(resultRow && resultRow.published > 0
          ? { lastCoveredAt: now }
          : {}),
      })
      .commit()
  }

  return NextResponse.json({
    ok: true,
    companiesProcessed: companies.length,
    totalCandidatesScored: allScored.length,
    totalPublished: publishedCount,
    results,
  })
}