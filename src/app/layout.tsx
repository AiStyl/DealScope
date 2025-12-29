import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealScope | AI-Powered M&A Due Diligence',
  description: 'Multi-model AI orchestration platform for M&A due diligence. Claude, GPT-4, and Gemini working together to provide deeper insights.',
  keywords: ['M&A', 'due diligence', 'AI', 'Claude', 'GPT-4', 'Gemini', 'multi-model', 'consensus'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
