"use client";

import { ArrowRight, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center max-w-4xl mx-auto mb-8 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 leading-tight">
            Sekvenciranje antibiotika
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-2">
            Istraži i vizuelizuj različite pristupe za analiziranje sekvenci antibiotika kroz interaktivni prikaz algoritma.
          </p>
          <Button size="lg" asChild className="text-base md:text-lg mb-8 md:mb-16 w-full sm:w-auto">
            <Link href="/intro" className="flex items-center justify-center">
              Istraži algoritme <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="px-2">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Razumevanje pristupa</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Implementirani su različiti algoritmi za sekvenciranje antibiotika, uz objašnjenje svakog od algoritama kao i koje su to prednosti svakoga od njih.
              Vizuelni pristup omogućava lakše razumevanje rada ovih algoritama.
            </p>
          </div>
          <Card className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Glavne karakteristike</h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-center text-sm md:text-base">
                <PlayCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary flex-shrink-0" />
                <span>Interaktivna vizuelizacija algoritma</span>
              </li>
              <li className="flex items-center text-sm md:text-base">
                <PauseCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary flex-shrink-0" />
                <span>Korak po korak kontrola izvršavanja algoritma</span>
              </li>
              <li className="flex items-center text-sm md:text-base">
                <RotateCcw className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary flex-shrink-0" />
                <span>Ponavljanje i pauziranje izvršavanja algoritma</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}