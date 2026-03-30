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

Your job is to turn business source material into short, sharp signal candidates for The Crackback.

Focus on:
- hidden business engines
- pricing power
- licensing
- platform economics
- recurring revenue
- distribution advantages
- margin expansion
- ecosystem lock-in
- surprising executive admissions

Output exactly 3 candidate signals.

Each candidate must include:
- title
- suggestedHeadline
- signal
- statOrQuote
- whyItMatters
- theCrackback

Rules:
- suggestedHeadline should be punchy and homepage-ready
- theCrackback should sound like a sharp interpretation, not PR
- be concrete, not vague
- do not sound like investor relations copy
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

Punish:
- vagueness
- generic business-news phrasing
- investor-relations language
- weak or obvious observations
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
  const results = []

  for (const company of companies) {
    const source = await getSourceForCompany(company)
    const candidates = await generateCandidates(company)

    let created = 0
    let published = 0
    let skippedDuplicates = 0

    for (const candidate of candidates) {
      const duplicate = await findDuplicate(company._id, candidate)
      if (duplicate) {
        skippedDuplicates += 1
        continue
      }

      const score = await scoreCandidate(company, candidate)

      let status: "suggested" | "approved" | "published" | "rejected" = "suggested"

      if (score.decision === "publish" && score.publishScore >= 80) {
        status = "published"
      } else if (score.decision === "hold" && score.publishScore >= 65) {
        status = "approved"
      } else if (score.decision === "reject" || score.publishScore < 50) {
        status = "rejected"
      }

      await createSignalCandidate(company, candidate, source, status, score.publishScore)
      created += 1

      if (status === "published") {
        published += 1
      }
    }

    await sanity
      .patch(company._id)
      .set({
        lastMinedAt: new Date().toISOString(),
        ...(published > 0 ? { lastCoveredAt: new Date().toISOString() } : {}),
      })
      .commit()

    results.push({
      company: company.name,
      created,
      published,
      skippedDuplicates,
    })
  }

  return NextResponse.json({
    ok: true,
    companiesProcessed: companies.length,
    results,
  })
}