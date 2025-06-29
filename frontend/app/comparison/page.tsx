"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react"

interface BasicSolution {
  execution_time: string
}

interface BruteForce extends BasicSolution {
  solution: string[]
}

interface BranchAndBound extends BruteForce {
}

interface LeaderboardSolution {
  peptide: string
  mass: number
  number_of_matches: number
}

interface Leaderboard extends BasicSolution {
  solution: LeaderboardSolution[]
}

interface Convolution extends Leaderboard {
}

interface VisualizationData {
  brute_force: BruteForce
  bnb: BranchAndBound
  leaderboard: Leaderboard
  convolution: Convolution
}

export default function Comparison() {
  const [sequence, setSequence] = useState("")
  const [targetMass, setTargetMass] = useState(0)
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      setTargetMass(Math.max(...parsedSequence))
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALHOST_URL}/sequencing/timed_executions/`, {
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const renderSolutionPreview = (algorithmType: string, solutions: any) => {
    if (!solutions || (Array.isArray(solutions) && solutions.length === 0)) {
      return <span className="text-muted-foreground text-sm">Nema rešenja</span>
    }

    let solutionsToShow: string[] = []

    if (algorithmType === "brute_force" || algorithmType === "bnb") {
      solutionsToShow = Array.isArray(solutions) ? solutions.slice(0, 4) : [solutions]
    } else if (algorithmType === "leaderboard" || algorithmType === "convolution") {
      solutionsToShow = solutions.slice(0, 4).map((sol: LeaderboardSolution) => sol.peptide)
    }

    const totalCount = Array.isArray(solutions) ? solutions.length : 1
    const hasMore = totalCount > 4

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {solutionsToShow.map((solution, idx) => (
            <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
              {solution}
            </span>
          ))}
        </div>
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollToSection(`${algorithmType}-section`)}
            className="text-xs h-6"
          >
            <ChevronDown className="h-3 w-3 mr-1" />
            Prikaži sve ({totalCount})
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Poređenje algoritama</h1>

      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-muted-foreground mb-6">
        Na ovoj stranici prikazaćemo razliku u brzini izvršavanja između algoritma grube sile, <span className="italic">Branch and Bound</span>, 
        {" "}<span className="italic">Leaderboard</span> i algoritma spektralne konvolucije.
        Biće kreirana tabela u kojoj se može videti poređenja u brzina a ispod tabele će se prikazati i rešenja koje je dao svaki od algoritama.
        </p>
      </div>

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
            <label className="block text-sm font-medium mb-2">Unesi eksperimentalni spektar</label>
            <Input
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            placeholder="npr. 0, 113, 114, 128, 129, 227, 240, 242, 257, 355, 356, 370, 370, 484"
            className="max-w-lg"
            disabled={isLoading}
            />
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

      {/* Execution Time Comparison Table */}
      {visualizationData && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Poređenje vremena izvršavanja</h2>
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-4 text-left font-semibold">Algoritam</th>
                    <th className="border p-4 text-left font-semibold">Vreme izvršavanja (u sekundama)</th>
                    <th className="border p-4 text-left font-semibold">Broj pronađenih rešenja</th>
                    <th className="border p-4 text-left font-semibold">Pregled rešenja</th>
                    <th className="border p-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-4 font-medium">Algoritam grube sile</td>
                    <td className="border p-4 font-mono">{visualizationData.brute_force.execution_time}</td>
                    <td className="border p-4">
                      {visualizationData.brute_force.solution ? visualizationData.brute_force.solution.length : 0}
                    </td>
                    <td className="border p-4 max-w-xs">
                      {renderSolutionPreview("brute_force", visualizationData.brute_force.solution)}
                    </td>
                    <td className="border p-4">
                      {visualizationData.brute_force.solution && visualizationData.brute_force.solution.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uspešno
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Bez rešenja
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-medium">Branch and Bound</td>
                    <td className="border p-4 font-mono">{visualizationData.bnb.execution_time}</td>
                    <td className="border p-4">
                      {visualizationData.bnb.solution ? visualizationData.bnb.solution.length : 0}
                    </td>
                    <td className="border p-4 max-w-xs">
                      {renderSolutionPreview("bnb", visualizationData.bnb.solution)}
                    </td>
                    <td className="border p-4">
                      {visualizationData.bnb.solution && visualizationData.bnb.solution.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uspešno
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Bez rešenja
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-medium">Leaderboard algoritam</td>
                    <td className="border p-4 font-mono">{visualizationData.leaderboard.execution_time}</td>
                    <td className="border p-4">
                      {visualizationData.leaderboard.solution ? visualizationData.leaderboard.solution.length : 0}
                    </td>
                    <td className="border p-4 max-w-xs">
                      {renderSolutionPreview("leaderboard", visualizationData.leaderboard.solution)}
                    </td>
                    <td className="border p-4">
                      {visualizationData.leaderboard.solution && visualizationData.leaderboard.solution.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uspešno
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Bez rešenja
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-medium">Spektralna konvolucija</td>
                    <td className="border p-4 font-mono">{visualizationData.convolution.execution_time}</td>
                    <td className="border p-4">
                      {visualizationData.convolution.solution ? visualizationData.convolution.solution.length : 0}
                    </td>
                    <td className="border p-4 max-w-xs">
                      {renderSolutionPreview("convolution", visualizationData.convolution.solution)}
                    </td>
                    <td className="border p-4">
                      {visualizationData.convolution.solution && visualizationData.convolution.solution.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uspešno
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Bez rešenja
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Analiza performansi</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Najbrži algoritam:</p>
                  <p className="text-muted-foreground">
                    {(() => {
                      const times = [
                        { name: "Algoritam grube sile", time: visualizationData.brute_force.execution_time },
                        { name: "Branch and Bound", time: visualizationData.bnb.execution_time },
                        { name: "Leaderboard algoritam", time: visualizationData.leaderboard.execution_time },
                        { name: "Spektralna konvolucija", time: visualizationData.convolution.execution_time },
                      ]

                      const fastest = times.reduce((min, current) => {
                        const currentTime = Number.parseFloat(current.time)
                        const minTime = Number.parseFloat(min.time)
                        return currentTime < minTime ? current : min
                      })

                      return `${fastest.name} (${fastest.time})`
                    })()}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Ukupno različitih rešenja:</p>
                  <p className="text-muted-foreground">
                    {(() => {
                      const uniqueSolutions = new Set()

                      if (visualizationData.brute_force.solution) {
                        visualizationData.brute_force.solution.forEach((sol) => uniqueSolutions.add(sol))
                      }

                      if (visualizationData.bnb.solution) {
                        visualizationData.bnb.solution.forEach((sol) => uniqueSolutions.add(sol))
                      }

                      if (visualizationData.leaderboard.solution) {
                        visualizationData.leaderboard.solution.forEach((sol) => uniqueSolutions.add(sol.peptide))
                      }

                      if (visualizationData.convolution.solution) {
                        visualizationData.convolution.solution.forEach((sol) => uniqueSolutions.add(sol.peptide))
                      }

                      return uniqueSolutions.size
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Brute Force algorithm */}
      {visualizationData && visualizationData.brute_force.solution && visualizationData.brute_force.solution.length > 0 && (
        <div id="brute_force-section" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Brute Force algoritam</h2>

          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                {Array.isArray(visualizationData.brute_force.solution)
                  ? visualizationData.brute_force.solution.length === 1
                    ? "Pronađeno rešenje"
                    : "Pronađena rešenja"
                  : "Pronađeno rešenje"}
              </h3>
            </div>

            <p className="text-lg mb-2">
              {Array.isArray(visualizationData.brute_force.solution) ? (
                visualizationData.brute_force.solution.length === 1 ? (
                  <>
                    Peptid{" "}
                    <span className="font-mono font-bold text-green-700 dark:text-green-300">
                      {visualizationData.brute_force.solution[0]}
                    </span>{" "}
                    je identifikovan kao tačno rešenje.
                  </>
                ) : (
                  <>
                    Peptidi{" "}
                    <span className="font-mono font-bold text-green-700 dark:text-green-300">
                      {visualizationData.brute_force.solution.join(", ")}
                    </span>{" "}
                    su identifikovani kao tačna rešenja.
                  </>
                )
              ) : (
                <>
                  Peptid{" "}
                  <span className="font-mono font-bold text-green-700 dark:text-green-300">
                    {visualizationData.brute_force.solution}
                  </span>{" "}
                  je identifikovan kao tačno rešenje.
                </>
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              {Array.isArray(visualizationData.brute_force.solution)
                ? visualizationData.brute_force.solution.length === 1
                  ? "Ovaj peptid ima"
                  : "Ovi peptidi imaju"
                : "Ovaj peptid ima"}{" "}
              masu od {targetMass} Da i{" "}
              {Array.isArray(visualizationData.brute_force.solution)
                ? visualizationData.brute_force.solution.length === 1
                  ? "njegov teorijski spektar je jednak"
                  : "njihovi teorijski spektri su jednaki"
                : "njegov teorijski spektar je jednak"}{" "}
              eksperimentalnom spektru.
            </p>
          </div>
        </div>
      )}

      {visualizationData && (!visualizationData.brute_force.solution || (Array.isArray(visualizationData.brute_force.solution) && visualizationData.brute_force.solution.length === 0)) && (
          <div id="brute_force-section" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Brute Force algoritam</h2>
            <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">
                  Nisu pronađeni peptidi čiji teorijski spektri odgovaraju traženom.
                </h3>
              </div>
            </div>
          </div>
        )}

      {/* Branch and Bound algorithm */}
      {visualizationData && visualizationData.bnb.solution && visualizationData.bnb.solution.length > 0 && (
        <div id="bnb-section" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Branch and Bound algoritam</h2>

          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                {Array.isArray(visualizationData.bnb.solution)
                  ? visualizationData.bnb.solution.length === 1
                    ? "Pronađeno rešenje"
                    : "Pronađena rešenja"
                  : "Pronađeno rešenje"}
              </h3>
            </div>

            <p className="text-lg mb-2">
              {Array.isArray(visualizationData.bnb.solution) ? (
                visualizationData.bnb.solution.length === 1 ? (
                  <>
                    Peptid{" "}
                    <span className="font-mono font-bold text-green-700 dark:text-green-300">
                      {visualizationData.bnb.solution[0]}
                    </span>{" "}
                    je identifikovan kao tačno rešenje.
                  </>
                ) : (
                  <>
                    Peptidi{" "}
                    <span className="font-mono font-bold text-green-700 dark:text-green-300">
                      {visualizationData.bnb.solution.join(", ")}
                    </span>{" "}
                    su identifikovani kao tačna rešenja.
                  </>
                )
              ) : (
                <>
                  Peptid{" "}
                  <span className="font-mono font-bold text-green-700 dark:text-green-300">
                    {visualizationData.bnb.solution}
                  </span>{" "}
                  je identifikovan kao tačno rešenje.
                </>
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              {Array.isArray(visualizationData.bnb.solution)
                ? visualizationData.bnb.solution.length === 1
                  ? "Ovaj peptid ima"
                  : "Ovi peptidi imaju"
                : "Ovaj peptid ima"}{" "}
              masu od {targetMass} Da i{" "}
              {Array.isArray(visualizationData.bnb.solution)
                ? visualizationData.bnb.solution.length === 1
                  ? "njegov teorijski spektar je jednak"
                  : "njihovi teorijski spektri su jednaki"
                : "njegov teorijski spektar je jednak"}{" "}
              eksperimentalnom spektru.
            </p>
          </div>
        </div>
      )}

      {visualizationData && (!visualizationData.bnb.solution || (Array.isArray(visualizationData.bnb.solution) && visualizationData.bnb.solution.length === 0)) && (
          <div id="bnb-section" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Branch and Bound algoritam</h2>
            <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">
                  Nisu pronađeni peptidi čiji teorijski spektri odgovaraju traženom.
                </h3>
              </div>
            </div>
          </div>
        )}

      {/* Leaderboard algorithm */}
      {visualizationData && visualizationData.leaderboard.solution && (
        <div id="leaderboard-section" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Leaderboard algoriam</h2>
          {visualizationData.leaderboard.solution.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Ukupno različitih rešenja: {visualizationData.leaderboard.solution.length}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {visualizationData.leaderboard.solution.map((sol: any, idx: any) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-800"
                  >
                    <div className="font-mono">{sol.peptide}</div>
                    <div className="text-sm text-muted-foreground">Masa: {sol.mass} Da</div>
                    <div className="text-sm text-muted-foreground">Poklapanja: {sol.number_of_matches}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {visualizationData.leaderboard.solution.length == 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="text-lg font-semibold flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                Nisu pronađeni peptidi čiji teorijski spektri odgovaraju traženom.
              </h4>
            </div>
          )}
        </div>
      )}

      {/* Spectral Convolution algorithm */}
      {visualizationData && visualizationData.convolution.solution && (
        <div id="convolution-section" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Spektralna konvolucija</h2>
          {visualizationData.convolution.solution.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Ukupno različitih rešenja: {visualizationData.convolution.solution.length}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {visualizationData.convolution.solution.map((sol: any, idx: any) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-800"
                  >
                    <div className="font-mono">{sol.peptide}</div>
                    <div className="text-sm text-muted-foreground">Masa: {sol.mass} Da</div>
                    <div className="text-sm text-muted-foreground">Poklapanja: {sol.number_of_matches}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {visualizationData.convolution.solution.length == 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="text-lg font-semibold flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                Nisu pronađeni peptidi čiji teorijski spektri odgovaraju traženom.
              </h4>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
