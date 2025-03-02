"use client";

import { ArrowRight, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Sekvenciranje antibiotika
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Istraži i vizuelizuj različite pristupe za analiziranje sekvenci antibiotika kroz interaktivni prikaz algoritma.
          </p>
          <Button size="lg" asChild className="text-lg mb-16">
            <Link href="/intro">
              Istraži algoritme <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Razumevanje pristupa</h2>
            <p className="text-muted-foreground mb-4">
              Implementirani su različiti algoritmi za sekvenciranje antibiotika, uz objašnjenje svakog od algoritama kao i koje su to prednosti svakoga od njih.
              Vizuelni pristup omogućava lakše razumevanje rada ovih algoritama.
            </p>
          </div>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Glavne karakteristike</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <PlayCircle className="h-5 w-5 mr-2 text-primary" />
                Interaktivna vizuelizacija algoritma
              </li>
              <li className="flex items-center">
                <PauseCircle className="h-5 w-5 mr-2 text-primary" />
                Korak po korak kontrola izvršavanja algoritma
              </li>
              <li className="flex items-center">
                <RotateCcw className="h-5 w-5 mr-2 text-primary" />
                Ponavljanje i pauziranje izvršavanja algoritma
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}