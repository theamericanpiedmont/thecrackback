import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
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

function buildPortableText(
  candidate: Candidate,
  companyName: string,
  sourceTitle?: string,
  sourceUrl?: string
) {
  const blocks: any[] = [makeBlock("normal", candidate.signal)]

  if (candidate.statOrQuote) {
    blocks.push(makeBlock("blockquote", candidate.statOrQuote))
  }

  blocks.push(makeBlock("h3", "What matters"))
  blocks.push(makeBlock("normal", candidate.whyItMatters))
  blocks.push(makeBlock("h3", "The Crackback"))
  blocks.push(makeBlock("normal", candidate.theCrackback))

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

function buildPostDraft(params: {
  candidate: Candidate
  companyId: string
  companyName: string
  heroImage: any
  sourceTitle?: string
  sourceUrl?: string
}) {
  const { candidate, companyName, sourceTitle, sourceUrl } = params
  const title = candidate.suggestedHeadline || candidate.title

  return {
    _id: `drafts.${crypto.randomUUID()}`,
    _type: "crackbackPost",
    title,
    slug: {
      _type: "slug",
      current: slugify(title),
    },
    body: buildPortableText(candidate, companyName, sourceTitle, sourceUrl),
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

    // You may need to adjust this to match your squib schema exactly.
    squibType: "story",

    // You may also need to adjust "body" if your squib schema uses a different field name.
    body: buildPortableText(candidate, params.companyName, sourceTitle, sourceUrl),
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
    // until we map it to the real schema field.
    if (heroImageUrl) {
      await uploadHeroImage(heroImageUrl)
    }

    const draft =
      kind === "post"
        ? buildPostDraft({
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