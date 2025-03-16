"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Dna } from "lucide-react"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [dnaPosition, setDnaPosition] = useState(0)

  // Animate the DNA icon
  useEffect(() => {
    const interval = setInterval(() => {
      setDnaPosition((prev) => (prev + 1) % 100)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-accent/20 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative h-32 w-full overflow-hidden mb-8">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `translateX(${dnaPosition % 2 === 0 ? 5 : -5}px)` }}
          >
            <Dna className="h-32 w-32 text-primary/80 animate-pulse" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <h1 className="text-9xl font-extrabold text-primary/90">404</h1>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-foreground">Sekvenca nije pronađena</h2>

        <p className="text-muted-foreground text-lg mt-4 mb-8">
          Tražena stranica ne postoji u našoj bazi podataka. Možda je došlo do mutacije u URL-u?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Početna</span>
            </Link>
          </Button>

          <Button asChild size="lg" className="gap-2">
            <Link href="/intro">
              <ArrowLeft className="h-4 w-4" />
              <span>Uvod u sekvenciranje</span>
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Probajte da istražite neke od naših algoritama za sekvenciranje antibiotika
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <Link
              href="/brute-force"
              className="text-sm px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Algoritam grube sile
            </Link>
            <Link
              href="/branch-and-bound"
              className="text-sm px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Branch & Bound
            </Link>
            <Link
              href="/score"
              className="text-sm px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Score algoritam
            </Link>
            <Link
              href="/convolution"
              className="text-sm px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Spektralna konvolucija
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

