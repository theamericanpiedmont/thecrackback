// file: src/sanity/structure.ts
import type { StructureResolver } from "sanity/structure"
import AutomationPane from "@/sanity/components/AutomationPane"
import EarningsRadarPane from "@/sanity/components/EarningsRadarPane"
import SignalMinerPane from "@/sanity/components/SignalMinerPane"

export const structure: StructureResolver = (S) =>
  S.list()
    .title("The Crackback")
    .items([
      S.listItem()
        .title("Crackbacks")
        .schemaType("crackback")
        .child(
          S.documentTypeList("crackback")
            .title("Crackbacks")
            .defaultOrdering([{ field: "number", direction: "desc" }])
        ),

      S.listItem()
        .title("Posts")
        .schemaType("crackbackPost")
        .child(
          S.documentTypeList("crackbackPost")
            .title("Posts")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),

      S.listItem()
        .title("Squibs")
        .schemaType("squib")
        .child(
          S.documentTypeList("squib")
            .title("Squibs")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),

      S.listItem()
        .title("Signal Candidates")
        .schemaType("signalCandidate")
        .child(
          S.documentTypeList("signalCandidate")
            .title("Signal Candidates")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),

      S.divider(),

      S.listItem()
        .title("Crackback Watchlist")
        .child(
          S.list()
            .title("Crackback Watchlist")
            .items([
              S.listItem()
                .title("Tracked Companies")
                .schemaType("trackedCompany")
                .child(
                  S.documentTypeList("trackedCompany").title("Tracked Companies")
                ),

              S.listItem()
                .title("Watchlist Settings")
                .schemaType("watchlistSettings")
                .child(
                  S.document()
                    .schemaType("watchlistSettings")
                    .documentId("watchlistSettings")
                    .title("Watchlist Settings")
                ),
            ])
        ),

      S.divider(),

      S.listItem()
        .title("Earnings Radar")
        .child(
          S.component(EarningsRadarPane).title("Earnings Radar")
        ),

      S.listItem()
        .title("Signal Miner")
        .child(
          S.component(SignalMinerPane).title("Signal Miner")
        ),

      S.listItem()
        .title("Automation")
        .child(
          S.component(AutomationPane).title("Automation")
        ),

      S.divider(),

      S.listItem()
        .title("Taxonomy")
        .child(
          S.list()
            .title("Taxonomy")
            .items([
              S.documentTypeListItem("author").title("Authors"),
              S.documentTypeListItem("section").title("Sections"),
            ])
        ),
    ])