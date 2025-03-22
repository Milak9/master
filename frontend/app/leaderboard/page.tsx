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
          </p>

          <div className="overflow-x-auto mt-6 mb-8">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def leaderboard_sequencing(spectrum, N):
  leaderboard = ['']  # Start with empty peptide
  leader_peptide = ''
  parent_mass = spectrum[-1]  # Last mass in spectrum is parent mass
  
  while len(leaderboard) > 0:
      # Expand each peptide in leaderboard
      leaderboard = expand(leaderboard)
      
      # For each expanded peptide
      for peptide in leaderboard[:]:
          mass = calculate_mass(peptide)
          
          if mass == parent_mass:
              if score(peptide, spectrum) > score(leader_peptide, spectrum):
                  leader_peptide = peptide
          elif mass > parent_mass:
              leaderboard.remove(peptide)
      
      # Trim leaderboard to top N scoring peptides
      leaderboard = trim(leaderboard, spectrum, N)
  
  return leader_peptide

def trim(leaderboard, spectrum, N):
  if len(leaderboard) <= N:
      return leaderboard
      
  scores = [(peptide, score(peptide, spectrum)) 
            for peptide in leaderboard]
  scores.sort(key=lambda x: x[1], reverse=True)
  
  # Find the N-th score
  nth_score = scores[N-1][1]
  
  # Keep all peptides with score >= nth_score
  return [peptide for peptide, s in scores if s >= nth_score]

def score(peptide, spectrum):
  theoretical = generate_spectrum(peptide)
  return sum(min(theoretical.count(mass), spectrum.count(mass))
            for mass in set(theoretical + spectrum))`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-4">Ključne funkcije algoritma:</p>

          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>leaderboard_sequencing:</strong> Glavna funkcija koja vodi proces sekvenciranja održavajući listu
              najboljih kandidata.
            </li>
            <li>
              <strong>trim:</strong> Funkcija koja zadržava samo N najboljih peptida na osnovu njihovog skora.
            </li>
            <li>
              <strong>score:</strong> Računa skor peptida poređenjem njegovog teorijskog spektra sa eksperimentalnim.
            </li>
          </ul>
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
