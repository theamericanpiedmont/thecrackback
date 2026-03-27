import {defineField, defineType} from "sanity"

export const squibType = defineType({
  name: "squib",
  title: "Squib",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {source: "title"},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "squibType",
      title: "Squib Type",
      type: "string",
      options: {
        list: [
          {title: "Quote", value: "quote"},
          {title: "Image", value: "image"},
          {title: "Story", value: "story"},
          {title: "Social Post", value: "social"},
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "summary",
      title: "Summary / Description",
      type: "text",
      rows: 4,
      description: "Used for story squibs and optional support text for other types.",
      hidden: ({document}) => document?.squibType === "quote",
    }),

    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      description: "Where the full item lives externally.",
      validation: (Rule) => Rule.required().uri({
        allowRelative: false,
        scheme: ["http", "https"],
      }),
    }),

    defineField({
      name: "sourceName",
      title: "Source Name",
      type: "string",
      description: "Optional: publication, company, account name, etc.",
    }),

    defineField({
      name: "quoteText",
      title: "Quote Text",
      type: "text",
      rows: 5,
      hidden: ({document}) => document?.squibType !== "quote",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.squibType === "quote" && !value) {
            return "Quote Text is required for Quote squibs."
          }
          return true
        }),
    }),

    defineField({
  name: "attribution",
  title: "Attribution",
  type: "string",
  hidden: ({ document }) => {
    const squibType = document?.squibType
    return squibType !== "quote" && squibType !== "social"
  },
}),

    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {hotspot: true},
      hidden: ({document}) => document?.squibType !== "image",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.squibType === "image" && !value) {
            return "Image is required for Image squibs."
          }
          return true
        }),
    }),

    defineField({
      name: "socialPlatform",
      title: "Social Platform",
      type: "string",
      options: {
        list: [
          {title: "X", value: "x"},
          {title: "Bluesky", value: "bluesky"},
          {title: "Threads", value: "threads"},
          {title: "Facebook", value: "facebook"},
        ],
      },
      hidden: ({document}) => document?.squibType !== "social",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.squibType === "social" && !value) {
            return "Social Platform is required for Social Post squibs."
          }
          return true
        }),
    }),

    defineField({
      name: "socialHandle",
      title: "Social Handle",
      type: "string",
      hidden: ({document}) => document?.squibType !== "social",
    }),
  ],
  preview: {
    select: {
      title: "title",
      squibType: "squibType",
      sourceName: "sourceName",
    },
    prepare({title, squibType, sourceName}) {
      return {
        title: title || "Untitled Squib",
        subtitle: [squibType, sourceName].filter(Boolean).join(" · "),
      }
    },
  },
})