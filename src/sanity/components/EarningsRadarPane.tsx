"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
})

type Company = {
  name: string
  ticker: string
  nextEarningsDate?: string
  lastEarningsDate?: string
  primaryAngle?: string
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function inRange(dateStr: string | undefined, start: Date, end: Date) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d >= start && d <= end
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function Section({
  title,
  items,
  dateField,
}: {
  title: string
  items: Company[]
  dateField: "nextEarningsDate" | "lastEarningsDate"
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>{title}</h3>

      {items.length === 0 ? (
        <div style={{ color: "#666", fontSize: 14 }}>None</div>
      ) : (
        <div>
          {items.map((c) => (
            <div
              key={`${c.ticker}-${c[dateField] ?? ""}`}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {c.name} ({c.ticker})
              </div>
              <div style={{ fontSize: 14, marginTop: 2 }}>
                {formatDate(c[dateField])}
              </div>
              {c.primaryAngle ? (
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                  {c.primaryAngle}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EarningsRadarPane() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    const query = `
      *[_type == "trackedCompany"] | order(name asc) {
        name,
        ticker,
        nextEarningsDate,
        lastEarningsDate,
        primaryAngle
      }
    `
    client.fetch(query).then(setCompanies)
  }, [])

  const { thisWeek, next30, recentlyReported } = useMemo(() => {
    const today = startOfDay(new Date())
    const endOfWeek = addDays(today, 7)
    const endOf30 = addDays(today, 30)
    const sevenDaysAgo = addDays(today, -7)

    const thisWeek = companies
      .filter((c) => inRange(c.nextEarningsDate, today, endOfWeek))
      .sort(
        (a, b) =>
          new Date(a.nextEarningsDate!).getTime() -
          new Date(b.nextEarningsDate!).getTime()
      )

    const next30 = companies
      .filter((c) => inRange(c.nextEarningsDate, addDays(endOfWeek, 1), endOf30))
      .sort(
        (a, b) =>
          new Date(a.nextEarningsDate!).getTime() -
          new Date(b.nextEarningsDate!).getTime()
      )

    const recentlyReported = companies
      .filter((c) => inRange(c.lastEarningsDate, sevenDaysAgo, today))
      .sort(
        (a, b) =>
          new Date(b.lastEarningsDate!).getTime() -
          new Date(a.lastEarningsDate!).getTime()
      )

    return { thisWeek, next30, recentlyReported }
  }, [companies])

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Earnings Radar</h2>

      <Section
        title="Earnings This Week"
        items={thisWeek}
        dateField="nextEarningsDate"
      />

      <Section
        title="Next 30 Days"
        items={next30}
        dateField="nextEarningsDate"
      />

      <Section
        title="Recently Reported"
        items={recentlyReported}
        dateField="lastEarningsDate"
      />
    </div>
  )
}