"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TreeNode {
  node: string
  mass: number
  end: boolean
  children: string[]
}

interface VisualizationResult {
  tree: {
    [key: string]: TreeNode
  }
  candidates: TheoreticalSpectrum
  solution: string[]
}

interface VisibleNode {
  node: TreeNode
  x: number
  y: number
  parentX?: number
  parentY?: number
  isActive?: boolean
}

interface SpectrumItem {
  mass: number
  subpeptide: string
}

interface TheoreticalSpectrum {
  [peptide: string]: SpectrumItem[]
}

const NODE_RADIUS = 35

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

    const response = await fetch("http://localhost:8000/sequencing/brute_force/", {
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

const renderSpectrum = (spectrum: SpectrumItem[], isSolution: boolean) => {
  const maxMass = Math.max(...spectrum.map((item) => item.mass))

  return (
    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg mt-4 mb-12 px-4 pt-8 pb-10">
      {spectrum.map((item, index) => {
        // Calculate position with padding to keep values inside the box
        const position = (index / (spectrum.length - 1)) * (100 - 8) + 4
        const height = Math.max(20, (item.mass / maxMass) * 60)

        return (
          <div
            key={index}
            className="absolute bottom-10"
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          >
            <div className="text-xs font-mono text-center absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-16 overflow-visible whitespace-nowrap">
              {item.subpeptide || "-"}
            </div>

            <div
              className={`w-3 ${isSolution ? "bg-green-500" : "bg-blue-500"}`}
              style={{
                height: `${height}px`,
                minHeight: "20px",
              }}
            />

            <div className="text-xs text-center absolute top-full mt-1 left-1/2 transform -translate-x-1/2 w-12 overflow-visible whitespace-nowrap">
              {item.mass}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const calculateEdgePoint = (x1: number, y1: number, x2: number, y2: number, radius: number) => {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return {
    x: x1 + radius * Math.cos(angle),
    y: y1 + radius * Math.sin(angle),
  }
}

const flattenTree = (
  treeMap: { [key: string]: TreeNode },
  nodeName: string,
  x: number,
  y: number,
  parentX?: number,
  parentY?: number,
  result: VisibleNode[] = [],
): VisibleNode[] => {
  const node = treeMap[nodeName]
  if (!node) return result

  result.push({ node, x, y, parentX, parentY })

  const levelHeight = 90

  const childrenCount = node.children.length
  if (childrenCount === 0) return result

  const subtreeWidths: number[] = []
  let totalSubtreeWidth = 0

  for (const childName of node.children) {
    const childNode = treeMap[childName]
    if (childNode) {
      const { width } = getTreeDimensions(treeMap, childName)
      subtreeWidths.push(width)
      totalSubtreeWidth += width
    }
  }

  const siblingSpacing = 140

  // Position for the leftmost child
  let currentX = x - (totalSubtreeWidth * siblingSpacing) / 2

  // Position each child based on its subtree width
  node.children.forEach((childName, index) => {
    const childNode = treeMap[childName]
    if (childNode) {
      const subtreeWidth = subtreeWidths[index]
      const childX = currentX + (subtreeWidth * siblingSpacing) / 2
      const childY = y + levelHeight

      flattenTree(treeMap, childName, childX, childY, x, y, result)

      // Move to the next child position
      currentX += subtreeWidth * siblingSpacing
    }
  })

  return result
}

const getTreeDimensions = (
  treeMap: { [key: string]: TreeNode },
  nodeName: string,
): { width: number; depth: number } => {
  const node = treeMap[nodeName]
  if (!node || node.children.length === 0) {
    return { width: 1, depth: 1 }
  }

  let totalWidth = 0
  let maxDepth = 0

  for (const childName of node.children) {
    const childNode = treeMap[childName]
    if (childNode) {
      const { width, depth } = getTreeDimensions(treeMap, childName)
      totalWidth += width
      maxDepth = Math.max(maxDepth, depth)
    }
  }

  return { width: totalWidth, depth: maxDepth + 1 }
}

const calculateSvgDimensions = (treeMap: { [key: string]: TreeNode }) => {
  const { width, depth } = getTreeDimensions(treeMap, "Root")

  // Base dimensions
  const baseWidth = 1200
  const baseHeight = 400

  // Scale factors
  const widthScale = Math.max(1, width / 5) * 1.2
  const depthScale = Math.max(1, depth / 4) * 0.9

  // Calculate dimensions
  const svgWidth = baseWidth * widthScale
  const svgHeight = baseHeight * depthScale

  // Calculate viewBox
  const viewBoxWidth = svgWidth
  const viewBoxHeight = svgHeight
  const viewBoxX = -viewBoxWidth / 2
  const viewBoxY = -50

  return {
    width: "100%",
    height: svgHeight,
    viewBox: `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`,
  }
}

const getNodeColor = (node: TreeNode, isActive: boolean, targetMass: number) => {
  if (isActive) {
    return "rgb(59 130 246)" // Blue when active
  }

  if (node.mass > targetMass) {
    return "rgb(239 68 68)" // Red for over target mass
  }

  if (node.mass === targetMass && node.end) {
    return "rgb(34 197 94)" // Green for target mass end nodes
  }

  return "rgb(209 213 219)" // Gray for other nodes
}

const getNodeTooltip = (node: TreeNode, targetMass: number) => {
  if (node.mass === targetMass && node.end) {
    return "Masa je jednaka eksperimentalnoj masi, ovo je potencijalni kandidat za rešenje."
  }
  if (node.mass > targetMass) {
    return "Masa je veća od najveće eksperimentalne mase, samim tim ovaj peptid nije kandidat za rešenje."
  }
  return ""
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
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
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
    if (tooltip && containerRef.current) {
      // Get the position relative to the viewport
      const rect = event.currentTarget.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()

      // Calculate position relative to the container
      const x = rect.left + rect.width / 2 - containerRect.left
      const y = rect.top - containerRect.top

      setActiveTooltip(tooltip)
      setTooltipPosition({ x, y })
    }
  }

  const handleNodeMouseLeave = () => {
    setActiveTooltip(null)
  }

  useEffect(() => {
    if (visualizationData) {
      const allNodes = flattenTree(visualizationData.tree, "Root", 0, 0)
      setTotalDuration(allNodes.length * STEP_DURATION)

      // Calculate and set SVG dimensions based on tree structure
      const dimensions = calculateSvgDimensions(visualizationData.tree)
      setSvgDimensions(dimensions)
    }
  }, [visualizationData, targetMass])

  useEffect(() => {
    if (visualizationData && isPlaying) {
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
  }, [visualizationData, isPlaying, currentStep])

  useEffect(() => {
    if (visualizationData) {
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
  }, [visualizationData, currentStep, lineProgress, isAnimationComplete])

  const handleTimelineChange = (value: number[]) => {
    if (!visualizationData) return

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

      setTimeout(async () => {
        try {
          const data = await fetchData(sequence, setTargetMass)
          setVisualizationData(data)
          setIsPlaying(true)
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

  const MAX_PAN_OFFSET = 500 // Maximum pan offset in any direction

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      const newX = Math.max(Math.min(panOffset.x + dx, MAX_PAN_OFFSET), -MAX_PAN_OFFSET)
      const newY = Math.max(Math.min(panOffset.y + dy, MAX_PAN_OFFSET), -MAX_PAN_OFFSET)

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
          Algoritam grube sile (eng. Brute Force) je najjednostavniji pristup rešavanju problema sekvenciranja
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
          ciklični i samim tim treba uvrstiti mase podpeptida koji počinju na krajnjim pozicijama peptida a završavaju
          se na početnim pozicijama.
          <br />
          Funkcija prvo na osnovu prefiksnih masa računa mase podpeptida i masu celog peptida. Potom prolazi kroz sam
          peptid i računa parcijalne mase, odnosno na osnovu prefiksnih masa (mase podpeptida) i njihovim međusobnim
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
          osigurava da dodaje i mase cikličnih podpeptida, odnosno od mase celog peptida oduzeće masu nekog unutrašnjeg
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

          # Uslov za proveru da li se dodaje masa podpeptida koji obuhvata kraj i početak peptida
          if i > 0 and j < n:
              spectrum.append(peptide_mass - fragment_mass)

  spectrum.sort()
  return spectrum`}
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
              placeholder="Unesi sekvencu..."
              className="max-w-md"
            />
          </div>
          <div className="space-x-2">
            <Button type="submit">Analiziraj sekvencu</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
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

        {visualizationData && (
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

        <div className="flex items-center mb-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4 mr-2" />
          <span>Pređite mišem preko crvenih ili zelenih čvorova za dodatne informacije</span>
        </div>

        <div ref={containerRef} className="bg-card rounded-lg p-6 min-h-[300px] overflow-auto relative">
          {/* Tooltip */}
          {activeTooltip && (
            <div
              className="absolute z-20 bg-black/80 text-white p-2 rounded-md text-sm max-w-xs pointer-events-none"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y - 10}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              {activeTooltip}
              <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-black/80 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
            </div>
          )}

          {visualizationData ? (
            <>
              <div className="relative overflow-hidden" style={{ height: svgDimensions.height }}>
                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                  <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleResetZoom} title="Reset Zoom">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                {zoomLevel > 1 && (
                  <div className="absolute top-2 left-2 text-sm text-muted-foreground flex items-center z-10 bg-background/80 p-1 rounded">
                    <Move className="h-4 w-4 mr-1" />
                    <span>Prevuci za pomeranje</span>
                  </div>
                )}
                <svg
                  ref={svgRef}
                  width={svgDimensions.width}
                  height={svgDimensions.height}
                  viewBox={svgDimensions.viewBox}
                  preserveAspectRatio="xMidYMid meet"
                  className={`mx-auto ${isDragging ? "cursor-grabbing" : zoomLevel > 1 ? "cursor-grab" : "cursor-default"}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                  }}
                >
                  <g>
                    {visibleNodes.map((visibleNode, index) => {
                      const isLastNode = index === visibleNodes.length - 1
                      const hasTooltip = visibleNode.node.mass === targetMass || visibleNode.node.mass > targetMass

                      if (visibleNode.parentX !== undefined && visibleNode.parentY !== undefined) {
                        const startPoint = calculateEdgePoint(
                          visibleNode.parentX,
                          visibleNode.parentY,
                          visibleNode.x,
                          visibleNode.y,
                          NODE_RADIUS,
                        )

                        const endPoint = calculateEdgePoint(
                          visibleNode.x,
                          visibleNode.y,
                          visibleNode.parentX,
                          visibleNode.parentY,
                          NODE_RADIUS,
                        )

                        const progress = isLastNode && !isAnimationComplete ? lineProgress : 100
                        const currentEndPoint = {
                          x: startPoint.x + (endPoint.x - startPoint.x) * (progress / 100),
                          y: startPoint.y + (endPoint.y - startPoint.y) * (progress / 100),
                        }

                        return (
                          <g key={`${visibleNode.node.node}-${index}`}>
                            <line
                              x1={startPoint.x}
                              y1={startPoint.y}
                              x2={currentEndPoint.x}
                              y2={currentEndPoint.y}
                              stroke="gray"
                              strokeWidth="2"
                              className="transition-all duration-300"
                            />
                            <circle
                              cx={visibleNode.x}
                              cy={visibleNode.y}
                              r={NODE_RADIUS}
                              fill={getNodeColor(visibleNode.node, visibleNode.isActive || false, targetMass)}
                              className={`transition-colors duration-300 ${hasTooltip ? "cursor-pointer" : ""}`}
                              onMouseEnter={(e) => hasTooltip && handleNodeMouseEnter(visibleNode.node, e)}
                              onMouseLeave={handleNodeMouseLeave}
                            />
                            <text
                              x={visibleNode.x}
                              y={visibleNode.y - 10}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="16"
                              pointerEvents="none"
                            >
                              {visibleNode.node.node}
                            </text>
                            <text
                              x={visibleNode.x}
                              y={visibleNode.y + 10}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="14"
                              pointerEvents="none"
                            >
                              {visibleNode.node.mass} Da
                            </text>
                            {hasTooltip && (
                              <circle
                                cx={visibleNode.x + NODE_RADIUS * 0.9}
                                cy={visibleNode.y - NODE_RADIUS * 0.9}
                                r={8}
                                fill="white"
                                className="cursor-pointer"
                                onMouseEnter={(e) => handleNodeMouseEnter(visibleNode.node, e)}
                                onMouseLeave={handleNodeMouseLeave}
                              />
                            )}
                            {hasTooltip && (
                              <text
                                x={visibleNode.x + NODE_RADIUS * 0.9}
                                y={visibleNode.y - NODE_RADIUS * 0.9}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={visibleNode.node.mass > targetMass ? "rgb(239 68 68)" : "rgb(34 197 94)"}
                                fontSize="12"
                                fontWeight="bold"
                                pointerEvents="none"
                              >
                                ?
                              </text>
                            )}
                          </g>
                        )
                      }

                      return (
                        <g key={`${visibleNode.node.node}-${index}`}>
                          <circle
                            cx={visibleNode.x}
                            cy={visibleNode.y}
                            r={NODE_RADIUS}
                            fill={getNodeColor(visibleNode.node, visibleNode.isActive || false, targetMass)}
                            className={`transition-colors duration-300 ${hasTooltip ? "cursor-pointer" : ""}`}
                            onMouseEnter={(e) => hasTooltip && handleNodeMouseEnter(visibleNode.node, e)}
                            onMouseLeave={handleNodeMouseLeave}
                          />
                          <text
                            x={visibleNode.x}
                            y={visibleNode.y - 10}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="16"
                            pointerEvents="none"
                          >
                            {visibleNode.node.node}
                          </text>
                          <text
                            x={visibleNode.x}
                            y={visibleNode.y + 10}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="14"
                            pointerEvents="none"
                          >
                            {visibleNode.node.mass} Da
                          </text>
                          {hasTooltip && (
                            <circle
                              cx={visibleNode.x + NODE_RADIUS * 0.9}
                              cy={visibleNode.y - NODE_RADIUS * 0.9}
                              r={8}
                              fill="white"
                              className="cursor-pointer"
                              onMouseEnter={(e) => handleNodeMouseEnter(visibleNode.node, e)}
                              onMouseLeave={handleNodeMouseLeave}
                            />
                          )}
                          {hasTooltip && (
                            <text
                              x={visibleNode.x + NODE_RADIUS * 0.9}
                              y={visibleNode.y - NODE_RADIUS * 0.9}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={visibleNode.node.mass > targetMass ? "rgb(239 68 68)" : "rgb(34 197 94)"}
                              fontSize="12"
                              fontWeight="bold"
                              pointerEvents="none"
                            >
                              ?
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </g>
                </svg>
              </div>

              {isAnimationComplete && visualizationData.candidates && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Kandidati sa masom {targetMass} Da:</h3>

                  <div className="space-y-6">
                    {Object.entries(visualizationData.candidates).map(([peptide, spectrum], index) => {
                      const isSolution = visualizationData.solution.includes(peptide)

                      return (
                        <div
                          key={peptide}
                          className={`p-4 rounded-lg ${isSolution ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800/50"}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              {isSolution && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                              <h4
                                className={`text-lg font-medium ${isSolution ? "text-green-700 dark:text-green-300" : ""}`}
                              >
                                {peptide}{" "}
                                {isSolution && (
                                  <span className="text-sm font-normal text-green-600 dark:text-green-400">
                                    (Rešenje)
                                  </span>
                                )}
                              </h4>
                            </div>
                            <span className="text-sm text-muted-foreground">Masa: {targetMass} Da</span>
                          </div>

                          <div className="mb-2">
                            <p className="text-sm font-medium mb-2">Teorijski spektar:</p>
                            {renderSpectrum(spectrum, isSolution)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isAnimationComplete && visualizationData.solution && visualizationData.solution.length > 0 && (
                <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                      {visualizationData.solution.length === 1 ? "Pronađeno rešenje" : "Pronađena rešenja"}
                    </h3>
                  </div>

                  <p className="text-lg mb-2">
                    {visualizationData.solution.length === 1 ? (
                      <>
                        Peptid{" "}
                        <span className="font-mono font-bold text-green-700 dark:text-green-300">
                          {visualizationData.solution[0]}
                        </span>{" "}
                        je identifikovan kao tačno rešenje.
                      </>
                    ) : (
                      <>
                        Peptidi{" "}
                        <span className="font-mono font-bold text-green-700 dark:text-green-300">
                          {visualizationData.solution.join(", ")}
                        </span>{" "}
                        su identifikovani kao tačna rešenja.
                      </>
                    )}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {visualizationData.solution.length === 1 ? "Ovaj peptid ima" : "Ovi peptidi imaju"} masu od{" "}
                    {targetMass} Da i{" "}
                    {visualizationData.solution.length === 1
                      ? "njegov teorijski spektar je jednak"
                      : "njihovi teorijski spektri su jednaki"}{" "}
                    eksperimentalnom spektru.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              Unesi sekvencu i klikni analiziraj da bi video algoritam
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
