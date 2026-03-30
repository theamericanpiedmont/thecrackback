import {defineField, defineType} from 'sanity'

export const trackedCompany = defineType({
  name: 'trackedCompany',
  title: 'Tracked Company',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Company Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ticker',
      title: 'Ticker',
      type: 'string',
      validation: (rule) => rule.required().max(10),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sector',
      title: 'Sector',
      type: 'string',
      options: {
        list: [
          {title: 'Platform / Tech', value: 'platform-tech'},
          {title: 'Retail / Consumer', value: 'retail-consumer'},
          {title: 'Entertainment / IP', value: 'entertainment-ip'},
          {title: 'Payments / Commerce', value: 'payments-commerce'},
          {title: 'Industrial / Logistics', value: 'industrial-logistics'},
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subsector',
      title: 'Subsector',
      type: 'string',
    }),
    defineField({
      name: 'crackbackPriority',
      title: 'Crackback Priority',
      type: 'string',
      options: {
        list: [
          {title: 'High', value: 'high'},
          {title: 'Medium', value: 'medium'},
          {title: 'Low', value: 'low'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverageStatus',
      title: 'Coverage Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Watch', value: 'watch'},
          {title: 'Paused', value: 'paused'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryAngle',
      title: 'Primary Angle',
      type: 'string',
      description: 'Examples: licensing, subscriptions, platform, pricing power, retail flywheel',
    }),
    defineField({
      name: 'whyItMatters',
      title: 'Why It Matters',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'investorRelationsUrl',
      title: 'Investor Relations URL',
      type: 'url',
    }),
    defineField({
      name: 'earningsCalendarUrl',
      title: 'Earnings Calendar URL',
      type: 'url',
    }),
    defineField({
      name: 'isCoreWatchlist',
      title: 'Core Watchlist',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'lastEarningsDate',
      title: 'Last Earnings Date',
      type: 'datetime',
    }),
    defineField({
      name: 'nextEarningsDate',
      title: 'Next Earnings Date',
      type: 'datetime',
    }),
    defineField({
      name: 'lastCoveredAt',
      title: 'Last Covered At',
      type: 'datetime',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 5,
    }),
  ],
  orderings: [
    {
      title: 'Name A–Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Priority',
      name: 'priorityDesc',
      by: [{field: 'crackbackPriority', direction: 'asc'}, {field: 'name', direction: 'asc'}],
    },
    {
      title: 'Next earnings',
      name: 'nextEarningsAsc',
      by: [{field: 'nextEarningsDate', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      ticker: 'ticker',
      priority: 'crackbackPriority',
      status: 'coverageStatus',
    },
    prepare({title, ticker, priority, status}) {
      const bits = [ticker, priority, status].filter(Boolean)
      return {
        title,
        subtitle: bits.join(' • '),
      }
    },
  },
})