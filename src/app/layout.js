import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ATS-Lite - AI Recruitment Assistant',
  description: 'Find the perfect candidates for your team',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-warm-white text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
