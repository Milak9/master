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
    <div className="min-h-screen py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Uvod u sekvenciranje antibiotika</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg mb-6 max-w-full">
              <p className="text-muted-foreground mb-6">
                Proces sekvenciranja antibiotika je fundamentalan u razumevanju kako su ovi molekuli proizvedeni od
                strane bakterija i kako se oni mogu sintetizovati ili modifikovani za primene u medicini. Antibiotici su
                često peptidi - kratki proteini odnosno kratak niz aminokiselina, ali mnogo antibiotika, uglavnom
                neribozomalni peptidi (<span className="italic">non-ribosomal peptides - NRPs</span>), ne prati
                standardna pravila za sintezu proteina čime se otežava njihovo sekvenciranje <Link href="/literature#1" className="text-blue-600 underline hover:text-blue-800">[1]</Link>.
              </p>

              <p className="text-muted-foreground mb-6">
                DNK sadrži recept za kreiranje proteina. Odnosno, sastoji se od gena koji mogu biti uključeni 
                i tada će se na osnovu njih kreirati proteini ili isključeni kada se oni neće koristiti za kreiranje proteina.
                Isključenost ili uključenost nekog gena zavisi od toga da li je potrebno da se kreira neki protein ili nije potrebno 
                (npr. fotosinteza kod biljaka koja se obavlja samo preko dana).
              </p>

              <p className="text-muted-foreground mb-6">
                Tradicionalno, proteini prate{" "}
                <span className="font-semibold">Centralnu Dogmu Molekularne biologije</span>, koja kaže da se DNK prvo
                prepisuje u RNK - slika 1, a zatim se RNK prevodi u protein.
                Na slici jedan se može se primetiti da se DNK sastoji od 2 lanca koja su komplementarna. Enzim <span className="italic">RNK polimeraza</span> 
                {" "}se kači na početak gena i kreće kroz gene gde razdvaja lanac i stvara prostor za prepisivanje DNK u RNK čime se dobija RNK.
              </p>

              <p className="text-muted-foreground mb-6">
                Prilikom prevođenja RNK u protein potrebno je na osnovu nukleitoda odrediti koja je aminokiselina u pitanju.
                Organela ribozom je zadužena da odradi ovaj posao i pošto je potrebno na osnovu nukleotidne sekvence uniformno odrediti
                koja je aminokiselina u pitanju uzima se sekvenca od 3 nukleotida takođe poznata kao kodon.
                Pošto je uzeta sekvenca od 3 nukleotida ovo nam daje 64 različita kodona koja treba da se prevedu u 20 aminokiselina,
                da smo uzeli sekvencu od 2 nukleotida dobili bismo 16 različitih kombinacija čime ne bismo mogli da dobijemo sve aminokiseline.
                Na slici 2 može se videti kako se kodoni prevode u odgovarajuće aminokiseline. Postoje start i stop kodoni koji određuju početak odnosno kraj
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
                  slika 2: RNK kodonski točak prikazuje kako se sekvence od tri nukleotida (kodoni) prevode u
                  aminokiseline. Svaki kodon se čita od centra ka spolja, a zeleni trougao označava start kodon (AUG)
                  koji kodira metionin, dok crveni kvadrati označavaju stop kodone (UAA, UAG, UGA) koji određuju kraj
                  sekvence koja se prevodi u protein. Preuzeto sa <Link href="/literature#8" className="text-blue-600 underline hover:text-blue-800">[8]</Link>.
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
              className="relative w-full max-w-full aspect-[4/3] mb-4 cursor-pointer group"
              aria-label="Otvori sliku u punoj veličini"
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
              slika 1: Transkripcija DNK u RNK. Enzim RNK polimeraza (nije prikazan) čita DNK lanac i sintetiše
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
            <div className="prose prose-lg max-w-full">
              <p className="text-muted-foreground mb-6">
                Tirocidin B1 je cikličan peptid dužine 10 (slika 3),
                što znači da su prva i poslednja aminokiselina povezane i da samim tim 
                postoji 10 njegovih različitih linearnih reprezentacija (tabela 1).
                Prateći centralnu dogmu i zaključka da se 1 kodon prevodi u 1 aminokiselinu, 
                naučnici su probali da pronađu 10 kodona odnosno 30 nukleotida u genomu bakterije <span className="italic">Bacillus brevis</span>{" "}
                od koje nastaje ovaj antibiotik. Ovaj postupak je veoma dugotrajan obzirom da mora da se proveri više hiljada 30-grama
                koji mogu da počnu bilo gde u genomu. Analiziranjem genoma utvrđeno je
                da ne postoji 30-gram koji se kodira u neki od 10 različitih reprenzatacija traženog antibiotika.
              </p>

              <p className="text-muted-foreground mb-6">
                Dokazano je da Tirocidin B1 ne prati centralnu dogmu molekularne biologije i da postoje posebni
                enzimi koji su zaduženi za njihovo sintentisanje. Ovi enzimi se zovu <span className="italic">NRP sintetaza</span>.{" "}
                Ovi enzimi sadrže komplikovane module, koji govore koje aminokiseline učetvuju u sastavu proteina.
                U slučaju Tirocidina B1, enzim sadrži 10 modula i svaki od module kodira 1 aminokiselinu čime je određena struktura
                antibiotika.<br/>
                Samim tim, pošto struktura proteina nije određena na osnovu genoma bakterije, metode za sekvencioniranje DNK
                ovde nisu od pomoći i potrebno je sekvencirati direktno sam peptid.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => openLightbox("/images/tyrocidine.svg")}
              className="relative w-full max-w-xs mx-auto aspect-square mb-2 cursor-pointer group"
              aria-label="Otvori sliku u punoj veličini"
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
              slika 3: Struktura tirocidina B1, cikličnog peptida sastavljenog od 10 aminokiselina.
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <table style={{ borderCollapse: "collapse", margin: "auto" }} border={1}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px" }}>#</th>
                  <th style={{ textAlign: "left", padding: "6px" }}>Linearna sekvenca</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["red", "Lys"], ["blue", "Leu"], ["orange", "Phe"], ["violet", "Pro"], ["teal", "Trp"],
                  ["orange", "Phe"], ["magenta", "Asn"], ["brown", "Gln"], ["cyan", "Tyr"], ["green", "Val"]
                ].map((seq, i, full) => (
                  <tr key={i + 1}>
                    <td style={{ padding: "6px" }}>{i + 1}</td>
                    <td style={{ padding: "6px" }}>
                      {Array.from({ length: 10 }).map((_, j) => {
                        const [color, name] = full[(i + j) % full.length];
                        return (
                          <span key={j} style={{ color: color }}>
                            {name}
                            {j < 9 && " – "}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-sm text-muted-foreground text-center">
              tabela 1: Deset različitih linearnih reprezentacija tirocidina B1.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Maseni spektrometar</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg max-w-full">
              <p className="text-muted-foreground mb-6">
                Maseni spektrometar <Link href="/literature#7" className="text-blue-600 underline hover:text-blue-800">[7]</Link> je moćan alat pomoću koga mogu da se odrede mase molekula, uključujući mase peptida
                i proteina. Omogućava naučnicima da odrede nepoznate komponente, saznaju strukturu molekula i
                analiziraju kompleksne uzorke. Maseni spektrometar radi tako što mu se da više uzoraka istog peptida a
                on napravi sve moguće potpeptide datog peptida i odredi njihove mase. U realnosti uzorak se pretvara u
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
              className="relative w-full max-w-full h-[500px] mb-2 cursor-pointer group"
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
              slika 4: Tabela masa aminokiselina izraženih u daltonima (Da).
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Teorijski spektar peptida</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg max-w-full">
              <p className="text-muted-foreground mb-6">
                Teorijski spektar peptida predstavlja mase svih mogućih potpeptida, uključujući 0 i masu celog peptida.
                Na osnovu peptida možemo lako da odredimo teorijski spektar ali na osnovu spektra ne možemo lako da
                odredimo koji je peptid u pitanju.
              </p>
              <p className="text-muted-foreground mb-6">
                <span className="font-semibold">Problem sekvenciranja ciklopeptida</span> samim tim se svodi na problem kako rekonstruisati
                ciklični peptid na osnovu njegovog teorijskog spektra. U nastavku će biti prikazani nekoliko različitih
                algoritma koje možete videti u sekciji <span className="italic">Dostupni algoritmi</span>.
              </p>

              <p className="text-muted-foreground mb-6">
                Kao ulaz u svaki od ovih algoritama očekuje se eksperimentalni spektar, odnosno spektar koji je dobijen uz pomoć
                masenog spektrometra za neki peptid.
                Na slici 5 su prikazane mase svih potpeptida peptida NQEL koje se dobijaju uz pomoć
                masenog spektrometra, kao i masa praznog peptida i celog peptida, takođe je prikazan i teorijski spektar.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => openLightbox("/images/peptide-theoretical-spectrum.svg")}
              className="relative w-full max-w-full h-[300px] mb-2 cursor-pointer group"
              aria-label="Otvori sliku u punoj veličini"
            >
              <Image
                src="/images/peptide-theoretical-spectrum.svg"
                alt="Teorijski spektar peptida kao i svi njegovi potpeptidi"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="sr-only">Klikni da uvećaš</span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground text-center">
              slika 5: Teorijski spektar peptida NQEL koji prikazuje sve moguće potpeptide, njihove mase i njegov teorijski spektar.
              <span className="text-xs block text-primary-foreground/70 italic mt-1">
                Kliknite na sliku za uvećani prikaz
              </span>
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Lažne i nedostajuće mase</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col">
            <div className="prose prose-lg max-w-full">
              <p className="text-muted-foreground mb-6">
                Teorijski spektar predstavlja spektar bez šumova i koja uvek ima sve tačne podatke. 
                U realnosti eksperimentalni spektri često sadrže lažne ili nedostajuće mase. <span className="font-semibold">Lažna
                masa</span> predstavlja masu koja se nalazi u eksperimentalnom spektru ali zapravo ne
                postoji u teorijskom spektru peptida. <span className="font-semibold">Nedostajuća masa</span> predstavlja masu koja
                se ne nalazi u eksperimentalnom spektru ali postoji u teorijskom spektru peptida.
              </p>
              <p className="text-muted-foreground mb-6">
                U tabeli 2 može da se vidi primer teorijskog i eksperimentalnog spektra za peptid NEQ sa nedostajućim i lažnim masama.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <table style={{ borderCollapse: "collapse", textAlign: "center", margin: "auto" }} border={1}>
              <thead>
                <tr>
                  <th style={{ padding: "0 10px" }}><strong>eksperimentalni</strong></th>
                  <td style={{ padding: "0 10px" }}>0</td>
                  <td style={{ padding: "0 10px" }}>114</td>
                  <td style={{ padding: "0 10px" }}>128</td>
                  <td style={{ padding: "0 10px" }}></td>
                  <td style={{ padding: "0 10px", color: "blue" }}>133</td>
                  <td style={{ padding: "0 10px", color: "blue" }}>200</td>
                  <td style={{ padding: "0 10px" }}></td>
                  <td style={{ padding: "0 10px" }}>243</td>
                  <td style={{ padding: "0 10px" }}></td>
                  <td style={{ padding: "0 10px" }}>371</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ padding: "0 10px" }}><strong>teorijski</strong></th>
                  <td style={{ padding: "0 10px" }}>0</td>
                  <td style={{ padding: "0 10px" }}>114</td>
                  <td style={{ padding: "0 10px" }}>128</td>
                  <td style={{ padding: "0 10px", color: "green" }}>129</td>
                  <td style={{ padding: "0 10px" }}></td>
                  <td style={{ padding: "0 10px" }}></td>
                  <td style={{ padding: "0 10px", color: "green" }}>242</td>
                  <td style={{ padding: "0 10px" }}>243</td>
                  <td style={{ padding: "0 10px", color: "green" }}>257</td>
                  <td style={{ padding: "0 10px" }}>371</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground text-center">
              tabela 2: Prikaz nedostajućih masa (obojene zelenom bojom) i lažnih masa (obojene plavom bojom) koje mogu da se jave u
                eksperimentlanom spektru za peptid <strong>NEQ</strong>.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Pristup grubom silom</h3>
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

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">DeepNovo sekvenciranje</h3>
            <p className="text-muted-foreground mb-4">
              Metoda zasnovana na dubokom učenju koja omogućava sekvenciranje peptida bez oslanjanja na baze podataka.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/deep_novo">
                Istraži <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
