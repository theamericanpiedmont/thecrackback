import {defineField, defineType} from 'sanity'

export const signalCandidate = defineType({
  name: 'signalCandidate',
  title: 'Signal Candidate',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'publishScore',
      title: 'Publish Score',
      type: 'number',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'reference',
      to: [{type: 'trackedCompany'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceType',
      title: 'Source Type',
      type: 'string',
      options: {
        list: [
          {title: 'Earnings Transcript', value: 'earnings-transcript'},
          {title: 'Investor Presentation', value: 'investor-presentation'},
          {title: 'Shareholder Letter', value: 'shareholder-letter'},
          {title: 'SEC Filing', value: 'sec-filing'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceTitle',
      title: 'Source Title',
      type: 'string',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    }),
    defineField({
      name: 'signal',
      title: 'Signal',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statOrQuote',
      title: 'Stat or Quote',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'whyItMatters',
      title: 'Why It Matters',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'theCrackback',
      title: 'The Crackback',
      type: 'text',
      rows: 4,
      description: 'Your core interpretation of the business move.',
    }),
    defineField({
      name: 'suggestedHeadline',
      title: 'Suggested Headline',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Suggested', value: 'suggested'},
          {title: 'Approved', value: 'approved'},
          {title: 'Published', value: 'published'},
          {title: 'Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
      initialValue: 'suggested',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'createdFromMinerAt',
      title: 'Created From Miner At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'suggestedHeadline',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle,
      }
    },
  },
})