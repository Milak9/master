"use client";

import { ArrowRight, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function IntroPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Uvod u sekvenciranje antibiotika</h1>
        
        <div className="prose prose-lg max-w-4xl mb-12">
          <p className="text-muted-foreground mb-6">
            Dodaj uvod  
          </p>

        </div>

        <h2 className="text-2xl font-semibold mb-6">Dostupni algoritmi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Algoritam grube sile</h3>
            <p className="text-muted-foreground mb-4">
              Direktan pristup gde se isprobavaju sve moguće kombinacije da bi se našlo optimalno rešenje.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/brute-force">
                Istraži <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Branch & Bound</h3>
            <p className="text-muted-foreground mb-4">
              Optimizovan algoritam koji će odbacivati kandidate čim prestanu da budu potencijalno rešenje.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/branch-and-bound">
                Istraži <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Score Algoritam</h3>
            <p className="text-muted-foreground mb-4">
              Algoritam koji održava listu N najboljih kandidata za rešenje i na osnovu njih smanjuje broj potencijalnih kandidata.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/score">
                Istraži <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Spektralna konvolucija</h3>
            <p className="text-muted-foreground mb-4">
              Određivanje amino-kiselina koje mogu da učestvuju u peptidu na osnovu eksperimentalnog spektra.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/convolution">
                Istraži <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}