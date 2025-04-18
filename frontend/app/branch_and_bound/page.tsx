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
  end: boolean
  candidate: boolean
  children: string[]
  spectrum?: number[]
  reason?: string
  mass: number
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

interface VisualizationResult {
  tree: {
    [key: string]: TreeNode
  }
  candidates: TheoreticalSpectrum
  solution: string[]
}

const NODE_RADIUS = 35

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

    const response = await fetch("http://localhost:8000/sequencing/branch_and_bound/", {
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

const renderSpectrum = (spectrum: SpectrumItem[], isSolution: boolean) => {
  const maxMass = Math.max(...spectrum.map((item) => item.mass))

  return (
    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg mt-4 mb-12 px-4 pt-8 pb-10">
      {spectrum.map((item, index) => {
        const position = (index / (spectrum.length - 1)) * (100 - 8) + 4
        const height = Math.max(20, (item.mass / maxMass) * 60)

        return (
          <div
            key={index}
            className="absolute bottom-10"
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          >
            {/* Subpeptide label above the peak */}
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

            {/* Mass label below the peak */}
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

const findTargetNodes = (
  treeMap: { [key: string]: TreeNode },
  nodeName: string,
  targetMass: number,
  result: TreeNode[] = [],
): TreeNode[] => {
  const node = treeMap[nodeName]
  if (!node) return result

  if (node.mass === targetMass && node.end) {
    result.push(node)
  }

  for (const childName of node.children) {
    findTargetNodes(treeMap, childName, targetMass, result)
  }

  return result
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
  const [targetNodes, setTargetNodes] = useState<TreeNode[]>([])
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const [candidateNodes, setCandidateNodes] = useState<TreeNode[]>([])
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

  const STEP_DURATION = 1000

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
    const tooltip = getNodeTooltip(node)
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

      const targets = findTargetNodes(visualizationData.tree, "Root", targetMass)
      setTargetNodes(targets)

      // Find all candidate nodes
      const candidates = allNodes.map((vn) => vn.node).filter((node) => node.candidate)
      setCandidateNodes(candidates)

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
  }, [visualizationData, targetMass])

  useEffect(() => {
    if (visualizationData && isPlaying) {
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
  }, [visualizationData, isPlaying, currentStep, isAnimationComplete])

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

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      // Calculate the maximum allowed pan offset based on zoom level and tree boundaries
      const maxPanX = (Math.abs(treeBoundaries.maxX - treeBoundaries.minX) * (zoomLevel - 1)) / (2 * zoomLevel)
      const maxPanY = (Math.abs(treeBoundaries.maxY - treeBoundaries.minY) * (zoomLevel - 1)) / (2 * zoomLevel)

      // Calculate new offsets with boundary limits
      const newX = Math.max(Math.min(panOffset.x + dx, maxPanX), -maxPanX)
      const newY = Math.max(Math.min(panOffset.y + dy, maxPanY), -maxPanY)

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
      setTargetNodes([])
      setControlsEnabled(true)

      // Set visualization data after resetting state
      setTimeout(async () => {
        try {
          const { data, targetMass: fetchedTargetMass } = await fetchData(sequence)
          setVisualizationData(data)
          setTargetMass(fetchedTargetMass)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Branch and Bound Algoritam</h1>

      <div className="prose prose-lg max-w-none mb-4">
        <p className="text-muted-foreground mb-4">
          Branch and Bound algoritam je optimizovana verzija algoritma grube sile koja koristi strategiju "podeli pa
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

        <p className="text-muted-foreground mb-4">
          U vizuelizaciji ispod, možete videti kako algoritam gradi stablo pretrage i kako eliminiše grane koje ne mogu
          dovesti do rešenja. Zeleni čvorovi predstavljaju potencijalna rešenja, crveni čvorovi su eliminisani, a plavi
          čvor je trenutno aktivan u pretrazi.
        </p>
      </div>

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
                      const hasTooltip = visibleNode.node.end

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

                        const progress = isAnimationComplete ? 100 : isLastNode ? lineProgress : 100
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
