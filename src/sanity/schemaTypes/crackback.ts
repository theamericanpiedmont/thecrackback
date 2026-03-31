// file: src/sanity/schemaTypes/crackback.ts
import {defineField, defineType} from "sanity"

export default defineType({
  name: "crackback",
  title: "Crackback",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "number",
      title: "Crackback Number",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
      description: "Use 1 for Crackback #001, 2 for #002, etc.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {source: "title", maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
    }),

// file: src/sanity/schemaTypes/crackback.ts
defineField({
  name: "author",
  title: "Author",
  type: "reference",
  to: [{ type: "author" }],
}),

    defineField({
      name: "dek",
      title: "Dek",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: {hotspot: true},
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      number: "number",
      media: "heroImage",
    },
    prepare({title, number, media}) {
      const label =
        typeof number === "number"
          ? `Crackback #${String(number).padStart(3, "0")}`
          : "Crackback"

      return {
        title,
        subtitle: label,
        media,
      }
    },
  },
  orderings: [
    {
      title: "Number, newest first",
      name: "numberDesc",
      by: [{field: "number", direction: "desc"}],
    },
    {
      title: "Published date, newest first",
      name: "publishedAtDesc",
      by: [{field: "publishedAt", direction: "desc"}],
    },
  ],
})