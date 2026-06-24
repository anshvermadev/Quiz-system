import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'E-Cell Quizzes – BVUDET Navi Mumbai',
    template: '%s | E-Cell Quizzes',
  },
  description: 'The official platform for engaging quizzes and competitions by E-Cell BVUDET Navi Mumbai. Test your knowledge and top the leaderboard.',
  keywords: ['E-Cell', 'BVUDET', 'Quiz', 'Competitions', 'Student Club', 'Navi Mumbai'],
  authors: [{ name: 'E-Cell Team' }],
  openGraph: {
    title: 'E-Cell Quizzes – BVUDET Navi Mumbai',
    description: 'The official platform for engaging quizzes and competitions by E-Cell BVUDET Navi Mumbai.',
    siteName: 'E-Cell Quizzes',
    images: [
      {
        url: '/E-cell Logo.svg',
        width: 800,
        height: 600,
        alt: 'E-Cell Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Cell Quizzes – BVUDET Navi Mumbai',
    description: 'The official platform for engaging quizzes and competitions by E-Cell BVUDET Navi Mumbai.',
    images: ['/E-cell Logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=EB+Garamond:ital@0;1&family=Space+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          <QuizProvider>
            <Header />
            {children}
            <Footer />
            <AuthModal />
            <Toaster
              position="top-center"
              toastOptions={{
                className: 'border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black rounded-none',
                style: {
                  background: '#fff',
                  border: '2px solid black',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                },
                success: {
                  iconTheme: {
                    primary: 'black',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
          </QuizProvider>
        </AuthProvider>
      </body>
    </html>
  )
}