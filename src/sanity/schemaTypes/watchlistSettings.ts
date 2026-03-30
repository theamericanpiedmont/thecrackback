import {defineArrayMember, defineField, defineType} from 'sanity'

export const watchlistSettings = defineType({
  name: 'watchlistSettings',
  title: 'Watchlist Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Crackback Watchlist',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coreWatchlist',
      title: 'Core Watchlist',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'trackedCompany'}],
        }),
      ],
    }),
    defineField({
      name: 'secondaryWatchlist',
      title: 'Secondary Watchlist',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'trackedCompany'}],
        }),
      ],
    }),
    defineField({
      name: 'priorityThemes',
      title: 'Priority Themes',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'activeEarningsSeason',
      title: 'Active Earnings Season',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'editorNotes',
      title: 'Editor Notes',
      type: 'text',
      rows: 5,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Crackback Watchlist Settings',
      }
    },
  },
})