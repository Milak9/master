"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  FlaskConical,
  Gauge,
  Microscope,
  Scale,
  Timer,
  Zap,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RoundNavigation, renderCandidates } from "@/components/round_navigation"
import Link from "next/link"

interface SpectrumItem {
  mass: number
  subpeptide: string
}

interface PeptideCandidate {
  peptide: string
  number_of_matches: number
  spectrum: SpectrumItem[]
  mass: number
  qualified: boolean
  reason?: string
  candidate?: boolean
}

interface Solution {
  peptide: string
  mass: number
  spectrum: SpectrumItem[]
  number_of_matches: number
}

interface VisualizationData {
  leaderboard: PeptideCandidate[][]
  solution: Solution[]
  N: number
}

export default function LeaderboardPage() {
  const [sequence, setSequence] = useState("")
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [visibleItems, setVisibleItems] = useState(10)
  const candidatesContainerRef = useRef<HTMLDivElement>(null)
  const [showOnlySolution, setShowOnlySolution] = useState(false)
  const [pendingShowOnlySolution, setPendingShowOnlySolution] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePreviousRound = () => {
    if (currentRound > 0) {
      setCurrentRound((prev) => prev - 1)
    }
  }

  const handleNextRound = () => {
    if (visualizationData && currentRound < visualizationData.leaderboard.length - 1) {
      setCurrentRound((prev) => prev + 1)
    }
  }

  const handleReset = () => {
    setCurrentRound(0)
    setVisibleItems(10)
  }

  const skipToEnd = () => {
    if (visualizationData) {
      setCurrentRound(visualizationData.leaderboard.length - 1)
      setVisibleItems(visualizationData.leaderboard[visualizationData.leaderboard.length - 1].length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowOnlySolution(pendingShowOnlySolution)

    if (!sequence.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite eksperimentalni spektar.",
        variant: "destructive",
      })
      return
    }

    try {
      const parsedSequence = sequence
        .split(",")
        .map((s) => Number.parseInt(s.trim()))
        .filter((n) => !isNaN(n))

      if (parsedSequence.length < 2) {
        toast({
          title: "Greška",
          description: "Spektar mora sadržati najmanje 2 broja.",
          variant: "destructive",
        })
        return
      }

      for (let i = 1; i < parsedSequence.length; i++) {
        if (parsedSequence[i] < parsedSequence[i - 1]) {
          toast({
            title: "Greška",
            description: "Brojevi u spektru moraju biti u rastućem redosledu.",
            variant: "destructive",
          })
          return
        }
      }

      setCurrentRound(0)
      setVisibleItems(10)

      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALHOST_URL}/sequencing/leaderboard/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_spectrum: parsedSequence,
        }),
      })

      if (!response.ok) {
        throw new Error("Greška pri komunikaciji sa serverom")
      }

      const data = await response.json()
      setVisualizationData(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Greška",
        description: error instanceof Error ? error.message : "Došlo je do greške pri obradi podataka",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!candidatesContainerRef.current || !visualizationData?.leaderboard?.[currentRound]) return

      const { scrollTop, scrollHeight, clientHeight } = candidatesContainerRef.current
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        // Load 10 more items, but don't exceed the total count
        setVisibleItems((prev) => Math.min(prev + 10, visualizationData.leaderboard[currentRound].length))
      }
    }

    const currentRef = candidatesContainerRef.current
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll)
    }

    // Reset visible items when round changes
    setVisibleItems(10)

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll)
      }
    }
  }, [currentRound, visualizationData?.leaderboard])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard Algoritam</h1>

      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-muted-foreground mb-6">
          Leaderboard algoritam <Link href="/literature#2" className="text-blue-600 underline hover:text-blue-800">[2]</Link> je optimizovani pristup za sekvenciranje peptida. Za razliku od sekvenciranja grubom
          silom koje zahteva tačno poklapanje između teorijskog spektra kandidata i eksperimentalnog spektra, ovaj
          algoritam je dizajniran da radi sa <span className="font-semibold">nedostajućim i lažnim masama</span> tako
          što prati samo najbolje kandidate peptida umesto svih mogućnosti.
        </p>

        <p className="text-muted-foreground mb-6">
          U realnim eksperimentalnim podacima masene spektrometrije, izmereni eksperimentalni spektar je često zašumljen
          i nepotpun. Neki očekivani fragmenti peptida mogu nedostajati, a lažni pikovi se mogu pojaviti zbog
          pozadinskog šuma. Savršeno poklapanje između teorijskog spektra peptida i eksperimentalnog spektra je malo
          verovatno.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Prednosti Algoritma</h2>
            <div className="grid gap-4">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-card">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Efikasnost</h3>
                  <p className="text-sm text-muted-foreground">
                    Fokusira se samo na najperspektivnije kandidate, značajno smanjujući vreme izvršavanja
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-card">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Skalabilnost</h3>
                  <p className="text-sm text-muted-foreground">
                    Efikasno radi sa peptidima različitih dužina bez eksponencijalnog rasta vremena
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-card">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Gauge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Preciznost</h3>
                  <p className="text-sm text-muted-foreground">
                    Održava visoku tačnost uprkos šumu u eksperimentalnim podacima
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Primene</h2>
            <div className="grid gap-4">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-card">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                  <FlaskConical className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Eksperimentalni Podaci</h3>
                  <p className="text-sm text-muted-foreground">
                    Idealan za analizu realnih podataka masene spektrometrije sa šumom
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-card">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <Microscope className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Nepotpuni Podaci</h3>
                  <p className="text-sm text-muted-foreground">
                    Kada tačno poklapanje nije moguće zbog nepotpunih ili netačnih podataka u spektru
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-card">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Vremenski Kritične Analize</h3>
                  <p className="text-sm text-muted-foreground">
                    Kada je potrebna brza identifikacija peptida iz velikih skupova podataka
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Kod za Leaderboard algoritam</h3>
          <p className="text-muted-foreground mb-8">
            Algoritam održava listu najboljih kandidata (leaderboard) i u svakoj iteraciji proširuje samo
            najperspektivnije peptide. Ovo značajno smanjuje prostor pretrage u poređenju sa algoritmom grube sile. Za
            svaki od peptida koji se generiše određujemo koji je njegov <span className="italic">score</span>, odnosno
            broj masa linearnog spektra peptida koji je jednak masama u eksperimentalnom spektru.
          </p>

          <div className="overflow-x-auto mt-6 mb-8">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def leaderboard_sequencing(target_spectrum):
    # Krećemo od praznog peptida
    peptides = ['']

    # Peptid koji je trenutno najbolji kandidat i njegov score
    leader_peptide = ''
    leader_peptide_score = 0

    target_peptide_mass = target_spectrum[-1]

    while len(peptides) > 0:
        extended_peptides = extend(peptides, amino_acid_candidates)

        consistent_peptides = []

        for peptide in extended_peptides:
            peptide_mass = calculate_peptide_mass(peptide)
            if peptide_mass == target_peptide_mass:
                # Računamo koji je broj poklapanja cikličnog peptida sa eksperimentalnim spektrom
                peptide_score = cyclic_score(peptide, target_spectrum)
                # Ako je score bolji, ažuriramo vrednost najboljeg kandidata
                if peptide_score > leader_peptide_score:
                    leader_peptide = peptide
                    leader_peptide_score = peptide_score
            elif peptide_mass < target_peptide_mass:
                consistent_peptides.append(peptide)

        # Funkcija u kojoj se pravi lista kandidata i vraćaju samo najbolji kandidati
        peptides = trim(consistent_peptides, target_spectrum, MAX_NUMBER_OF_CANDIDATES)

    return leader_peptide`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-8">
            Jedna od glavnih funkcija je <span className="italic">trim</span>. Ulaz u funkciju predstavljaju peptidi
            koji su kandidati za rešenje, eksperimentalni spektar kao i broj peptida koji ćemo vratiti iz funkcije
            odnosno najbolji kandidati za potencijalno rešenje. Bitno je izabrati dobro broj kandidata koji prolazi u
            dalju rundu. U slučaju da je taj broj previše mali rizujemo da previše agresivno odsečemo neke kandidate i
            da potencijalno izgubimo rešenje. U slučaju da je borj previše veliki čuvaćemo previše kandidata i samim tim
            povećati vreme izvršavanja algoritma. Generalno, dobra je praksa ako se traže peptidi sa manjom masom da se
            koristi manji broj kandidata koji nastavlja u sledeću rundu a ako se masa poveća da se samim tim poveća i
            broj kandidata koji nastavlja u sledeću rundu.
          </p>

          <div className="overflow-x-auto mt-6 mb-8">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def trim(peptides, target_spectrum, max_number_of_candidates):
    # Ako je broj peptida manji od broja kandidata koji može da prođe
    # u sledeću rundu, vraćamo sve peptide
    if len(peptides) <= max_number_of_candidates:
        return peptides

    leaderboard = []

    # Za svaki od peptida računamo njegov score
    for peptide in peptides:
        # Bitno je koristiti linear_score funkciju jer ovo nije finalni izgled peptida
        # samim tim, ako se koristi cyclic_score možemo da dobijemo mase koje možda neće
        # postojati kada se peptid proširi
        peptide_score = linear_score(peptide, target_spectrum)
        leaderboard.append((peptide_score, peptide))

    # Sortiramo listu peptida u opadajućem redosledu po njihovom score-u
    leaderboard.sort(reverse=True)

    # Ako u listi kandidata ima još neka sekvenca peptida čiji je 
    # score jednak poslednjoj sekvenci koja prolazi u sledeću rundu,
    # dodajemo i tu sekvencu da potencijalno ne bismo izgubili dobro
    # rešenje 
    for i in range(max_number_of_candidates, len(leaderboard)):
        if leaderboard[i][0] < leaderboard[max_number_of_candidates - 1][0]:
            break

    # Lista kandidata koja je prošla u sledeću rundu
    trimmed_leaderboard = leaderboard[:i]
    # Pošto smo u listi čuvali peptide sa njihovim rezultatima,
    # vraćamo samo listu peptida odnosno njihove sekvence
    return [el[1] for el in trimmed_leaderboard]`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-8">
            Funkcija <span className="italic">cyclic_score</span> računa broj poklapanja teorijskog spektra cikličnog
            peptida sa eksperimentalnim spektrom. Ova funkcija se koristi u slučaju da je masa peptida jednaka najvećoj
            teoorijskoj masi jer je u tom slučaju formiran ceo peptid i mogu da se nađu svi podpeptidi.
          </p>

          <div className="overflow-x-auto mt-6 mb-8">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def cyclic_score(peptide, target_spectrum):
    # Formira se ciklični spektar i na osnovu njega se računa score
    peptide_cyclic_spectrum = cyclic_spectrum(peptide)
    return score(peptide_cyclic_spectrum, target_spectrum)`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-8">
            Funkcija <span className="italic">linear_score</span> računa broj poklapanja teorijskog spektra peptida sa
            eksperimentalnim spektrom. Ova funkcija se koristi kada se ceo peptid još ne zna i samim tim ne mogu da se
            kreiraju sve ciklične varijacije jer bi se dobile mase koje se možda ne bi dobile kada se peptid proširi
            aminokiselinama.
          </p>

          <div className="overflow-x-auto mt-6 mb-8">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def linear_score(peptide, target_spectrum):
    # Formira se linearni spektar i na osnovu njega se računa score
    peptide_linear_spectrum = linear_spectrum(peptide)
    return score(peptide_linear_spectrum, target_spectrum)`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-8">
            Funkcija <span className="italic">score</span> računa broj poklapanja teorijskog spektra peptida sa
            eksperimentalnim spektrom.
          </p>

          <div className="overflow-x-auto mt-6 mb-8">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def score(peptide_spectrum, target_spectrum):
    total_score = 0

    i = 0
    j = 0
    n = len(peptide_spectrum)
    m = len(target_spectrum)

    # Prolazi se kroz spektre i upoređuju mase
    while i < n and j < m:
        # Ako su mase jednake prelazimo na sledeće mase u oba spektra i uvećavamo broj poklapanja
        if peptide_spectrum[i] == target_spectrum[j]:
            i += 1
            j += 1
            total_score += 1
        # U slučaju da je masa teorijskog spektra veća, prelazimo na sledeću masu u eksperimentalnom spektru
        elif peptide_spectrum[i] > target_spectrum[j]:
            j += 1
        # U slučaju da je masa teorijskog spektra manja, prelazimo na sledeću masu u teorijskom spektru
        else:
            i += 1

    return total_score`}
              </code>
            </pre>
          </div>
        </Card>

        <p className="text-muted-foreground mb-6">
          U vizuelizaciji ispod, možete videti kako algoritam kroz runde bira N kandidata koji prolaze u sledeću rundu. Takođe, možete da vidite
          teorijske spektre kandidata kao i broj elemenata spektra koji su isti kao i u zadatom teorijskom spektru. Teorijski spektri kandidata
          mogu da se zumiraju da bi se lakše videli podpeptidi sa njihovim masama.<br/>
          U poslednjoj rundi će biti prikazani peptidi koji predstavljaju najbolje kandidate za rešenje. Može imati više različitih kandidata
          s obzirom da različite aminokiseline mogu da imaju istu masu.<br/>
          Dodatno, ako ne želite da vidite runde koje su se desile potrebno je da označite opciju da se prikažu samo rešenja.
        </p>
        <p className="text-muted-foreground mb-2">
          Primeri peptida i njihovih teorijskih spektara:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
          <li>
            <strong>NQE:</strong> [0, 114, 128, 129, 242, 243, 257, 371]
          </li>
          <li>
            <strong>NQEL:</strong> [0, 113, 114, 128, 129, 227, 240, 242, 257, 355, 356, 370, 370, 484]
          </li>
        </ul>
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unesi eksperimentalni spektar</label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="npr. 0, 113, 114, 128, 129, 227, 240, 242, 257, 355, 356, 370, 370, 484"
              className="max-w-lg"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pendingShowOnlySolution"
              checked={pendingShowOnlySolution}
              onChange={(e) => setPendingShowOnlySolution(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={isLoading}
            />
            <label htmlFor="pendingShowOnlySolution" className="text-sm text-muted-foreground">
              Prikaži samo rešenje (bez vizuelizacije)
            </label>
          </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sekvenca se procesira...
                </>
              ) : (
                "Analiziraj sekvencu"
              )}
            </Button>
        </form>
      </Card>

      <div className="space-y-4" ref={containerRef}>
        {/* Spinner */}
        {isLoading && (
          <div className="mb-8">
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Obrađuje se zahtev...</h3>
                  <p className="text-muted-foreground">
                    Molimo sačekajte dok se algoritam izvršava. Ovo može potrajati nekoliko sekundi do nekoliko minuta u
                    zavisnosti od složenosti sekvence.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
        {visualizationData && (
          <RoundNavigation
            showOnlySolution={showOnlySolution}
            currentRound={currentRound}
            totalRounds={visualizationData.leaderboard.length}
            onPreviousRound={handlePreviousRound}
            onNextRound={handleNextRound}
            onReset={handleReset}
            onSkipToEnd={skipToEnd}
            infoText={`Maksimalni broj kandidata koji prolazi u sledeću rundu: ${visualizationData.N}`}
          >
            {renderCandidates(visualizationData, currentRound, visibleItems, candidatesContainerRef, setVisibleItems, showOnlySolution)}
          </RoundNavigation>
        )} 
        {!visualizationData && !isLoading &&(
          <div className="text-center text-muted-foreground">
            Unesi eksperimentalni spektar i klikni Analiziraj da vidiš vizualizaciju
          </div>
        )}
      </div>
    </div>
  )
}
