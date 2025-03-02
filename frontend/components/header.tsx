"use client"

import Link from "next/link"
import { Github, Dna } from "lucide-react"

export function Header() {

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80">
              <Dna className="h-6 w-6" />
            </Link>
            <div className="hidden md:flex space-x-8 ml-10">
              <Link href="/intro" className="text-sm font-medium transition-colors hover:text-primary">
                Uvod
              </Link>
              <Link href="/brute-force" className="text-sm font-medium transition-colors hover:text-primary">
                Algoritam grube sile
              </Link>
              <Link href="/branch-and-bound" className="text-sm font-medium transition-colors hover:text-primary">
                Branch & Bound
              </Link>
              <Link href="/score" className="text-sm font-medium transition-colors hover:text-primary">
                Score Algoritam
              </Link>
              <Link href="/convolution" className="text-sm font-medium transition-colors hover:text-primary">
                Spektralna konvolucija
              </Link>
            </div>
          </div>
          <div>
            <Link 
              href="https://github.com/Milak9/master"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <Github className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

