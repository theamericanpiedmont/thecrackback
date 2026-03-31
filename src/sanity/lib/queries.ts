// file: sanity/lib/queries.ts

export const crackbackHomeQuery = /* groq */ `
{
  "latestCrackback": *[
    _type == "crackback" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    !(_id in path("drafts.**"))
  ] | order(coalesce(number, 0) desc, publishedAt desc)[0]{
    _id,
    title,
    number,
    "slug": slug.current,
    publishedAt,
    dek,
    company,
    heroImage
  },

  "recentPosts": *[
    _type == "crackbackPost" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[0...10]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    dek,
    company,
    coverImage
  },

  "squibs": *[
    _type == "squib" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[0...10]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    squibType,
    summary,
    sourceUrl,
    sourceName,
    quoteText,
    attribution,
    image,
    socialPlatform,
    socialHandle
  }
}
`

export const squibBySlugQuery = /* groq */ `
*[
  _type == "squib" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  squibType,
  summary,
  sourceUrl,
  sourceName,
  quoteText,
  attribution,
  image,
  socialPlatform,
  socialHandle
}
`

export const crackbacksIndexQuery = /* groq */ `
*[
  _type == "crackback" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  !(_id in path("drafts.**"))
] | order(coalesce(number, 0) desc, publishedAt desc)[0...50]{
  _id,
  title,
  number,
  "slug": slug.current,
  publishedAt,
  dek,
  company,
  heroImage
}
`

// file: sanity/lib/queries.ts
export const crackbackBySlugQuery = /* groq */ `
*[
  _type == "crackback" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  _id,
  title,
  number,
  "slug": slug.current,
  publishedAt,
  dek,
  company,
  heroImage,
  body,
  author->{
    name
  }
}
`

export const crackbackPostsIndexQuery = /* groq */ `
*[
  _type == "crackbackPost" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  !(_id in path("drafts.**"))
] | order(publishedAt desc)[0...50]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  dek,
  company,
  coverImage
}
`

export const crackbackPostBySlugQuery = /* groq */ `
*[
  _type == "crackbackPost" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  dek,
  company,
  coverImage,
  body
}
`

export const squibsQuery = /* groq */ `
*[
  _type == "squib" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  !(_id in path("drafts.**"))
] | order(publishedAt desc)[0...10]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  squibType,
  summary,
  sourceUrl,
  sourceName,
  quoteText,
  attribution,
  image,
  socialPlatform,
  socialHandle
}
`

export const crackbackSignalsQuery = /* groq */ `
*[
  _type == "signalCandidate" &&
  status == "published" &&
  defined(slug.current) &&
  !(_id in path("drafts.**"))
] | order(coalesce(publishedAt, createdFromMinerAt, _createdAt) desc)[0...6]{
  _id,
  "title": coalesce(suggestedHeadline, title),
  "slug": slug.current,
  "summary": coalesce(theCrackback, whyItMatters, signal),
  signal,
  whyItMatters,
  theCrackback,
  statOrQuote,
  sourceType,
  sourceTitle,
  sourceUrl,
  publishedAt,
  createdFromMinerAt,
  "company": company->name,
  "companyTicker": company->ticker
}
`

export const crackbackSignalsIndexQuery = /* groq */ `
*[
  _type == "signalCandidate" &&
  status == "published" &&
  defined(slug.current) &&
  !(_id in path("drafts.**"))
] | order(coalesce(publishedAt, createdFromMinerAt, _createdAt) desc)[0...100]{
  _id,
  "title": coalesce(suggestedHeadline, title),
  "slug": slug.current,
  "summary": coalesce(theCrackback, whyItMatters, signal),
  signal,
  whyItMatters,
  theCrackback,
  statOrQuote,
  sourceType,
  sourceTitle,
  sourceUrl,
  publishedAt,
  createdFromMinerAt,
  publishScore,
  "company": company->name,
  "companyTicker": company->ticker
}
`

export const crackbackSignalBySlugQuery = /* groq */ `
*[
  _type == "signalCandidate" &&
  status == "published" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  _id,
  title,
  suggestedHeadline,
  "slug": slug.current,
  signal,
  whyItMatters,
  theCrackback,
  statOrQuote,
  sourceType,
  sourceTitle,
  sourceUrl,
  publishedAt,
  createdFromMinerAt,
  publishScore,
  "company": company->name,
  "companyTicker": company->ticker
}
`