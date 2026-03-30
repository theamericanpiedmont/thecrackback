"use client"

import { useEffect, useState } from "react"
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
})

type Company = {
  _id: string
  name: string
  ticker: string
  primaryAngle?: string
  squibTriggers?: string[]
}

type Candidate = {
  title: string
  suggestedHeadline: string
  signal: string
  statOrQuote: string
  whyItMatters: string
  theCrackback: string
}

export default function SignalMinerPane() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyId] = useState("")
  const [sourceType, setSourceType] = useState("earnings-transcript")
  const [sourceTitle, setSourceTitle] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [sourceText, setSourceText] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftingIndex, setDraftingIndex] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    client
      .fetch(`
        *[_type == "trackedCompany" && coverageStatus == "active"]
        | order(name asc) {
          _id,
          name,
          ticker,
          primaryAngle,
          squibTriggers
        }
      `)
      .then(setCompanies)
  }, [])

  const selected = companies.find((c) => c._id === companyId)

  async function runMiner(mode: "preview" | "save") {
    if (!selected || !sourceText.trim()) return

    if (mode === "preview") setLoading(true)
    if (mode === "save") setSaving(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/admin/signal-miner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selected._id,
          companyName: selected.name,
          primaryAngle: selected.primaryAngle,
          squibTriggers: selected.squibTriggers || [],
          sourceType,
          sourceTitle,
          sourceUrl,
          sourceText,
          mode,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Request failed")

      setCandidates(json.candidates || [])
      if (mode === "save") {
        setMessage("Saved signal candidates to Sanity.")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
      setSaving(false)
    }
  }

  async function createDraft(kind: "post" | "squib", candidate: Candidate, index: number) {
    if (!selected) return

    setDraftingIndex(index)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/admin/signal-miner/create-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          companyId: selected._id,
          companyName: selected.name,
          sourceType,
          sourceTitle,
          sourceUrl,
          heroImageUrl,
          candidate,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Draft creation failed")

      setMessage(`${kind === "post" ? "Post" : "Squib"} draft created.`)
    } catch (err: any) {
      setError(err.message || "Failed to create draft")
    } finally {
      setDraftingIndex(null)
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Signal Miner</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ marginBottom: 6 }}>Company</div>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">Select a company</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.ticker})
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Source Type</div>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="earnings-transcript">Earnings Transcript</option>
            <option value="investor-presentation">Investor Presentation</option>
            <option value="shareholder-letter">Shareholder Letter</option>
            <option value="sec-filing">SEC Filing</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Source Title</div>
          <input
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            placeholder="Q1 2026 Earnings Call Transcript"
          />
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Source URL</div>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            placeholder="https://..."
          />
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Hero Image URL (optional)</div>
          <input
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            placeholder="Direct image URL for heroImage import"
          />
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Source Text</div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={16}
            style={{ width: "100%", padding: 8, fontFamily: "monospace" }}
            placeholder="Paste transcript text, shareholder letter text, or investor presentation notes here..."
          />
        </label>

        {selected ? (
          <div style={{ fontSize: 13, color: "#666" }}>
            <strong>Primary angle:</strong> {selected.primaryAngle || "—"}
            <br />
            <strong>Squib triggers:</strong>{" "}
            {(selected.squibTriggers || []).join(", ") || "—"}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => runMiner("preview")}
            disabled={loading || saving || !companyId || !sourceText.trim()}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            {loading ? "Generating..." : "Generate candidates"}
          </button>

          <button
            onClick={() => runMiner("save")}
            disabled={loading || saving || !companyId || !sourceText.trim()}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            {saving ? "Saving..." : "Generate + Save candidates"}
          </button>
        </div>

        {error ? <div style={{ color: "crimson", fontSize: 14 }}>{error}</div> : null}
        {message ? <div style={{ color: "green", fontSize: 14 }}>{message}</div> : null}
      </div>

      {candidates.length > 0 ? (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Candidates</h3>
          <div style={{ display: "grid", gap: 16 }}>
            {candidates.map((c, i) => (
              <div
                key={`${c.title}-${i}`}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Suggested headline:</strong> {c.suggestedHeadline}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Signal:</strong> {c.signal}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Stat or quote:</strong> {c.statOrQuote}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Why it matters:</strong> {c.whyItMatters}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <strong>The Crackback:</strong> {c.theCrackback}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => createDraft("squib", c, i)}
                    disabled={draftingIndex === i}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    {draftingIndex === i ? "Drafting..." : "Draft Squib"}
                  </button>

                  <button
                    onClick={() => createDraft("post", c, i)}
                    disabled={draftingIndex === i}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    {draftingIndex === i ? "Drafting..." : "Draft Post"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}