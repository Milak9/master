import "./globals.css"
import type React from "react"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from "@/components/header"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sekvenciranje antibiotika',
  description: 'Interaktivna vizuelizacija algoritama za sekvencioniranje antibiotika',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}

