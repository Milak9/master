"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { PlayCircle, PauseCircle, RotateCcw, ArrowRight, HelpCircle, Loader2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  type VisibleNode,
  calculateSvgDimensions,
  flattenTree,
  TreeVisualizationRenderer,
  VisualizationResult,
  TreeNode,
  downloadSVG
} from "@/components/tree_visualization"

const fetchData = async (sequence: string, setTargetMass: (mass: number) => void): Promise<VisualizationResult> => {
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

    const maxMass = Math.max(...numbers)
    setTargetMass(maxMass)

    const response = await fetch(`${process.env.NEXT_PUBLIC_LOCALHOST_URL}/sequencing/brute_force/`, {
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
    return data
  } catch (error) {
    console.error("Greška prilikom pozivanja backend-a:", error)
    throw error
  }
}

const getNodeTooltip = (node: TreeNode, targetMass: number): string | null => {
  if (node.mass === targetMass) {
    return `Masa čvora odgovara ciljanoj masi (${targetMass} Da). Ovo je potencijalno rešenje.`
  } else if (node.mass > targetMass) {
    return `Masa čvora (${node.mass} Da) je veća od ciljane mase (${targetMass} Da). Ovaj čvor je odbačen.`
  }
  return null
}

const getNodeColor = (node: TreeNode, isActive: boolean, targetMass: number): string => {
  if (isActive) {
    return "rgb(96 165 250)" // Blue 500
  } else if (node.end && node.mass === targetMass) {
    return "rgb(34 197 94)" // Green 500
  } else if (node.mass > targetMass) {
    return "rgb(239 68 68)" // Red 500
  } else {
    return "rgb(156 163 175)" // Gray 400
  }
}

export default function BruteForcePage() {
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
  const [targetMass, setTargetMass] = useState(0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const [svgDimensions, setSvgDimensions] = useState({
    width: "100%",
    height: 400,
    viewBox: "-600 -30 1200 600",
  })
  const [controlsEnabled, setControlsEnabled] = useState(false)
  const { toast } = useToast()

  const STEP_DURATION = 1000

  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showOnlySolution, setShowOnlySolution] = useState(false)
  const [pendingShowOnlySolution, setPendingShowOnlySolution] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

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

  const handleNodeMouseEnter = (node: TreeNode, event: React.MouseEvent) => {
    const tooltip = getNodeTooltip(node, targetMass)
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

  useEffect(() => {
    if (visualizationData && !showOnlySolution) {
      const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)
      setTotalDuration(allNodes.length * STEP_DURATION)

      // Calculate and set SVG dimensions based on tree structure
      const dimensions = calculateSvgDimensions(visualizationData.tree)
      setSvgDimensions(dimensions)
    }
  }, [visualizationData, targetMass, showOnlySolution])

  useEffect(() => {
    if (visualizationData && isPlaying && !showOnlySolution) {
      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp
        const deltaTime = timestamp - lastTimeRef.current

        if (deltaTime >= STEP_DURATION) {
          lastTimeRef.current = timestamp
          const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)
          if (currentStep < allNodes.length - 1) {
            setCurrentStep((prev) => prev + 1)
            setLineProgress(0)
          } else {
            setIsAnimationComplete(true)
            setIsPlaying(false)

            // When animation completes, set all nodes as inactive
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

      lastTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [visualizationData, isPlaying, currentStep, showOnlySolution])

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

  const triggerDownloadSVG = (() => {
    const toastMessage = downloadSVG(visualizationData, svgRef, svgDimensions, "brute-force")
    toast(toastMessage)
  })

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
      setIsLoading(true)

      try {
        const data = await fetchData(sequence, setTargetMass)
        setVisualizationData(data)
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
      } finally {
        setIsLoading(false)
      }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Algoritam grube sile</h1>

      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-muted-foreground mb-6">
          Algoritam grube sile (eng. Brute Force) <Link href="/literature#2" className="text-blue-600 underline hover:text-blue-800">[2]</Link> je najjednostavniji pristup rešavanju problema sekvenciranja
          antibiotika. Ovaj metod sistematski ispituje sve moguće kombinacije aminokiselina koje bi mogle formirati
          peptid zadate mase. Iako je ovaj pristup garantovano pronalazi tačno rešenje ako ono postoji, njegova
          vremenska složenost je eksponencijalna u odnosu na dužinu sekvence, što ga čini nepraktičnim za duže peptide.
        </p>

        <p className="text-muted-foreground mb-6">
          Na primer, za peptid mase 579 Da, algoritam će generisati sve moguće kombinacije aminokiselina i proveriti da
          li njihova ukupna masa odgovara zadatoj masi. Kao što je prikazano ispod, mogu postojati različiti peptidi sa
          istom ukupnom masom (FPAYT i QNWGS), što dodatno komplikuje problem.
        </p>

        <div className="bg-card rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">F</span>
                <span className="text-lg text-muted-foreground">147 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">P</span>
                <span className="text-lg text-muted-foreground">97 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">A</span>
                <span className="text-lg text-muted-foreground">71 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">Y</span>
                <span className="text-lg text-muted-foreground">163 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">T</span>
                <span className="text-lg text-muted-foreground">101 Da</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Ukupna masa:</span>
                  <span className="text-lg font-semibold">579 Da</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">Q</span>
                <span className="text-lg text-muted-foreground">128 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">N</span>
                <span className="text-lg text-muted-foreground">114 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">W</span>
                <span className="text-lg text-muted-foreground">186 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">G</span>
                <span className="text-lg text-muted-foreground">57 Da</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono">S</span>
                <span className="text-lg text-muted-foreground">94 Da</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Ukupna masa:</span>
                  <span className="text-lg font-semibold">579 Da</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Da bi se utvrdilo koji od peptida je tačno rešenje, algoritam mora da generiše teorijski spektar za svaki
          kandidat peptid i uporedi ga sa eksperimentalnim spektrom. Ovo dodatno povećava računsku složenost algoritma,
          ali je neophodno za pronalaženje tačnog rešenja.
        </p>

        <p className="text-muted-foreground mb-6">
          Naredni deo prikazuje implementaciju ovog algoritma u programskom jeziku Python.
        </p>
      </div>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Kod za algoritam grube sile</h3>
        <p className="text-muted-foreground mb-8">
          Algoritam na ulazu očekuje eksperimentalni spektar uređen rastuće koji uključuje 0 i masu celog peptida koji
          se sekvencira.
          <br />
          Implementacija algoritma grube sile počinje od praznog peptida i u svakom prolasku proširuje peptide
          dodavanjem aminokiseline uz pomoć funkcije <span className="italic">extends</span>. Za svaki korak, algoritam
          proverava da li je masa peptida jednaka ciljanoj masi. Ako jeste, proverava se da li teorijski spektar peptida
          odgovara eksperimentalnom spektru. U slučaju da je teorijski spektar jednak eksperimentalnom spektru taj
          peptid predstavlja rešenje algoritma. U slučaju da se teorijski spektar razlikuje od eksperimentalnog kandidat
          nije rešenje i on se odbacuje. Ako masa peptida prelazi ciljanu masu, taj peptid se odbacuje i na taj način se
          obezbeđuje smanjivanje broja peptida koji se proširuje u svakom koraku. Algoritam nastavlja sa peptidima čija
          je masa manja od ciljane mase i u sledećem koraku ih ponovo proširuje.
        </p>

        <div className="overflow-x-auto mt-6 mb-8">
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
            <code className="text-sm font-mono">
              {`def brute_force(target_spectrum)
  peptides = ['']
  results = []
  target_peptide_mass = target_spectrum[-1]

  while len(peptides) > 0:
      # Proširujemo peptide aminokiselinama
      extended_peptides = extend(peptides)

      candidates = []

      for peptide in extended_peptides:
          peptide_mass = calculate_peptide_mass(peptide)
          # Ako je masa jednaka traženoj masi, ovo je potencijalno rešenje
          if peptide_mass == target_peptide_mass:
              # Provera da li je ciklični spektar jednak traženom spektru
              if cyclic_spectrum(peptide) == target_spectrum:
                  results.append(peptide)
          # Ako je masa manja od tražene, peptid je i dalje potencijalno rešenje, inače se odbacuje
          elif peptide_mass < target_peptide_mass:
              candidates.append(peptide)

      peptides = candidates

  return results
`}
            </code>
          </pre>
        </div>

        <p className="text-muted-foreground mb-8">
          Funkcija <span className="italic">extends</span> koja proširuje peptide dodavanjem aminokiselina na peptide
          koji su ulaz u funkciju:
        </p>

        <div className="overflow-x-auto mt-6 mb-8">
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
            <code className="text-sm font-mono">
              {`def extend(peptides, amino_acid_candidates):
  extended_peptides = []

  for peptide in peptides:
      # Svaki od peptida proširujemo aminokiselinama
      for amino_acid in amino_acid_candidates:
          if amino_acid != "":
              extended_peptides.append(peptide + amino_acid)

  return extended_peptides`}
            </code>
          </pre>
        </div>

        <p className="text-muted-foreground mb-8">
          Funkcija <span className="italic">calculate_peptide_mass</span> računa masu peptida na osnovu tabele
          aminokiselina i njihovih masa:
        </p>

        <div className="overflow-x-auto mt-6 mb-8">
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
            <code className="text-sm font-mono">
              {`def calculate_peptide_mass(peptide):
  total_mass = 0

  for aa in peptide:
      total_mass += AMINO_ACID_MASSES[aa]

  return total_mass`}
            </code>
          </pre>
        </div>

        <p className="text-muted-foreground mb-8">
          Funkcija <span className="italic">cyclic_spectrum</span> računa teorijski cikličan spektar datog peptida.
          Razlika u odnosu na linear spektar je što ova funkcija uzima u obzir to da peptidi (npr. tirocidin) mogu biti
          ciklični i samim tim treba uvrstiti mase potpeptida koji počinju na krajnjim pozicijama peptida a završavaju
          se na početnim pozicijama.
          <br />
          Funkcija prvo na osnovu prefiksnih masa računa mase potpeptida i masu celog peptida. Potom prolazi kroz sam
          peptid i računa parcijalne mase, odnosno na osnovu prefiksnih masa (mase potpeptida) i njihovim međusobnim
          oduzimanjem dobija masu fragmenta u okviru peptida. Zbog uslova
        </p>
        <div className="overflow-x-auto mt-6 mb-8">
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
            <code className="text-sm font-mono">
              {`if i > 0 and j < n:
          spectrum.append(peptide_mass - fragment_mass)`}
            </code>
          </pre>
        </div>
        <p className="text-muted-foreground mb-8">
          osigurava da dodaje i mase cikličnih potpeptida, odnosno od mase celog peptida oduzeće masu nekog unutrašnjeg
          peptida čime će dobiti masu <span className="italic">spoljašnjeg</span> peptida.
        </p>

        <div className="overflow-x-auto mt-6 mb-8">
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md">
            <code className="text-sm font-mono">
              {`def cyclic_spectrum(peptide):
  n = len(peptide)

  prefix_mass = [0 for _ in range(n + 1)]

  for i in range(n):
      amino_acid = peptide[i]
      prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

  spectrum = [0] # masa praznog peptida
  peptide_mass = prefix_mass[-1] # masa celog peptida

  for i in range(n):
      for j in range(i + 1, n + 1):
          # Masa središnjeg dela peptida
          fragment_mass = prefix_mass[j] - prefix_mass[i]
          spectrum.append(fragment_mass)

          # Uslov za proveru da li se dodaje masa potpeptida koji obuhvata kraj i početak peptida
          if i > 0 and j < n:
              spectrum.append(peptide_mass - fragment_mass)

  spectrum.sort()
  return spectrum`}
            </code>
          </pre>
        </div>
      </Card>
      <p className="text-muted-foreground mb-6">
        U vizuelizaciji ispod, možete videti kako algoritam gradi stablo pretrage i kako se granama dolazi do listova drveta.
        Zeleni čvorovi predstavljaju potencijalna rešenja, crveni čvorovi su eliminisani, a plavi
        čvor je trenutno aktivan u pretrazi. Takođe drvo može da se zumira i pomera da bi lakše mogli da se vide svi čvorovi.
        Pošto je ovo algoritam grube sile vizuelizacija algoritma traje dugo i ima dosta potencijalnih rešenja,
        preporučuje se da se unose sekvence manjih peptida da bi moglo lepo da se vidi drvo izvršavanja.<br/>
        Na kraju će biti prikazani peptidi koji predstavljaju najbolje kandidate za rešenje. Može imati više različitih kandidata
        s obzirom da različite aminokiseline mogu da imaju istu masu.<br/>
        Ako želite da ipak unesete neke sekvence koje su duže kliknite na dugme da se prikažu samo rešenja. Zahvaljujući ovoj opciji,
        neće se prikazati drvo izvršavanja algoritma i samim tim biće omogućeno brzo prikazivanje samih kandidata za traženi spektar.
      </p>
      <p className="text-muted-foreground mb-2">
        Primeri peptida i njihovih teorijskih spektara:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
        <li>
          <strong>G:</strong> [0, 57]
        </li>
        <li>
          <strong>GA:</strong> [0, 57, 71, 128]
        </li>
      </ul>
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unesi sekvencu</label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="npr. 0, 57"
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

      <div className="space-y-4">
        {visualizationData && !showOnlySolution && !isLoading && (
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
            <Button
              variant="outline"
              size="icon"
              onClick={triggerDownloadSVG}
              title="Preuzmi SVG"
              disabled={!isAnimationComplete}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!showOnlySolution && !isLoading && visualizationData && (
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

        {visualizationData && !showOnlySolution && !isLoading && (
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
          isLoading={isLoading}
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
          svgRef={svgRef}
        />
      </div>
    </div>
  )
}
