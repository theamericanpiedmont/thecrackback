import type { Metadata } from "next"
import "./globals.css"

export const metadata = {
  metadataBase: new URL("https://thecrackback.com"),
  title: {
    default: "The Crackback",
    template: "%s | The Crackback",
  },
  description: "The business moves no one saw coming.",
  openGraph: {
    title: "The Crackback",
    description: "The business moves no one saw coming.",
    url: "https://thecrackback.com",
    siteName: "The Crackback",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Crackback",
    description: "The business moves no one saw coming.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}