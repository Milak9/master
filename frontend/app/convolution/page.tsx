"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  RotateCcw,
  ArrowRight,
  Info,
  PlayCircle,
  PauseCircle,
  Loader2
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { RoundNavigation, renderCandidates } from "@/components/round_navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MatrixCell {
  value: number | null
  isActive: boolean
  progress: number
}

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

interface MatrixApiResponse {
  matrix: number[][]
  sequence: number[]
  amino_acids_in_peptides: number[][]
  leaderboard: PeptideCandidate[][]
  solution: Solution[]
  N: number
  M: number
}

interface MatrixState {
  matrix: MatrixCell[][]
  currentStep: number
  sequence: number[]
  isComplete: boolean
  apiMatrix: number[][]
  amino_acids_in_peptides: number[][]
  leaderboard: PeptideCandidate[][]
  solution: Solution[]
  N: number
  M: number
}

const STEP_DURATION = 1000

export default function ConvolutionPage() {
  const [sequence, setSequence] = useState<string>("")
  const [parsedSequence, setParsedSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [matrixState, setMatrixState] = useState<MatrixState | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [visibleItems, setVisibleItems] = useState(10)
  const [apiResponse, setApiResponse] = useState<MatrixApiResponse | null>(null)

  const candidatesContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const { toast } = useToast()
  const [showOnlySolution, setShowOnlySolution] = useState(false)
  const [pendingShowOnlySolution, setPendingShowOnlySolution] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!candidatesContainerRef.current || !matrixState?.leaderboard?.[currentRound]) return

      const { scrollTop, scrollHeight, clientHeight } = candidatesContainerRef.current
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        // Load 10 more items, but don't exceed the total count
        setVisibleItems((prev) => Math.min(prev + 10, matrixState.leaderboard[currentRound].length))
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
  }, [currentRound, matrixState?.leaderboard])

  const handlePreviousRound = () => {
    if (currentRound > 0) {
      setCurrentRound((prev) => prev - 1)
    }
  }

  const handleNextRound = () => {
    if (matrixState && matrixState.leaderboard && currentRound < matrixState.leaderboard.length - 1) {
      setCurrentRound((prev) => prev + 1)
      if (currentRound === matrixState.leaderboard.length - 2) {
        setIsAnimationComplete(true)
      }
    }
  }

  const handleReset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)
    setCurrentTime(0)
    lastTimeRef.current = 0
    setIsAnimationComplete(false)
    if (matrixState) {
      const resetState = initializeMatrix(apiResponse as MatrixApiResponse, parsedSequence)
      setMatrixState(resetState)
    }
  }

  const handleResetLeaderboard = () => {
    setCurrentRound(0)
    setVisibleItems(10)
  }

  const skipToEnd = () => {
    if (matrixState && matrixState.leaderboard) {
      setCurrentRound(matrixState.leaderboard.length - 1)
      setIsAnimationComplete(true)
    }
  }

  useEffect(() => {
    if (matrixState && isPlaying && !matrixState.isComplete && !showOnlySolution) {
      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) {
          lastTimeRef.current = timestamp
        }
        const deltaTime = timestamp - lastTimeRef.current

        setCurrentTime((prev) => {
          const newTime = Math.min(prev + deltaTime, totalDuration)
          const currentStep = Math.floor(newTime / STEP_DURATION)
          const progress = ((newTime % STEP_DURATION) / STEP_DURATION) * 100

          setMatrixState((prevState) => {
            if (!prevState) return null
            const updatedState = updateMatrixState(prevState, currentStep, progress)

            if (updatedState.isComplete && !prevState.isComplete) {
              setIsPlaying(false)
              setIsAnimationComplete(true)
            }

            return updatedState
          })

          if (newTime >= totalDuration) {
            setIsPlaying(false)
            setIsAnimationComplete(true)
            return totalDuration
          }

          return newTime
        })

        lastTimeRef.current = timestamp
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [matrixState, isPlaying, totalDuration, showOnlySolution])

  const fetchMatrixData = async (targetSequence: number[]): Promise<MatrixApiResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALHOST_URL}/sequencing/spectral_convolution/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_spectrum: targetSequence,
      }),
    })

    if (!response.ok) {
      throw new Error("Greška pri komunikaciji sa serverom")
    }

    return await response.json()
  }

  const initializeMatrix = (apiResponse: MatrixApiResponse, parsedSequence: number[]): MatrixState => {
    const size = parsedSequence.length
    const calculatedMatrix: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null))

    for (let i = 1; i < size; i++) {
      for (let j = 0; j < i; j++) {
        calculatedMatrix[i][j] = Math.abs(parsedSequence[i] - parsedSequence[j])
      }
    }

    const matrix: MatrixCell[][] = Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({
          value: null,
          isActive: false,
          progress: 0,
        })),
    )

    return {
      matrix,
      currentStep: 0,
      sequence: parsedSequence,
      isComplete: false,
      apiMatrix: calculatedMatrix,
      amino_acids_in_peptides: apiResponse.amino_acids_in_peptides,
      leaderboard: apiResponse.leaderboard,
      solution: apiResponse.solution,
      N: apiResponse.N,
      M: apiResponse.M,
    }
  }

  const updateMatrixState = (state: MatrixState, step: number, progress: number): MatrixState => {
    const { sequence, apiMatrix } = state
    const size = sequence.length
    const newMatrix = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            value: -1,
            isActive: false,
            progress: 0,
          })),
      )

    let cellCount = 0
    for (let i = 1; i < size; i++) {
      for (let j = 0; j < i; j++) {
        if (cellCount <= step) {
          newMatrix[i][j] = {
            value: apiMatrix[i][j],
            isActive: true,
            progress: cellCount === step ? progress : 100,
          }
        }
        cellCount++
      }
    }

    const totalSteps = (size * (size - 1)) / 2 - 1
    const isComplete = step >= totalSteps && progress >= 100

    return {
      ...state,
      matrix: newMatrix,
      currentStep: step,
      isComplete,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowOnlySolution(pendingShowOnlySolution)
  
    if (!sequence.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite sekvencu.",
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
          description: "Sekvenca mora sadržati najmanje 2 broja.",
          variant: "destructive",
        })
        return
      }

      for (let i = 1; i < parsedSequence.length; i++) {
        if (parsedSequence[i] < parsedSequence[i - 1]) {
          toast({
            title: "Greška",
            description: "Brojevi u sekvenci moraju biti u rastućem redosledu.",
            variant: "destructive",
          })
          return
        }
      }

      setIsLoading(true)
      setIsAnimationComplete(false)
      setCurrentRound(0)
      setParsedSequence(parsedSequence)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      const response = await fetchMatrixData(parsedSequence)
      setApiResponse(response)

      const totalSteps = (parsedSequence.length * (parsedSequence.length - 1)) / 2
      const newTotalDuration = totalSteps * STEP_DURATION

      setTotalDuration(newTotalDuration)
      setCurrentTime(0)
      lastTimeRef.current = 0

      const initialState = initializeMatrix(response, parsedSequence)
      setMatrixState(initialState)
      setIsPlaying(true)
    } catch (error) {
      console.error("Error fetching matrix data:", error)
      toast({
        title: "Greška",
        description: error instanceof Error ? error.message : "Došlo je do greške pri obradi podataka",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimelineChange = (value: number[]) => {
    if (!matrixState || showOnlySolution) return

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)

    const newTime = value[0]
    const currentStep = Math.floor(newTime / STEP_DURATION)
    const progress = ((newTime % STEP_DURATION) / STEP_DURATION) * 100

    setCurrentTime(newTime)
    lastTimeRef.current = 0

    setMatrixState((prevState) => {
      if (!prevState) return null
      return updateMatrixState(prevState, currentStep, progress)
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Spektralna konvolucija</h1>

      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-muted-foreground mb-6">
          Spektralna konvolucija <Link href="/literature#2" className="text-blue-600 underline hover:text-blue-800">[2]</Link> je tehnika koja se koristi za identifikaciju aminokiselina koje mogu biti prisutne u
          peptidu na osnovu eksperimentalnog spektra. Ova metoda analizira razlike između masa u spektru i identifikuje
          one koje odgovaraju masama aminokiselina.
        </p>

        <p className="text-muted-foreground mb-6">Proces se sastoji iz dva glavna koraka:</p>

        <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground">
          <li>
            <strong>Izračunavanje konvolucije:</strong> Za svaki par masa u spektru, izračunava se njihova razlika. Ove
            razlike mogu odgovarati masama aminokiselina.
          </li>
          <li>
            <strong>Identifikacija aminokiselina:</strong> Najčešće razlike koje se pojavljuju u spektru verovatno
            odgovaraju aminokiselinama prisutnim u peptidu. Te aminokiseline se izdvajaju i koriste u{" "}
            <span className="italic">Leaderboard</span> algoritmu.
          </li>
        </ol>

        <p className="text-muted-foreground mb-6">
          Glavna prednost ovog algoritma jeste to što u samom startu smanjuje skup aminokiselina koje mogu da učestvuju
          u građenju peptida, čime se algoritam dosta ubrzava. Takođe, ovim se otvara mogućnost da se identifikuju
          nepoznate ili modifikovane aminokiseline. Još jedna od prednosti ovog algoritma jeste to što može da radi na
          eksperimentalnim spektrima koji imaju još više pogrešnih ili nedostajućih masa.
        </p>
      </div>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Kod za algoritam spektralne konvolucije</h3>
        <p className="text-muted-foreground mb-8">
          Algoritam spektralne konvolucije računa razlike između svih parova masa u eksperimentalnom spektru, a zatim
          identifikuje najčešće razlike koje odgovaraju masama aminokiselina. Ove aminokiseline se zatim koriste za
          generisanje kandidata peptida.
        </p>

        <div className="overflow-x-auto mt-6 mb-8">
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
            <code className="text-sm font-mono">
              {`    def spectral_convolution(target_spectrum):
        num_of_el_in_spectrum = len(target_spectrum)
        convolution = []

        # Elemente spektra možemo da posmatramo kao matricu, gde prvu vrstu i prvu kolonu predstavljaju elementri eksperimentalnog spektra.
        # Prolazimo kroz elemente spektra i medjusobno ih poredimo, kao kroz donju trougaonu matricu i ako je razlika u okviru datog opsega onda je to
        # jedna aminokiselina koja može a učestvuje u rešenju
        for i in range(num_of_el_in_spectrum):
            for j in range(i):
                diff = target_spectrum[i] - target_spectrum[j]
                if 57 <= diff <= 200:
                    convolution.append(diff)

        # Određujemo broj pojavljivanja masa
        freq_dict = {}
        for mass in convolution:
            if mass in freq_dict:
                freq_dict[mass] += 1
            else:
                freq_dict[mass] = 1

        # Sortiramo elemente i NUMBER_OF_LARGEST_ELEMENTS masa aminokiselina nastavlja dalje u leaderboard algoritam
        sorted_masses = sorted(freq_dict.items(), key=lambda x: x[1], reverse=True)
        top_masses = [mass for mass, _ in sorted_masses[:NUMBER_OF_LARGEST_ELEMENTS]]
        leader_peptide = leaderboard_sequencing(target_spectrum, top_masses)

        return leader_peptide`}
            </code>
          </pre>
        </div>
      </Card>

      <p className="text-muted-foreground mb-6">
        U vizuelizaciji ispod, možete videti kako algoritam prvo konstruiše matricu konvolucije a zatim i 
        prikazuje M najčešćih masa koje se pojavljuju u matrici. Nakon toga nad smanjenim brojem kandidata se primenjuje{" "}
        <span className="italic">Leaderboard</span> algoritam i kroz runde se bira N kandidata koji prolaze u sledeću rundu. Takođe, možete da vidite
        teorijske spektre kandidata kao i broj elemenata spektra koji su isti kao i u zadatom teorijskom spektru. Teorijski spektri kandidata
        mogu da se zumiraju da bi se lakše videli potpeptidi sa njihovim masama.<br/>
        U poslednjoj rundi će biti prikazani peptidi koji predstavljaju najbolje kandidate za rešenje. Može imati više različitih kandidata
        s obzirom da različite aminokiseline mogu da imaju istu masu.<br/>
        Dodatno, ako ne želite da vidite pravljenje matrice konvolucije kao ni runde koje su se desile potrebno je da označite opciju da se prikažu samo rešenja.
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

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unesi sekvencu</label>
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
          <div className="space-x-2">
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
          </div>
        </form>
      </Card>

      {matrixState && (
        <>
          {!showOnlySolution && matrixState && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Matrica konvolucije</h2>

              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={!matrixState || isLoading}
                  >
                    {isPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReset} disabled={!matrixState || isLoading}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (matrixState) {
                        const totalSteps = (matrixState.sequence.length * (matrixState.sequence.length - 1)) / 2 - 1
                        setCurrentTime(totalDuration)
                        setMatrixState((prevState) => {
                          if (!prevState) return null
                          return updateMatrixState(prevState, totalSteps, 100)
                        })
                        setIsAnimationComplete(true)
                        setIsPlaying(false)
                      }
                    }}
                    disabled={!matrixState || isLoading}
                    title="Skip to end"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {matrixState && (
                <div className="space-y-2 mb-6">
                  <Slider
                    value={[currentTime]}
                    max={totalDuration}
                    step={1}
                    onValueChange={handleTimelineChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0:00</span>
                    <span>
                      {Math.floor(totalDuration / 1000)}:
                      {String(Math.floor((totalDuration % 1000) / 10)).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              )}

              <Card className="p-6">
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-4"></th>
                        {matrixState.sequence.slice(0, -1).map((num, i) => (
                          <th key={i} className="border p-4">
                            {num}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixState.matrix.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <th className="border p-4">{matrixState.sequence[rowIndex]}</th>
                          {row.slice(0, -1).map((cell, colIndex) => (
                            <td
                              key={colIndex}
                              className="border p-4 text-center relative"
                              style={{
                                background: cell.isActive ? `rgba(59, 130, 246, ${cell.progress / 100})` : undefined,
                                color: cell.isActive ? "white" : undefined,
                                opacity: cell.value !== null ? 1 : 0,
                                transition: "background 0.3s ease-in-out, opacity 0.3s ease-in-out",
                              }}
                            >
                              {cell.value !== null && cell.value !== -1 && rowIndex > colIndex ? cell.value : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Only show the following sections after matrix animation is complete */}
          {(matrixState && (isAnimationComplete || showOnlySolution)) && (
            <>
              {/* Amino Acids Visualization */}
              {!showOnlySolution && matrixState.amino_acids_in_peptides && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Aminokiseline u peptidima</h2>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Najčešće mase</h3>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Top {matrixState.M} najčešćih masa između 57 i 200 Da
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Array.isArray(matrixState.amino_acids_in_peptides) &&
                        matrixState.amino_acids_in_peptides.map((item, index) => (
                          <div key={index} className="bg-secondary p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-lg">{item[0]} Da</span>
                              <span className="text-lg font-semibold">{item[1]}x</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Leaderboard Visualization with separate controls */}
              {matrixState.leaderboard && matrixState.leaderboard.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Leaderboard algoritam</h2>

                  <RoundNavigation
                    showOnlySolution={showOnlySolution}
                    currentRound={currentRound}
                    totalRounds={matrixState.leaderboard.length}
                    onPreviousRound={handlePreviousRound}
                    onNextRound={handleNextRound}
                    onReset={handleResetLeaderboard}
                    onSkipToEnd={skipToEnd}
                    infoText={`Maksimalni broj kandidata koji prolazi u sledeću rundu: ${matrixState.N}`}
                  >
                    {renderCandidates(matrixState, currentRound, visibleItems, candidatesContainerRef, setVisibleItems, showOnlySolution)} 
                  </RoundNavigation>
                </div>
              )}
            </>
          )}
        </>
      )}

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

      {!matrixState && !isLoading && (
        <div className="text-center text-muted-foreground p-12 bg-card rounded-lg">
          Unesi sekvencu i klikni Analiziraj da bi video vizualizaciju
        </div>
      )}
    </div>
  )
}
