"use client"

import { ArrowRight, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

export default function IntroPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const openLightbox = (imageSrc: string) => {
    setLightboxImage(imageSrc)
    document.body.style.overflow = "hidden" // Prevent scrolling when lightbox is open
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    document.body.style.overflow = "" // Restore scrolling
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Uvod u sekvenciranje antibiotika</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg mb-6">
              <p className="text-muted-foreground mb-6">
                Proces sekvenciranja antibiotika je fundamentalan u razumevanju kako su ovi molekuli proizvedeni od
                strane bakterija i kako se oni mogu sintetizovati ili modifikovani za primene u medicini. Antibiotici su
                često peptidi - kratki proteini odnosno kratak niz aminokiselina, ali mnogo antibiotika, uglavnom
                neribozomalni peptidi (<span className="italic">non-ribosomal peptides - NRPs</span>), ne prati
                standardna pravila za sintezu proteina čime se otežava njihovo sekvenciranje.
              </p>

              <p className="text-muted-foreground mb-6">
                Tradicionalno, proteini prate{" "}
                <span className="font-semibold">Centralnu Dogmu Molekularne biologije</span>, koja kaže da se DNK prvo
                prepisuje u RNK - slika 1, a zatim se RNK prevodi u protein.
              </p>

              <p className="text-muted-foreground mb-6">
                RNK se prevode u proteni tako što se kodoni (triplet nukleotida) prevodi u odgovarajuću aminokiselinu
                (slika 2) čime nastaje genetski kod. Postoje start i stop kodoni koji određuju početak odnosno kraj
                sekvence koja se prevodi u protein.
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => openLightbox("/images/RNA-Codon-Wheel.png")}
                  className="relative w-full max-w-xs mx-auto aspect-square mb-2 cursor-pointer group"
                  aria-label="Otvori sliku u punoj veličini"
                >
                  <Image
                    src="/images/RNA-Codon-Wheel.png"
                    alt="RNK Kodoni"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="sr-only">Klikni da uvećaš</span>
                  </div>
                </button>
                <p className="text-sm text-muted-foreground text-center">
                  Slika 2: RNK kodonski točak prikazuje kako se sekvence od tri nukleotida (kodoni) prevode u
                  aminokiseline. Svaki kodon se čita od centra ka spolja, a zeleni trougao označava start kodon (AUG)
                  koji kodira metionin, dok crveni kvadrati označavaju stop kodone (UAA, UAG, UGA) koji određuju kraj
                  sekvence koja se prevodi u protein.
                  <span className="text-xs block text-primary-foreground/70 italic mt-1">
                    Kliknite na sliku za uvećani prikaz
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => openLightbox("/images/dna-rna-transcription.svg")}
              className="relative w-full aspect-[4/3] mb-4 cursor-pointer group"
              aria-label="Open DNA to RNA Transcription image in full size"
            >
              <Image
                src="/images/dna-rna-transcription.svg"
                alt="Transkripcija DNK u RNK"
                fill
                style={{ objectFit: "contain" }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="sr-only">Klikni da uvećaš</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground text-center">
              Slika 1: Transkripcija DNK u RNK. Enzim RNK polimeraza (nije prikazan) čita DNK lanac i sintetiše
              komplementarni RNK lanac.
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Odstupanje od centralne dogme</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg">
              <p className="text-muted-foreground mb-6">
                Naučnici su probali da pronađu 30-gram u genomu <span className="italic">Bacillus brevis</span>
                koji se prepisuje i prevodi u antibiotik tirocidin B1. Tirocidin je cikličan peptid dužine 10 (slika 3),
                što znači da postoji njegovih 10 različitih linearnih reprezentacija. Analiziranjem genoma utvrđeno je
                da ne postoji 30-gram koji se kodira u neki od 10 različitih reprenzatacija traženog antibiotika.
              </p>

              <p className="text-muted-foreground mb-6">
                Naučnik Edvard Tatum je ihhibirao (blokirao) ribozom bakterije{" "}
                <span className="italic">Bacillus brevis</span> čime je očekivao da prestane proizvodnja proteina. Na
                njegovo iznenađenje, nastavljena je proizvodnja nekih peptida među kojima je i Tirocidin. Ovime je
                utvrđeno da postoje peptidi koji odstupaju od centralne dogme molekularne biologije.
              </p>

              <p className="text-muted-foreground mb-6">
                Biohemičar Fric Lipman je pokazao da su tirocidini{" "}
                <span className="font-semibold">ne-ribozomalni peptidi (NRP-ovi)</span>, odnosno za njihovu sintezu nisu
                odgovorni ribozomi već enzimi <span className="font-semibold">NRP sintetaze</span>. Zbog ovoga metode za
                sekvencioniranje DNK nisu od pomoći nego mora direktno sam peptid da se sekvencionira.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => openLightbox("/images/tyrocidine.svg")}
              className="relative w-full max-w-xs mx-auto aspect-square mb-2 cursor-pointer group"
              aria-label="Open Tyrocidine structure image in full size"
            >
              <Image
                src="/images/tyrocidine.svg"
                alt="Ciklična struktura tirocidina"
                fill
                style={{ objectFit: "contain" }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="sr-only">Klikni da uvećaš</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground text-center">
              Slika 3: Struktura tirocidina B1, cikličnog peptida sastavljenog od 10 aminokiselina.
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Maseni spektrometar</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg">
              <p className="text-muted-foreground mb-6">
                Maseni spektrometar je moćan alat pomoću koga mogu da se odrede mase molekula, uključujući mase peptida
                i proteina. Omogućava naučnicima da odrede nepoznate komponente, saznaju strukturu molekula i
                analiziraju kompleksne uzorke. Maseni spektrometar radi tako što mu se da više uzoraka istog peptida a
                on napravi sve moguće podpeptide datog peptida i odredi njihove mase. U realnosti uzorak se pretvara u
                naelektrisane jone da bi na njih mogli da utiču električno i magnetno polje. Potom se joni dele na
                osnovu odnosa njihove mase i naelektrisanja i kao takvi se mere njihove vrednosti.
              </p>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Masa se meri u daltonima <span className="italic">(Da)</span>, pri čemu je{" "}
                  <span className="italic">1 Da</span> približno jednak masi protona/neutrona. Samim tim masa molekula
                  je jednaka sumi masa protona/neutrona koji čine taj molekul. Mase aminokiselina su poznate i prikazane su na slici 4. 
                  Može se primetiti da neke aminokiseline imaju istu masu, tako da 20 različitih aminokiselina ima 18 različitih masa.
                </p>

                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">Masa tirocidina je:</p>
                  <div className="font-mono">
                    <div className="whitespace-pre">
                      {['V', 'K', 'L', 'F', 'P', 'W', 'F', 'N', 'Q', 'Y'].map(letter => letter.padEnd(6, ' ')).join('')}
                    </div>
                    <div className="whitespace-pre">
                      {[99, 128, 113, 147, 97, 186, 147, 114, 128, 163].map((num, index) => 
                        `${num}${index < [99, 128, 113, 147, 97, 186, 147, 114, 128, 163].length - 1 ? ' + ' : ' = ' + 1322}`
                      ).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => openLightbox("/images/amino-acids-table.svg")}
              className="relative w-full h-[500px] mb-2 cursor-pointer group"
              aria-label="Otvori sliku u punoj veličini"
            >
              <Image
                src="/images/amino-acids-table.svg"
                alt="Tabela koja pokazuje mase aminokiselina"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="sr-only">Klikni da uvećaš</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground text-center">
              Slika 4: Tabela masa aminokiselina izraženih u daltonima (Da).
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Teorijski spektar peptida</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg">
              <p className="text-muted-foreground mb-6">
                Teorijski spektar peptida predstavlja mase svih mogućih podpeptida, uključujući 0 i masu celog peptida.
                Na osnovu peptida možemo lako da odredimo teorijski spektar ali na osnovu spektra ne možemo lako
                da odredimo koji je peptid u pitanju. 
              </p>
              <p className="text-muted-foreground mb-6">
                <span className="font-semibold">Problem sekvenciranja ciklopeptida</span> je problem kako rekonstruisati
                ciklični peptid na osnovu njegovog teorijskog spektra.
                U nastavku će biti prikazani 4 različita algoritma koje možete videti u sekciji <span className="italic">Dostupni algoritmi</span>.
              </p>
              <p className="text-muted-foreground mb-6">
                Na slici 5 su prikazane mase svih podpeptida peptida <span className="font-semibold">NQEL</span>, kao i masa praznog 
                peptida i celog peptida, takođe je prikazan i teorijski spektar.
              </p>
            </div>
          </div>


          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => openLightbox("/images/peptide-theoretical-spectrum.svg")}
              className="relative w-full h-[600px] mb-2 cursor-pointer group"
              aria-label="Otvori sliku u punoj veličini"
            >
              <Image
                src="/images/peptide-theoretical-spectrum.svg"
                alt="Teorijski spektar peptida kao i svi njegovi podpeptidi"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="sr-only">Klikni da uvećaš</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground text-center">
              Slika 5: Teorijski spektar peptida NQEL koji prikazuje sve moguće podpeptide, njihove mase i njegov teorijski spektar.
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>
        </div>

        {lightboxImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
              <Image
                src={lightboxImage || "/placeholder.svg"}
                alt="Enlarged image"
                fill
                style={{ objectFit: "contain" }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Close lightbox"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6">Dostupni algoritmi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Algoritam grube sile</h3>
            <p className="text-muted-foreground mb-4">
              Direktan pristup gde se isprobavaju sve moguće kombinacije da bi se našlo optimalno rešenje.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/brute_force">
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
              <Link href="/branch_and_bound">
                Istraži <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Leaderboard Algoritam</h3>
            <p className="text-muted-foreground mb-4">
              Algoritam koji održava listu N najboljih kandidata za rešenje i na osnovu njih smanjuje broj potencijalnih
              kandidata.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/leaderboard">
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
