"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trophy,
  Crown,
  Medal,
  Info,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ZoomableSpectrum } from "@/components/zoom_spectrum/visualization_controls"

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
}

interface Solution {
  peptide: string
  mass: number
  theoretical_spectrum: SpectrumItem[]
  number_of_matches: number
}

interface MatrixApiResponse {
  matrix: number[][]
  sequence: number[]
  amino_acids_in_peptids: Record<string, number>
  leaderboard: PeptideCandidate[][]
  solution: Solution
  N: number
  M: number
}

interface MatrixState {
  matrix: MatrixCell[][]
  currentStep: number
  sequence: number[]
  isComplete: boolean
  apiMatrix: number[][]
  amino_acids_in_peptids: Record<string, number>
  leaderboard: PeptideCandidate[][]
  solution: Solution
  N: number
  M: number
}

const fetchMatrixData = async (sequence: number[]): Promise<MatrixApiResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const size = sequence.length
  const matrix: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null))

  for (let i = 1; i < size; i++) {
    for (let j = 0; j < i; j++) {
      matrix[i][j] = Math.abs(sequence[i] - sequence[j])
    }
  }

  // Mock data for the matrix visualization
  const mockAminoAcidsInPeptids: Record<string, number> = {
    "57": 4,
    "71": 3,
    "87": 2,
    "97": 5,
    "99": 2,
    "101": 1,
    "103": 3,
    "113": 2,
    "114": 4,
    "115": 2,
    "128": 3,
    "129": 1,
    "131": 2,
    "137": 1,
    "147": 3,
    "156": 1,
    "163": 2,
    "186": 1,
  }

  // Mock data for leaderboard
  const mockLeaderboard: PeptideCandidate[][] = [
    [
      {
        peptide: "NQWK",
        number_of_matches: 12,
        spectrum: [
          { mass: 0, subpeptide: "" },
          { mass: 114, subpeptide: "N" },
          { mass: 128, subpeptide: "Q" },
          { mass: 186, subpeptide: "W" },
          { mass: 242, subpeptide: "NQ" },
          { mass: 300, subpeptide: "QW" },
          { mass: 314, subpeptide: "WK" },
          { mass: 428, subpeptide: "NQW" },
          { mass: 442, subpeptide: "QWK" },
          { mass: 556, subpeptide: "NQWK" },
        ],
        mass: 556,
        qualified: true,
      },
      {
        peptide: "FPAY",
        number_of_matches: 10,
        spectrum: [
          { mass: 0, subpeptide: "" },
          { mass: 71, subpeptide: "A" },
          { mass: 97, subpeptide: "P" },
          { mass: 147, subpeptide: "F" },
          { mass: 163, subpeptide: "Y" },
          { mass: 168, subpeptide: "PA" },
          { mass: 244, subpeptide: "FP" },
          { mass: 310, subpeptide: "PAY" },
          { mass: 315, subpeptide: "FPA" },
          { mass: 478, subpeptide: "FPAY" },
        ],
        mass: 478,
        qualified: true,
      },
    ],
    [
      {
        peptide: "NQWKG",
        number_of_matches: 14,
        spectrum: [
          { mass: 0, subpeptide: "" },
          { mass: 57, subpeptide: "G" },
          { mass: 114, subpeptide: "N" },
          { mass: 128, subpeptide: "Q" },
          { mass: 186, subpeptide: "W" },
          { mass: 242, subpeptide: "NQ" },
          { mass: 300, subpeptide: "QW" },
          { mass: 314, subpeptide: "WK" },
          { mass: 371, subpeptide: "KG" },
          { mass: 428, subpeptide: "NQW" },
          { mass: 442, subpeptide: "QWK" },
          { mass: 499, subpeptide: "WKG" },
          { mass: 556, subpeptide: "NQWK" },
          { mass: 613, subpeptide: "NQWKG" },
        ],
        mass: 613,
        qualified: true,
      },
      {
        peptide: "FPAYT",
        number_of_matches: 15,
        spectrum: [
          { mass: 0, subpeptide: "" },
          { mass: 71, subpeptide: "A" },
          { mass: 97, subpeptide: "P" },
          { mass: 101, subpeptide: "T" },
          { mass: 147, subpeptide: "F" },
          { mass: 163, subpeptide: "Y" },
          { mass: 168, subpeptide: "PA" },
          { mass: 172, subpeptide: "AT" },
          { mass: 234, subpeptide: "YT" },
          { mass: 244, subpeptide: "FP" },
          { mass: 310, subpeptide: "PAY" },
          { mass: 315, subpeptide: "FPA" },
          { mass: 411, subpeptide: "PAYT" },
          { mass: 478, subpeptide: "FPAY" },
          { mass: 579, subpeptide: "FPAYT" },
        ],
        mass: 579,
        qualified: true,
      },
    ],
  ]

  // Mock solution
  const mockSolution: Solution = {
    peptide: "FPAYT",
    mass: 579,
    theoretical_spectrum: [
      { mass: 0, subpeptide: "" },
      { mass: 71, subpeptide: "A" },
      { mass: 97, subpeptide: "P" },
      { mass: 101, subpeptide: "T" },
      { mass: 147, subpeptide: "F" },
      { mass: 163, subpeptide: "Y" },
      { mass: 168, subpeptide: "PA" },
      { mass: 172, subpeptide: "AT" },
      { mass: 234, subpeptide: "YT" },
      { mass: 244, subpeptide: "FP" },
      { mass: 310, subpeptide: "PAY" },
      { mass: 315, subpeptide: "FPA" },
      { mass: 411, subpeptide: "PAYT" },
      { mass: 478, subpeptide: "FPAY" },
      { mass: 579, subpeptide: "FPAYT" },
    ],
    number_of_matches: 15,
  }

  return {
    matrix,
    sequence,
    amino_acids_in_peptids: mockAminoAcidsInPeptids,
    leaderboard: mockLeaderboard,
    solution: mockSolution,
    N: 10,
    M: 18,
  }
}

const initializeMatrix = (apiResponse: MatrixApiResponse): MatrixState => {
  const size = apiResponse.sequence.length
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
    sequence: apiResponse.sequence,
    isComplete: false,
    apiMatrix: apiResponse.matrix,
    amino_acids_in_peptids: apiResponse.amino_acids_in_peptids,
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
    amino_acids_in_peptids: state.amino_acids_in_peptids,
    leaderboard: state.leaderboard,
    solution: state.solution,
    N: state.N,
    M: state.M,
  }
}

const STEP_DURATION = 1000

export default function ConvolutionPage() {
  const [sequence, setSequence] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [matrixState, setMatrixState] = useState<MatrixState | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

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
    setCurrentRound(0)
    if (matrixState) {
      const resetState = initializeMatrix({
        matrix: matrixState.apiMatrix,
        sequence: matrixState.sequence,
        amino_acids_in_peptids: matrixState.amino_acids_in_peptids,
        leaderboard: matrixState.leaderboard,
        solution: matrixState.solution,
        N: matrixState.N,
        M: matrixState.M,
      })
      setMatrixState(resetState)
    }
  }

  const skipToEnd = () => {
    if (matrixState && matrixState.leaderboard) {
      setCurrentRound(matrixState.leaderboard.length - 1)
      setIsAnimationComplete(true)
    }
  }

  useEffect(() => {
    if (matrixState && isPlaying && !matrixState.isComplete) {
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
  }, [matrixState, isPlaying, totalDuration])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numbers = sequence.split(",").map((num) => Number.parseInt(num.trim()))
    if (numbers.some(isNaN)) {
      alert("Unesite validne brojeve razdvojene zarezima")
      return
    }

    try {
      setIsLoading(true)
      setIsAnimationComplete(false)
      setCurrentRound(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      const apiResponse = await fetchMatrixData(numbers)
      const totalSteps = (numbers.length * (numbers.length - 1)) / 2
      const newTotalDuration = totalSteps * STEP_DURATION

      setTotalDuration(newTotalDuration)
      setCurrentTime(0)
      lastTimeRef.current = 0

      const initialState = initializeMatrix(apiResponse)
      setMatrixState(initialState)
      setIsPlaying(true)
    } catch (error) {
      console.error("Error fetching matrix data:", error)
      alert("Greška pri analizi sekvence. Pokušajte ponovo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimelineChange = (value: number[]) => {
    if (!matrixState) return

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
          Spektralna konvolucija je tehnika koja se koristi za identifikaciju aminokiselina koje mogu biti prisutne u
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
            odgovaraju aminokiselinama prisutnim u peptidu. Te aminokiseline se izdvajaju i koriste u <span className="italic">Leaderboard</span> algoritmu.
          </li>
        </ol>
        
        <p className="text-muted-foreground mb-6">
          Glavna prednost ovog algoritma jeste to što u samom startu smanjuje skup aminokiselina koje mogu da učestvuju u građenju peptida, čime se algoritam dosta
          ubrzava. Takođe, ovim se otvara mogućnost da se identifikuju nepoznate ili modifikovane aminokiseline.
          Još jedna od prednosti ovog algoritma jeste to što može da radi na eksperimentalnim spektrima koji imaju još više pogrešnih ili nedostajućih masa.
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

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unesi sekvencu</label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="npr. 0,114,128,163,186,227,291,341,404,518"
              className="max-w-md"
              disabled={isLoading}
            />
          </div>
          <div className="space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Analiziranje..." : "Analiziraj sekvencu"}
            </Button>
          </div>
        </form>
      </Card>

      {matrixState && (
        <>
          {/* Matrix Visualization Section */}
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

          {/* Only show the following sections after matrix animation is complete */}
          {matrixState && isAnimationComplete && (
            <>
              {/* Amino Acids Visualization */}
              {matrixState.amino_acids_in_peptids && (
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
                      {Object.entries(matrixState.amino_acids_in_peptids).map(([mass, count]) => (
                        <div key={mass} className="bg-secondary p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-lg">{mass} Da</span>
                            <span className="text-lg font-semibold">{count}x</span>
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

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={handlePreviousRound} disabled={currentRound === 0}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextRound}
                        disabled={currentRound === (matrixState?.leaderboard?.length ?? 0) - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setCurrentRound(0)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={skipToEnd} title="Preskoči do kraja">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Runda {currentRound + 1} od {matrixState.leaderboard.length}
                    </div>
                  </div>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                        Runda {currentRound + 1}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-1" />
                        Broj kandidata: {matrixState.N}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {matrixState.leaderboard[currentRound].map((candidate, index) => {
                        const isLastRound = currentRound === matrixState.leaderboard.length - 1

                        const isSolution =
                          candidate.peptide === matrixState.solution?.peptide || (isLastRound && candidate.qualified)

                        return (
                          <div
                            key={index}
                            className={`rounded-lg transition-colors duration-300 ${
                              isSolution
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
                                {index === 1 && !isSolution && <Medal className="h-5 w-5 mr-2 text-gray-400" />}
                                {index === 2 && !isSolution && <Medal className="h-5 w-5 mr-2 text-amber-600" />}

                                <span className="font-mono text-lg">
                                  {candidate.peptide}{" "}
                                  {candidate.peptide === matrixState.solution?.peptide && (
                                    <span className="text-green-600 text-sm">(Rešenje)</span>
                                  )}
                                </span>

                                {candidate.qualified && (
                                  <div className="ml-4 text-green-600 text-sm flex items-center">
                                    <ChevronRight className="h-4 w-4" />
                                    {isLastRound && candidate.qualified ? "Pobednik" : "Prolazi u sledeću rundu"}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <span className="text-primary font-semibold mr-4">
                                  Poklapanja: {candidate.number_of_matches}
                                </span>
                                <span className="text-muted-foreground">Masa: {candidate.mass} Da</span>
                              </div>
                            </div>

                            <div className="px-4 pb-4">
                              <p className="text-sm font-medium mb-2">Teorijski spektar:</p>
                              <ZoomableSpectrum
                                spectrum={candidate.spectrum}
                                experimentalSpectrum={matrixState.solution?.theoretical_spectrum.map(
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
                </div>
              )}
            </>
          )}
        </>
      )}

      {!matrixState && (
        <div className="text-center text-muted-foreground p-12 bg-card rounded-lg">
          Unesi sekvencu i klikni Analiziraj da bi video vizualizaciju
        </div>
      )}
    </div>
  )
}
