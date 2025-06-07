"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCcw, Trophy, Crown, Medal, ArrowRight, Info, CheckCircle, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ZoomableSpectrum } from "@/components/zoom_spectrum/visualization_controls"

interface RoundNavigationProps {
  showOnlySolution: boolean
  currentRound: number
  totalRounds: number
  onPreviousRound: () => void
  onNextRound: () => void
  onReset: () => void
  onSkipToEnd: () => void
  disabled?: boolean
  infoText?: string
  children?: React.ReactNode
  className?: string
}

export function renderCandidates(
    data: any, 
    currentRound: number,
    visibleItems: number,
    candidatesContainerRef: any,
    setVisibleItems: any,
    showOnlySolution: boolean
) {
    if (!data?.leaderboard?.[currentRound]) return null

    const isLastRound = currentRound === data.leaderboard.length - 1
    const candidates = data.leaderboard[currentRound]

    return (
      <Card className="p-6">
        {!showOnlySolution && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Runda {currentRound + 1}
            </h3>
            {!isLastRound && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-1" />
                Maksimalni broj kandidata koji prolazi u sledeću rundu: {data.N}
              </div>
              )
            }
          </div>
        )}

        {/* Solutions section */}
        {(isLastRound || showOnlySolution) && data.solution.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-lg font-semibold mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Ukupno različitih rešenja: {data.solution.length}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {data.solution.map((sol: any, idx: any) => (
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
        {(isLastRound || showOnlySolution) && data.solution.length == 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="text-lg font-semibold flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
              Nisu pronađeni peptidi čiji teorijski spektri odgovaraju traženom.
            </h4>
          </div>
        )}

        {!showOnlySolution && (
          <div
            ref={candidatesContainerRef}
            className="space-y-6 max-h-[800px] overflow-y-auto pr-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {candidates.slice(0, visibleItems).map((candidate: any, index: any) => {
              const isSolution = data.solution.some((sol: any) => sol.peptide === candidate.peptide)
              const isCandidate = candidate.candidate === true

              return (
                <div
                  key={index}
                  className={`rounded-lg transition-colors duration-300 ${
                    candidate.qualified || isCandidate
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

                      <div className="relative group">
                        <span className="font-mono text-lg">{candidate.peptide}</span>
                        <span className="ml-2 text-sm text-muted-foreground">({candidate.mass} Da)</span>

                        {candidate.reason && (
                          <div className="relative inline-block ml-2">
                            <div className="cursor-help bg-gray-200 dark:bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              ?
                            </div>
                            <div className="absolute z-20 invisible group-hover:visible bg-black text-white text-sm rounded p-2 w-64 top-0 left-full ml-2 transform -translate-y-1/2">
                              {candidate.reason}
                              <div className="absolute top-1/2 left-0 w-2 h-2 bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {candidate.qualified && (
                        <div className="ml-4 text-green-600 text-sm flex items-center">
                          <ChevronRight className="h-4 w-4" />
                          {isLastRound && isSolution ? "Pobednik" : "Prolazi u sledeću rundu"}
                        </div>
                      )}
                    </div>
                    <span className="text-primary font-semibold">Poklapanja: {candidate.number_of_matches}</span>
                  </div>

                  <div className="px-4 pb-4">
                    <p className="text-sm font-medium mb-2">Teorijski spektar:</p>
                    <ZoomableSpectrum
                      spectrum={candidate.spectrum}
                      experimentalSpectrum={data.solution[0]?.spectrum.map((item: any) => item.mass) || []}
                      peptide={candidate.peptide}
                      qualified={candidate.qualified}
                      isSolution={isSolution}
                      height={180}
                    />
                  </div>
                </div>
              )
            })}

            {visibleItems < candidates.length && (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Prikazano {visibleItems} od {candidates.length} kandidata
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleItems((prev: any) => Math.min(prev + 10, candidates.length))}
                >
                  Učitaj još
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

export function RoundNavigation({
  showOnlySolution,
  currentRound,
  totalRounds,
  onPreviousRound,
  onNextRound,
  onReset,
  onSkipToEnd,
  disabled = false,
  infoText,
  children,
  className,
}: RoundNavigationProps) {
  return (
    <div className={className}>
      {!showOnlySolution && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={onPreviousRound} disabled={disabled || currentRound === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextRound}
              disabled={disabled || currentRound === totalRounds - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onReset} disabled={disabled}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onSkipToEnd} disabled={disabled} title="Preskoči do kraja">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Runda {currentRound + 1} od {totalRounds}
          </div>
        </div>
      )}

      {children ? (
        children
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Runda {currentRound + 1}</h3>
            {infoText && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-1" />
                {infoText}
              </div>
            )}
          </div>
          <div className="text-center text-muted-foreground py-8">
            {disabled ? "Nema podataka za prikaz" : "Sadržaj runde će biti prikazan ovde"}
          </div>
        </Card>
      )}
    </div>
  )
}
