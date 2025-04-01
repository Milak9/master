"use client"

import { useState } from "react"
import Link from "next/link"
import { Github, Dna, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
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
              <Link href="/brute_force" className="text-sm font-medium transition-colors hover:text-primary">
                Algoritam grube sile
              </Link>
              <Link href="/branch_and_bound" className="text-sm font-medium transition-colors hover:text-primary">
                Branch & Bound
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium transition-colors hover:text-primary">
                Leaderboard Algoritam
              </Link>
              <Link href="/convolution" className="text-sm font-medium transition-colors hover:text-primary">
                Spektralna konvolucija
              </Link>
              <Link href="/deep_novo" className="text-sm font-medium transition-colors hover:text-primary">
                Deep Novo sekvenciranje
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="https://github.com/Milak9/master"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 mr-4"
            >
              <Github className="h-6 w-6" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-16 bg-background border-b shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/intro"
                className="text-sm font-medium py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Uvod
              </Link>
              <Link
                href="/brute_force"
                className="text-sm font-medium py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Algoritam grube sile
              </Link>
              <Link
                href="/branch_and_bound"
                className="text-sm font-medium py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Branch & Bound
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaderboard Algoritam
              </Link>
              <Link
                href="/convolution"
                className="text-sm font-medium py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Spektralna konvolucija
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
