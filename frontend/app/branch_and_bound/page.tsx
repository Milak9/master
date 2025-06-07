"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { PlayCircle, PauseCircle, RotateCcw, ArrowRight, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  type TheoreticalSpectrum,
  type VisibleNode,
  calculateSvgDimensions,
  flattenTree,
  TreeVisualizationRenderer,
} from "@/components/tree_visualization"

interface TreeNode {
  node: string
  end: boolean
  candidate: boolean
  children: string[]
  spectrum?: number[]
  reason?: string
  mass: number
}

interface VisualizationResult {
  tree: {
    [key: string]: TreeNode
  }
  candidates: TheoreticalSpectrum
  solution: string[]
}

const fetchData = async (sequence: string): Promise<{ data: VisualizationResult; targetMass: number }> => {
  try {
    const numbers = sequence.split(",").map((num) => Number.parseInt(num.trim(), 10))
    if (numbers.some(isNaN)) {
      throw new Error("Nevalidna sekvenca brojeva. Unos treba da bude brojevi odvojeni zarezom.")
    }

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] < numbers[i - 1]) {
        throw new Error("Brojevi moraju biti uneti u rastućem poretku.")
      }
    }

    const targetMass = Math.max(...numbers)

    const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALHOST_URL}/sequencing/branch_and_bound/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target_spectrum: numbers }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return { data, targetMass }
  } catch (error) {
    console.error("Greška prilikom pozivanja backend-a:", error)
    throw error
  }
}

const getNodeTooltip = (node: TreeNode) => {
  if (node.end && node.reason) {
    return node.reason
  }

  if (node.end && node.candidate) {
    return "Masa je jednaka eksperimentalnoj masi, ovo je potencijalni kandidat za rešenje."
  }

  if (node.end && !node.candidate) {
    return "Masa je jednaka eksperimentalnoj masi, ali teorijski spektar ne odgovara eksperimentalnom spektru."
  }

  return ""
}

const getNodeColor = (node: TreeNode, isActive: boolean, targetMass: number) => {
  if (isActive) {
    return "rgb(59 130 246)" // Blue-500 for active nodes
  }

  if (node.mass && node.mass > targetMass) {
    return "rgb(239 68 68)" // Red-500 for nodes with mass > targetMass
  }

  if (node.end && !node.candidate) {
    return "rgb(239 68 68)" // Red-500 for end nodes that aren't candidates
  }

  if (node.candidate) {
    return "rgb(34 197 94)" // Green-500 for candidate nodes
  }

  return "rgb(209 213 219)" // Gray-300 for non-active nodes
}

export default function BranchAndBoundPage() {
  const [sequence, setSequence] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [visualizationData, setVisualizationData] = useState<VisualizationResult | null>(null)
  const [visibleNodes, setVisibleNodes] = useState<VisibleNode[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [lineProgress, setLineProgress] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const [svgDimensions, setSvgDimensions] = useState({
    width: "100%",
    height: 400,
    viewBox: "-600 -30 1200 600",
  })
  const [controlsEnabled, setControlsEnabled] = useState(false)
  const [targetMass, setTargetMass] = useState(0)

  const { toast } = useToast()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [treeBoundaries, setTreeBoundaries] = useState({
    minX: -600,
    maxX: 600,
    minY: -50,
    maxY: 550,
  })
  const [showOnlySolution, setShowOnlySolution] = useState(false)
  const [pendingShowOnlySolution, setPendingShowOnlySolution] = useState(false)

  const STEP_DURATION = 1000

  const handleNodeMouseEnter = (node: TreeNode, event: React.MouseEvent) => {
    const tooltip = getNodeTooltip(node)
    if (tooltip) {
      // Get the position relative to the viewport
      const rect = event.currentTarget.getBoundingClientRect()

      // Use viewport coordinates for fixed positioning
      const x = rect.left + rect.width / 2
      const y = rect.top

      setActiveTooltip(tooltip)
      setTooltipPosition({ x, y })
    }
  }

  const handleNodeMouseLeave = () => {
    setActiveTooltip(null)
  }

  const skipToEnd = () => {
    if (visualizationData) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)
      setCurrentStep(allNodes.length - 1)
      setLineProgress(100)
      setIsAnimationComplete(true)
      setIsPlaying(false)

      setVisibleNodes(allNodes)
      setCurrentTime(totalDuration)
    }
  }

  useEffect(() => {
    if (visualizationData && !showOnlySolution) {
      const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)
      setTotalDuration(allNodes.length * STEP_DURATION)

      // Calculate and set SVG dimensions based on tree structure
      const dimensions = calculateSvgDimensions(visualizationData.tree)
      setSvgDimensions(dimensions)

      // Extract viewBox values to set boundaries
      const viewBoxMatch = dimensions.viewBox.match(/-?\d+(\.\d+)?/g)
      if (viewBoxMatch && viewBoxMatch.length >= 4) {
        const [minX, minY, width, height] = viewBoxMatch.map(Number)
        setTreeBoundaries({
          minX,
          maxX: minX + width,
          minY,
          maxY: minY + height,
        })
      }
    }
  }, [visualizationData, targetMass, showOnlySolution])

  useEffect(() => {
    if (visualizationData && isPlaying && !showOnlySolution) {
      const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)

      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp
        const deltaTime = timestamp - lastTimeRef.current

        if (deltaTime >= STEP_DURATION) {
          lastTimeRef.current = timestamp
          if (currentStep < allNodes.length - 1) {
            setCurrentStep((prev) => prev + 1)
            setLineProgress(0)
          } else {
            setIsAnimationComplete(true)
            setIsPlaying(false)

            setVisibleNodes(
              allNodes.map((node) => ({
                ...node,
                isActive: false,
              })),
            )
            return
          }
        } else {
          setLineProgress((deltaTime / STEP_DURATION) * 100)
        }

        animationRef.current = requestAnimationFrame(animate)
      }

      // Reset animation state when starting
      if (isAnimationComplete && currentStep === allNodes.length - 1) {
        setCurrentStep(0)
        setLineProgress(0)
        setIsAnimationComplete(false)
      }

      lastTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [visualizationData, isPlaying, currentStep, isAnimationComplete, showOnlySolution])

  useEffect(() => {
    if (visualizationData && !showOnlySolution) {
      const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)
      const currentNodes = allNodes.slice(0, currentStep + 1)

      // If animation is complete, don't mark any node as active to allow proper coloring
      if (isAnimationComplete) {
        setVisibleNodes(currentNodes)
      } else {
        setVisibleNodes(
          currentNodes.map((node, index) => ({
            ...node,
            isActive: index === currentStep,
          })),
        )
      }

      setCurrentTime(currentStep * STEP_DURATION + (STEP_DURATION * lineProgress) / 100)
    }
  }, [visualizationData, currentStep, lineProgress, isAnimationComplete, showOnlySolution])

  const handleTimelineChange = (value: number[]) => {
    if (!visualizationData || showOnlySolution) return

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)

    const newTime = value[0]
    const newStep = Math.floor(newTime / STEP_DURATION)
    const newProgress = ((newTime % STEP_DURATION) / STEP_DURATION) * 100

    setCurrentTime(newTime)
    setCurrentStep(Math.min(newStep, flattenTree(visualizationData.tree, "Root", 0, 0).length - 1))
    setLineProgress(newProgress)
    lastTimeRef.current = 0
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => prev * 1.5)
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const MAX_PAN_OFFSET_X = 500 // Maximum pan offset in X axis direction
  const MAX_PAN_OFFSET_Y = 50 // Maximum pan offset in Y axis direction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      const newX = Math.max(Math.min(panOffset.x + dx, MAX_PAN_OFFSET_X), -MAX_PAN_OFFSET_X)
      const newY = Math.max(Math.min(panOffset.y + dy, MAX_PAN_OFFSET_Y), -MAX_PAN_OFFSET_Y)

      setPanOffset({ x: newX, y: newY })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowOnlySolution(pendingShowOnlySolution)
    try {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setCurrentStep(0)
      setVisibleNodes([])
      setLineProgress(0)
      setCurrentTime(0)
      lastTimeRef.current = 0
      setIsAnimationComplete(false)
      setControlsEnabled(true)
      setVisualizationData(null)

      // Set visualization data after resetting state
      setTimeout(async () => {
        try {
          const { data, targetMass: fetchedTargetMass } = await fetchData(sequence)
          setVisualizationData(data)
          setTargetMass(fetchedTargetMass)
          if (!showOnlySolution) {
            setIsPlaying(true)
          }
        } catch (error) {
          console.error("Greška prilikom dohvatanja podataka:", error)
          toast({
            title: "Greška",
            description: error instanceof Error ? error.message : "Nepoznata greška",
            variant: "destructive",
          })
        }
      }, 50)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleReset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)
    setCurrentStep(0)
    setVisibleNodes([])
    setLineProgress(0)
    setCurrentTime(0)
    lastTimeRef.current = 0
    setIsAnimationComplete(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Branch and Bound Algoritam</h1>

      <div className="prose prose-lg max-w-none mb-4">
        <p className="text-muted-foreground mb-4">
          Branch and Bound algoritam <Link href="/literature#2" className="text-blue-600 underline hover:text-blue-800">[2]</Link> je optimizovana verzija algoritma grube sile koja koristi strategiju "podeli pa
          vladaj" za efikasnije pretraživanje prostora rešenja. Za razliku od algoritma grube sile koji ispituje sve
          moguće kombinacije, Branch and Bound algoritam inteligentno eliminiše delove prostora pretrage koji ne mogu
          sadržati optimalno rešenje.
        </p>

        <p className="text-muted-foreground mb-4">
          U kontekstu sekvenciranja peptida, algoritam funkcioniše na sledeći način:
        </p>

        <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
          <li>
            <strong>Grananje (Branch):</strong> Algoritam gradi stablo pretrage gde svaki čvor predstavlja delimičnu
            sekvencu peptida. Svaki čvor se grana dodavanjem nove aminokiseline na postojeću sekvencu.
          </li>
          <li>
            <strong>Ograničavanje (Bound):</strong> Za svaki čvor, algoritam procenjuje da li taj put može dovesti do
            validnog rešenja. Ako masa peptida već premašuje ciljanu masu, ili ako teorijski spektar delimične sekvence
            peptida nije konzistentan sa eksperimentalnim, ta grana se "odseca" i dalje ne istražuje.
          </li>
          <li>
            <strong>Optimizacija:</strong> Algoritam može koristiti dodatne heuristike za procenu koje grane prvo
            istražiti, što dodatno ubrzava pronalaženje rešenja.
          </li>
        </ul>

        <p className="text-muted-foreground mb-4">
          Prednosti Branch and Bound algoritma u odnosu na algoritam grube sile su značajne:
        </p>

        <div className="bg-card rounded-lg p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Algoritam grube sile</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Istražuje sve moguće kombinacije</li>
                <li>Eksponencijalna vremenska složenost</li>
                <li>Garantuje pronalaženje svih rešenja</li>
                <li>Neefikasan za duže peptide</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Branch and Bound</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Inteligentno eliminiše neperspektivne grane</li>
                <li>
                  Značajno bolja vremenska složenost (u najgorem slučaju je i dalje eksponencijalne složenosti ali i
                  dalje dosta brži)
                </li>
                <li>I dalje garantuje pronalaženje svih rešenja</li>
                <li>Efikasniji za duže peptide</li>
              </ul>
            </div>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Kod za Branch and Bound algoritam</h3>
          <p className="text-muted-foreground mb-8">
            Algoritam na ulazu očekuje eksperimentalni spektar uređen rastuće koji uključuje 0 i masu celog peptida koji
            se sekvencira. Za razliku od algoritma grube sile, Branch and Bound algoritam koristi dodatne provere da bi
            eliminisao neperspektivne grane što ranije.
          </p>

          <div className="overflow-x-auto mt-4 mb-6">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def branch_and_bound(target_spectrum):
    peptides = ['']
    results = []
    target_peptide_mass = target_spectrum[-1]

    while len(peptides) > 0:
        extended_peptides = extend(peptides)
        candidates = []

        for peptide in extended_peptides:
            peptide_mass = calculate_peptide_mass(peptide)
            
            if peptide_mass == target_peptide_mass:
                if cyclic_spectrum(peptide) == target_spectrum:
                    results.append(peptide)
            elif peptide_mass < target_peptide_mass:
                # Branch and Bound optimizacija: provera da li je peptid konzistentan sa spektrom
                if is_consistent_with_spectrum(peptide, target_spectrum):
                    candidates.append(peptide)
                # Ako nije konzistentan, ova grana se "odseca" i ne istražuje dalje

        peptides = candidates

    return results`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-8">
            Ključna razlika u odnosu na algoritam grube sile je funkcija{" "}
            <span className="italic">is_consistent_with_spectrum</span> koja proverava da li je trenutni peptid
            konzistentan sa ciljnim spektrom:
          </p>

          <div className="overflow-x-auto mt-4 mb-6">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def is_consistent_with_spectrum(peptide, target_spectrum):
    # Generiši linearni spektar peptida
    peptide_spectrum = linear_spectrum(peptide)

    i = 0
    j = 0
    n = len(peptide_spectrum)
    m = len(target_spectrum)

    # Provera da li se svaka masa u okviru peptide_spectrum javlja i u okviru target_spectrum.
    # Ako neka masa postoji u okviru peptide_spectrum a ne u okviru target_spectrum to znaci da spektrum nije konzistentan,
    # obrnuto ne mora da važi, jer se računaju spektar parcijalnog peptida a ne još celog pa masa koja fali može da se pojavi.
    while i < n and j < m:
        if peptide_spectrum[i] == target_spectrum[j]:
            i += 1
            j += 1
        elif peptide_spectrum[i] > target_spectrum[j]:
            j += 1
        else:
            return False

    if i < n:
        return False
    else:
        return True`}
              </code>
            </pre>
          </div>

          <p className="text-muted-foreground mb-8">
            Funkcija <span className="italic">linear_spectrum</span> računa linearni spektar peptida, što je brže od
            računanja cikličnog spektra:
          </p>

          <div className="overflow-x-auto mt-4 mb-6">
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
              <code className="text-sm font-mono">
                {`def linear_spectrum(peptide):
    n = len(peptide)
    prefix_mass = [0 for _ in range(n + 1)]

    for i in range(n):
        amino_acid = peptide[i]
        prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

    spectrum = [0]  # Masa praznog peptida

    for i in range(n):
        for j in range(i + 1, n + 1):
            fragment_mass = prefix_mass[j] - prefix_mass[i]
            spectrum.append(fragment_mass)

    spectrum.sort()
    return spectrum`}
              </code>
            </pre>
          </div>
        </Card>

        <p className="text-muted-foreground mb-6">
          U vizuelizaciji ispod, možete videti kako algoritam gradi stablo pretrage i kako eliminiše grane koje ne mogu
          dovesti do rešenja jer teorijski spektar nije konzistentan. 
          Zeleni čvorovi predstavljaju potencijalna rešenja, crveni čvorovi su eliminisani, a plavi
          čvor je trenutno aktivan u pretrazi. Takođe drvo može da se zumira i pomera da bi lakše mogli da se vide svi čvorovi.<br/>
          Na kraju će biti prikazani peptidi koji predstavljaju najbolje kandidate za rešenje. Može imati više različitih kandidata
          s obzirom da različite aminokiseline mogu da imaju istu masu.<br/>
          Ako želite da unesete neke sekvence koje su duže kliknite na dugme da se prikažu samo rešenja. Zahvaljujući ovoj opciji,
          neće se prikazati drvo izvršavanja algoritma i samim tim biće omogućeno brzo prikazivanje samih kandidata za traženi spektar.
        </p>
        <p className="text-muted-foreground mb-2">
          Primeri peptida i njihovih teorijskih spektara:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
          <li>
            <strong>GA:</strong> [0, 57, 71, 128]
          </li>
          <li>
            <strong>NQE:</strong> [0, 114, 128, 129, 242, 243, 257, 371]
          </li>
        </ul>
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unesi sekvencu</label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="npr. 0, 57, 71, 128"
              className="max-w-lg"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pendingShowOnlySolution"
              checked={pendingShowOnlySolution}
              onChange={(e) => setPendingShowOnlySolution(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="pendingShowOnlySolution" className="text-sm text-muted-foreground">
              Prikaži samo rešenje (bez vizuelizacije)
            </label>
          </div>
          <div className="space-x-2">
            <Button type="submit">Analiziraj sekvencu</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {!showOnlySolution && (
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)} disabled={!controlsEnabled}>
              {isPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} disabled={!controlsEnabled}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={skipToEnd} title="Skip to end" disabled={!controlsEnabled}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {visualizationData && !showOnlySolution && (
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={totalDuration}
              step={1}
              onValueChange={handleTimelineChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0:00</span>
              <span>
                {Math.floor(totalDuration / 1000)}:{String(Math.floor((totalDuration % 1000) / 10)).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {!showOnlySolution && (
          <div className="flex items-center mb-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span>Pređite mišem preko crvenih ili zelenih čvorova za dodatne informacije</span>
          </div>
        )}

        <TreeVisualizationRenderer
          visualizationData={visualizationData}
          visibleNodes={visibleNodes}
          currentStep={currentStep}
          lineProgress={lineProgress}
          isAnimationComplete={isAnimationComplete}
          targetMass={targetMass}
          svgDimensions={svgDimensions}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          isDragging={isDragging}
          activeTooltip={activeTooltip}
          tooltipPosition={tooltipPosition}
          showOnlySolution={showOnlySolution}
          getNodeColor={getNodeColor}
          handleNodeMouseEnter={handleNodeMouseEnter}
          handleNodeMouseLeave={handleNodeMouseLeave}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleResetZoom={handleResetZoom}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
        />
      </div>
    </div>
  )
}
