// sanity/lib/queries.ts

export const crackbackHomeQuery = /* groq */ `
{
  "latestPost": *[
    _type == "crackbackPost" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    dek,
    company,
    coverImage
  },

  "recentPosts": *[
    _type == "crackbackPost" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[1...10]{
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