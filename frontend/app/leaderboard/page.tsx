"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Trophy,
  Medal,
  Info,
  RotateCcw,
  ArrowRight,
  FlaskConical,
  Gauge,
  Microscope,
  Scale,
  Timer,
  Zap,
} from "lucide-react"
import { ZoomableSpectrum } from "@/components/zoom_spectrum/visualization_controls"

interface PeptideCandidate {
  peptide: string
  number_of_matches: number
  spectrum: number[]
  mass: number
  qualified: boolean
}

interface Solution {
  peptide: string
  mass: number
  theoretical_spectrum: number[]
  number_of_matches: number
}

interface VisualizationData {
  leaderboard: PeptideCandidate[][]
  solution: Solution
  N: number
}

const generateSubpeptideLabels = (peptide: string, masses: number[]): { [mass: number]: string } => {
  const sortedMasses = [...masses].sort((a, b) => a - b)

  const massToSubpeptide: { [mass: number]: string } = {}
  massToSubpeptide[0] = ""

  const maxMass = Math.max(...masses)
  massToSubpeptide[maxMass] = peptide
  const peptideLength = peptide.length

  for (let i = 1; i < peptideLength; i++) {
    const subpeptide = peptide.substring(0, i)
    for (const mass of sortedMasses) {
      if (mass > 0 && mass < maxMass && !massToSubpeptide[mass]) {
        massToSubpeptide[mass] = subpeptide
        break
      }
    }
  }

  for (let i = 1; i < peptideLength; i++) {
    const subpeptide = peptide.substring(peptideLength - i)
    for (const mass of sortedMasses) {
      if (mass > 0 && mass < maxMass && !massToSubpeptide[mass]) {
        massToSubpeptide[mass] = subpeptide
        break
      }
    }
  }

  return massToSubpeptide
}

export default function LeaderboardPage() {
  const [sequence, setSequence] = useState("")
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePreviousRound = () => {
    if (currentRound > 0) {
      setCurrentRound((prev) => prev - 1)
    }
  }

  const handleNextRound = () => {
    if (visualizationData && currentRound < visualizationData.leaderboard.length - 1) {
      setCurrentRound((prev) => prev + 1)
      if (currentRound === visualizationData.leaderboard.length - 2) {
        setIsAnimationComplete(true)
      }
    }
  }

  const handleReset = () => {
    setCurrentRound(0)
    setIsAnimationComplete(false)
  }

  const skipToEnd = () => {
    if (visualizationData) {
      setCurrentRound(visualizationData.leaderboard.length - 1)
      setIsAnimationComplete(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCurrentRound(0)

      const mockData: VisualizationData = {
        leaderboard: [
          [
            { peptide: "P", number_of_matches: 2, spectrum: [0, 97], mass: 97, qualified: true },
            { peptide: "G", number_of_matches: 1, spectrum: [0, 57], mass: 57, qualified: true },
            { peptide: "A", number_of_matches: 1, spectrum: [0, 71], mass: 71, qualified: false },
          ],
          [
            { peptide: "PQ", number_of_matches: 3, spectrum: [0, 97, 128, 225], mass: 225, qualified: true },
            { peptide: "GP", number_of_matches: 2, spectrum: [0, 57, 97, 154], mass: 154, qualified: true },
            { peptide: "PA", number_of_matches: 2, spectrum: [0, 71, 97, 168], mass: 168, qualified: false },
          ],
          [
            {
              peptide: "PQG",
              number_of_matches: 4,
              spectrum: [0, 57, 97, 128, 154, 225, 282],
              mass: 282,
              qualified: true,
            },
            {
              peptide: "GPQ",
              number_of_matches: 3,
              spectrum: [0, 57, 97, 128, 154, 225, 282],
              mass: 282,
              qualified: false,
            },
          ],
        ],
        solution: {
          peptide: "PQG",
          mass: 282,
          theoretical_spectrum: [0, 57, 97, 128, 154, 225, 282],
          number_of_matches: 4,
        },
        N: 2,
      }

      setVisualizationData(mockData)
      setIsAnimationComplete(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard Algoritam</h1>

      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-muted-foreground mb-6">
          Leaderboard algoritam je optimizovani pristup za sekvenciranje peptida. Za razliku od sekvenciranja grubom
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
            najperspektivnije peptide. Ovo značajno smanjuje prostor pretrage u poređenju sa algoritmom grube sile.
            Za svaki od peptida koji se generiše određujemo koji je njegov <span className="italic">score</span>, odnosno broj masa linearnog spektra peptida
            koji je jednak masama u eksperimentalnom spektru.
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
            koji su kandidati za rešenje, eksperimentalni spektar kao i broj peptida koji ćemo vratiti iz funkcije odnosno
            najbolji kandidati za potencijalno rešenje. Bitno je izabrati dobro broj kandidata koji prolazi u dalju rundu.
            U slučaju da je taj broj previše mali rizujemo da previše agresivno odsečemo neke kandidate i da potencijalno
            izgubimo rešenje. U slučaju da je borj previše veliki čuvaćemo previše kandidata i samim tim povećati vreme izvršavanja
            algoritma. Generalno, dobra je praksa ako se traže peptidi sa manjom masom da se koristi manji broj kandidata koji nastavlja u sledeću rundu
             a ako se masa poveća da se samim tim poveća i broj kandidata koji nastavlja u sledeću rundu.
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
            Funkcija <span className="italic">cyclic_score</span> računa broj poklapanja teorijskog spektra cikličnog peptida sa eksperimentalnim spektrom.
            Ova funkcija se koristi u slučaju da je masa peptida jednaka najvećoj teoorijskoj masi jer je u tom slučaju formiran ceo peptid i mogu da se nađu
            svi podpeptidi.
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
            Funkcija <span className="italic">linear_score</span> računa broj poklapanja teorijskog spektra peptida sa eksperimentalnim spektrom.
            Ova funkcija se koristi kada se ceo peptid još ne zna i samim tim ne mogu da se kreiraju sve ciklične varijacije jer bi se dobile mase
            koje se možda ne bi dobile kada se peptid proširi aminokiselinama.
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
            Funkcija <span className="italic">score</span> računa broj poklapanja teorijskog spektra peptida sa eksperimentalnim spektrom.
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
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unesi eksperimentalni spektar</label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="npr. 0,97,129,194,226,323,355,452"
              className="max-w-md"
            />
          </div>
          <Button type="submit">Analiziraj</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousRound}
              disabled={!visualizationData || currentRound === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextRound}
              disabled={!visualizationData || currentRound === (visualizationData?.leaderboard.length ?? 0) - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} disabled={!visualizationData}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={skipToEnd} disabled={!visualizationData} title="Skip to end">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {visualizationData && (
            <div className="text-sm text-muted-foreground">
              Runda {currentRound + 1} od {visualizationData.leaderboard.length}
            </div>
          )}
        </div>

        <div ref={containerRef} className="space-y-8">
          {visualizationData && visualizationData.leaderboard && visualizationData.leaderboard[currentRound] ? (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Runda {currentRound + 1}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mr-1" />
                    Broj kandidata: {visualizationData.N}
                  </div>
                </div>

                <div className="space-y-6">
                  {visualizationData.leaderboard[currentRound].map((candidate, index) => {
                    const isLastRound = currentRound === visualizationData.leaderboard.length - 1
                    const isSolution = candidate.peptide === visualizationData.solution.peptide
                    const subpeptideMap = generateSubpeptideLabels(candidate.peptide, candidate.spectrum)
                    const spectrumItems = candidate.spectrum.map((mass) => ({
                      mass,
                      subpeptide: subpeptideMap[mass] || "",
                    }))

                    return (
                      <div
                        key={index}
                        className={`rounded-lg transition-colors duration-300 ${
                          candidate.qualified
                            ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            {isSolution && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-500 mr-2"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            )}
                            {index === 0 && !isSolution && <Crown className="h-5 w-5 mr-2 text-yellow-500" />}
                            {index === 1 && <Medal className="h-5 w-5 mr-2 text-gray-400" />}
                            {index === 2 && <Medal className="h-5 w-5 mr-2 text-amber-600" />}

                            <span className="font-mono text-lg">{candidate.peptide}</span>
                            <span className="ml-2 text-sm text-muted-foreground">({candidate.mass} Da)</span>

                            {candidate.qualified && (
                              <div className="ml-4 text-green-600 text-sm flex items-center">
                                <ChevronRight className="h-4 w-4" />
                                {isLastRound ? "Pobednik" : "Prolazi u sledeću rundu"}
                              </div>
                            )}
                          </div>
                          <span className="text-primary font-semibold">Poklapanja: {candidate.number_of_matches}</span>
                        </div>

                        <div className="px-4 pb-4">
                          <p className="text-sm font-medium mb-2">Teorijski spektar:</p>
                          <ZoomableSpectrum
                            spectrum={spectrumItems}
                            experimentalSpectrum={visualizationData.solution.theoretical_spectrum.map(
                              (item) => item.mass,
                            )}
                            peptide={candidate.peptide}
                            qualified={candidate.qualified}
                            isSolution={isSolution}
                            height={180}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              Unesi eksperimentalni spektar i klikni Analiziraj da vidiš vizualizaciju
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
