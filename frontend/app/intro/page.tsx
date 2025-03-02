"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function IntroPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Uvod u sekvenciranje antibiotika</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="prose prose-lg">
            <p className="text-muted-foreground mb-6">
              Proces sekvenciranja antibiotika je fundamentalan u razumevanju kako su ovi molekuli proizvedeni od strane
              bakterija i kako se oni mogu sintetizovati ili modifikovani za primene u medicini. Antibiotici su često
              peptidi - kratki proteini odnosno kratak niz aminokiselina, ali mnogo antibiotika, uglavnom neribozomalni
              peptidi (<span className="italic">non-ribosomal peptides - NRPs</span>), ne prati standardna pravila za
              sintezu proteina čime se otežava njihovo sekvenciranje.
            </p>

            <p className="text-muted-foreground mb-6">
              Tradicionalno, proteini prate <span className="font-semibold">Centralnu Dogmu Molekularne biologije</span>
              , koja kaže da se DNK prvo prepisuje u RNK - slika 1, a zatim se RNK prevodi u protein.
            </p>

            <p className="text-muted-foreground mb-6">
              RNK se prevode u proteni tako što se kodoni (triplet nukleotida) prevodi u odgovarajuću aminokiselinu čime nastaje genetski kod.
              Postoje start i stop kodoni koji određuju početak odnosno kraj sekvence koja se prevodi u protein.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] mb-4">
              <Image
                src="/images/dna-rna-transcription.svg"
                alt="DNA to RNA Transcription Process"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Slika 1: Transkripcija DNK u RNK. Enzim RNK polimeraza (nije prikazan) čita DNK lanac i sintetiše komplementarni RNK lanac.
            </p>
          </div>
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
              Algoritam koji održava listu N najboljih kandidata za rešenje i na osnovu njih smanjuje broj potencijalnih
              kandidata.
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
  )
}
