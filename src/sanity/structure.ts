// src/sanity/structure.ts
import type { StructureResolver } from "sanity/structure"
import AutomationPane from "@/sanity/components/AutomationPane"

export const structure: StructureResolver = (S) =>
  S.list()
    .title("The Crackback")
    .items([
      S.listItem()
        .title("Posts")
        .schemaType("crackbackPost")
        .child(
          S.documentTypeList("crackbackPost").title("Posts")
        ),

      S.listItem()
        .title("Squibs")
        .schemaType("squib")
        .child(
          S.documentTypeList("squib").title("Squibs")
        ),

      S.divider(),

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