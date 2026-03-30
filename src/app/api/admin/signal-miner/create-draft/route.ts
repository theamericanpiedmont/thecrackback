import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import OpenAI from "openai"

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type Candidate = {
  title: string
  suggestedHeadline: string
  signal: string
  statOrQuote: string
  whyItMatters: string
  theCrackback: string
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}

function ptKey() {
  return crypto.randomUUID()
}

function makeBlock(style: string, text: string) {
  return {
    _type: "block",
    _key: ptKey(),
    style,
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: ptKey(),
        text,
        marks: [],
      },
    ],
  }
}

async function uploadHeroImage(heroImageUrl?: string) {
  if (!heroImageUrl) return null

  const res = await fetch(heroImageUrl)
  if (!res.ok) {
    throw new Error("Failed to fetch hero image URL")
  }

  const contentType = res.headers.get("content-type") || "image/jpeg"
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
        ? "gif"
        : "jpg"

  const asset = await sanity.assets.upload("image", buffer, {
    filename: `signal-miner-${Date.now()}.${ext}`,
    contentType,
  })

  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id,
    },
  }
}

function splitIntoParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function buildPortableTextFromParagraphs(
  paragraphs: string[],
  sourceTitle?: string,
  sourceUrl?: string
) {
  const blocks = paragraphs.map((p) => makeBlock("normal", p))

  if (sourceTitle || sourceUrl) {
    blocks.push(
      makeBlock(
        "normal",
        `Source: ${sourceTitle || sourceUrl || ""}${sourceUrl ? ` (${sourceUrl})` : ""}`
      )
    )
  }

  return blocks
}

function buildSquibPortableText(
  candidate: Candidate,
  sourceTitle?: string,
  sourceUrl?: string
) {
  const intro = candidate.signal?.trim() || ""
  const quote = candidate.statOrQuote?.trim() || ""
  const why = candidate.whyItMatters?.trim() || ""
  const crackback = candidate.theCrackback?.trim() || ""

  const paragraphs: string[] = []

  if (intro && quote) {
    paragraphs.push(`${intro} ${quote}`)
  } else if (intro) {
    paragraphs.push(intro)
  } else if (quote) {
    paragraphs.push(quote)
  }

  if (why) paragraphs.push(why)
  if (crackback) paragraphs.push(crackback)

  return buildPortableTextFromParagraphs(paragraphs, sourceTitle, sourceUrl)
}

async function generatePostBody(params: {
  candidate: Candidate
  companyName: string
  sourceTitle?: string
  sourceUrl?: string
}) {
  const { candidate, companyName } = params

  const system = `
You are writing a short draft for The Crackback.

The Crackback covers hidden business engines, strategy shifts, platform economics, licensing, pricing power, and the moves inside companies that most people miss.

Write a polished mini-post that feels ready for editing and publication.

Requirements:
- target about 220 to 300 words
- aim for 5 short paragraphs
- no headings
- no bullet points
- no generic throat-clearing
- no hypey newsletter clichés
- no consultant-speak
- no "what this means is" filler
- no "in today's environment" or similar padding
- lead immediately with the most interesting business signal
- use concrete language and specific details
- treat the stat or quote as a telling detail, not a dump
- build toward a clear interpretation of the company's strategy
- final paragraph should land on a sharp concluding insight
- should read like a tight business-analysis post, not notes or a summary

Suggested paragraph rhythm:
1. Lead with the signal and why it is surprising or important.
2. Introduce the key supporting detail, stat, or quote.
3. Explain what that detail reveals about the business.
4. Connect it to the broader company strategy or business model.
5. End with a sharp interpretive conclusion.

Do not include a source line.
Return only the draft text.
`.trim()

  const user = `
Company: ${companyName}

Candidate title: ${candidate.title}
Suggested headline: ${candidate.suggestedHeadline}
Signal: ${candidate.signal}
Stat or quote: ${candidate.statOrQuote}
Why it matters: ${candidate.whyItMatters}
The Crackback: ${candidate.theCrackback}
`.trim()

  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  })

  const text = response.output_text?.trim()

  if (!text) {
    throw new Error("Failed to generate post body")
  }

  return text
}

async function buildPostDraft(params: {
  candidate: Candidate
  companyId: string
  companyName: string
  heroImage: any
  sourceTitle?: string
  sourceUrl?: string
}) {
  const { candidate, companyName, sourceTitle, sourceUrl } = params
  const title = candidate.suggestedHeadline || candidate.title

  const generatedBody = await generatePostBody({
    candidate,
    companyName,
    sourceTitle,
    sourceUrl,
  })

  const paragraphs = splitIntoParagraphs(generatedBody)

  return {
    _id: `drafts.${crypto.randomUUID()}`,
    _type: "crackbackPost",
    title,
    slug: {
      _type: "slug",
      current: slugify(title),
    },
    body: buildPortableTextFromParagraphs(paragraphs, sourceTitle, sourceUrl),
  }
}

function buildSquibDraft(params: {
  candidate: Candidate
  companyId: string
  companyName: string
  heroImage: any
  sourceTitle?: string
  sourceUrl?: string
}) {
  const { candidate, sourceTitle, sourceUrl } = params
  const title = candidate.suggestedHeadline || candidate.title

  return {
    _id: `drafts.${crypto.randomUUID()}`,
    _type: "squib",
    title,
    slug: {
      _type: "slug",
      current: slugify(title),
    },

    // Adjust if your squib schema uses a different value.
    squibType: "story",

    // Adjust if your squib schema uses a different rich text field name.
    body: buildSquibPortableText(candidate, sourceTitle, sourceUrl),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      kind,
      companyId,
      companyName,
      sourceTitle,
      sourceUrl,
      heroImageUrl,
      candidate,
    }: {
      kind: "post" | "squib"
      companyId: string
      companyName: string
      sourceTitle?: string
      sourceUrl?: string
      heroImageUrl?: string
      candidate: Candidate
    } = body

    if (!kind || !companyId || !companyName || !candidate) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    // Keep asset upload alive for future use, but do not attach the image
    // until we map it to the correct schema field.
    if (heroImageUrl) {
      await uploadHeroImage(heroImageUrl)
    }

    const draft =
      kind === "post"
        ? await buildPostDraft({
            candidate,
            companyId,
            companyName,
            heroImage: null,
            sourceTitle,
            sourceUrl,
          })
        : buildSquibDraft({
            candidate,
            companyId,
            companyName,
            heroImage: null,
            sourceTitle,
            sourceUrl,
          })

    const created = await sanity.create(draft)

    return NextResponse.json({
      ok: true,
      createdId: created._id,
      kind,
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { error: error?.message || "Failed to create draft." },
      { status: 500 }
    )
  }
}