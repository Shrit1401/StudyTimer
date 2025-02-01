import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Study Timer STUDY',
  description: 'study my boi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <script async src="https://cdn.seline.so/seline.js" data-token="258f27de7e76d0d"></script>
      <body>{children}</body>
    </html>
  )
}
