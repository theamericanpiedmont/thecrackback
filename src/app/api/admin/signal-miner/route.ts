import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@sanity/client"

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      companyId,
      companyName,
      primaryAngle,
      squibTriggers = [],
      sourceType,
      sourceTitle,
      sourceUrl,
      sourceText,
      mode = "preview",
    } = body

    if (!companyId || !companyName || !sourceType || !sourceText) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

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

Write tightly, clearly, and concretely.
Do not sound like investor relations copy.
`

    const user = `
Company: ${companyName}
Primary angle: ${primaryAngle || ""}
Squib triggers: ${Array.isArray(squibTriggers) ? squibTriggers.join(", ") : ""}

Source type: ${sourceType}
Source title: ${sourceTitle || ""}
Source URL: ${sourceUrl || ""}

Source text:
"""
${sourceText}
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
    const candidates = parsed.candidates ?? []

    if (mode === "save") {
      const docs = candidates.map((c: any) => ({
        _type: "signalCandidate",
        title: c.title,
        company: { _type: "reference", _ref: companyId },
        sourceType,
        sourceTitle,
        sourceUrl,
        signal: c.signal,
        statOrQuote: c.statOrQuote,
        whyItMatters: c.whyItMatters,
        theCrackback: c.theCrackback,
        suggestedHeadline: c.suggestedHeadline,
        status: "suggested",
        createdFromMinerAt: new Date().toISOString(),
      }))

      const result = await sanity.createOrReplace({
        _id: `signal-run-${Date.now()}`,
        _type: "system.placeholder",
      }).catch(() => null)

      // Create docs individually so failures are easier to debug.
      const created = []
      for (const doc of docs) {
        const saved = await sanity.create(doc)
        created.push(saved)
      }

      return NextResponse.json({ ok: true, candidates, created })
    }

    return NextResponse.json({ ok: true, candidates })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { error: error?.message || "Signal miner failed." },
      { status: 500 }
    )
  }
}