import {defineField, defineType} from "sanity"

export const crackbackPostType = defineType({
  name: "crackbackPost",
  title: "Crackback Post",
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
      name: "dek",
      title: "Dek",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "company",
      title: "Company",
      type: "string",
    }),

    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
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
    }),

    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
  ],
})