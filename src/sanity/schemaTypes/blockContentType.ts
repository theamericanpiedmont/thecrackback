import { defineType, defineArrayMember } from "sanity"

export const blockContentType = defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "Blockquote", value: "blockquote" },
        { title: "Indented Quote", value: "quoteIndent" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
            ],
          },
        ],
      },
    }),

    defineArrayMember({
      type: "storyImage",
    }),

    defineArrayMember({
      type: "pullQuote",
    }),

    defineArrayMember({
      type: "sidenote",
    }),

    defineArrayMember({
      type: "gallery",
    }),

    defineArrayMember({
      type: "sectionBreak",
    }),
  ],
})