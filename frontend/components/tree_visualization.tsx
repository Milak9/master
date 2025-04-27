"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Move, CheckCircle, XCircle } from "lucide-react"

interface TreeVisualizationRendererProps {
  visualizationData: any
  visibleNodes: any[]
  currentStep: number
  lineProgress: number
  isAnimationComplete: boolean
  targetMass: number
  svgDimensions: {
    width: string
    height: number
    viewBox: string
  }
  zoomLevel: number
  panOffset: { x: number; y: number }
  isDragging: boolean
  activeTooltip: string | null
  tooltipPosition: { x: number; y: number }
  getNodeColor: (node: any, isActive: boolean, targetMass: number) => string
  handleNodeMouseEnter: (node: any, event: React.MouseEvent) => void
  handleNodeMouseLeave: () => void
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleResetZoom: () => void
  handleMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  handleMouseUp: () => void
}

export const TreeVisualizationRenderer: React.FC<TreeVisualizationRendererProps> = ({
  visualizationData,
  visibleNodes,
  currentStep,
  lineProgress,
  isAnimationComplete,
  targetMass,
  svgDimensions,
  zoomLevel,
  panOffset,
  isDragging,
  activeTooltip,
  tooltipPosition,
  getNodeColor,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="bg-card rounded-lg p-6 min-h-[300px] overflow-auto relative">
      {/* Tooltip */}
      {activeTooltip && (
        <div
          className="fixed z-20 bg-black/80 text-white p-2 rounded-md text-sm max-w-xs pointer-events-none"
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
                  const hasTooltip =
                    (visibleNode.node.end !== undefined && visibleNode.node.end) ||
                    (visibleNode.node.mass !== undefined &&
                      (visibleNode.node.mass === targetMass || visibleNode.node.mass > targetMass))

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

          {isAnimationComplete && visualizationData.solution && visualizationData.solution.length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-semibold mb-4">Kandidati sa masom {targetMass} Da:</h3>

              <div className="space-y-6">
                {Object.entries(visualizationData.candidates).map(([peptide, spectrum]: [string, any], index) => {
                  const isSolution = Array.isArray(visualizationData.solution)
                    ? visualizationData.solution.includes(peptide)
                    : visualizationData.solution === peptide

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
                              <span className="text-sm font-normal text-green-600 dark:text-green-400">(Rešenje)</span>
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
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                    {Array.isArray(visualizationData.solution)
                      ? visualizationData.solution.length === 1
                        ? "Pronađeno rešenje"
                        : "Pronađena rešenja"
                      : "Pronađeno rešenje"}
                  </h3>
                </div>

                <p className="text-lg mb-2">
                  {Array.isArray(visualizationData.solution) ? (
                    visualizationData.solution.length === 1 ? (
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
                    )
                  ) : (
                    <>
                      Peptid{" "}
                      <span className="font-mono font-bold text-green-700 dark:text-green-300">
                        {visualizationData.solution}
                      </span>{" "}
                      je identifikovan kao tačno rešenje.
                    </>
                  )}
                </p>

                <p className="text-sm text-muted-foreground">
                  {Array.isArray(visualizationData.solution)
                    ? visualizationData.solution.length === 1
                      ? "Ovaj peptid ima"
                      : "Ovi peptidi imaju"
                    : "Ovaj peptid ima"}{" "}
                  masu od {targetMass} Da i{" "}
                  {Array.isArray(visualizationData.solution)
                    ? visualizationData.solution.length === 1
                      ? "njegov teorijski spektar je jednak"
                      : "njihovi teorijski spektri su jednaki"
                    : "njegov teorijski spektar je jednak"}{" "}
                  eksperimentalnom spektru.
                </p>
              </div>
            </div>
          )}

          {isAnimationComplete &&
            (!visualizationData.solution ||
              (Array.isArray(visualizationData.solution) && visualizationData.solution.length === 0)) && (
              <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">
                    Nisu pronađeni peptidi čiji teorijski spektri odgovaraju traženom.
                  </h3>
                </div>
              </div>
            )}
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          Unesi sekvencu i klikni analiziraj da bi video algoritam
        </div>
      )}
    </div>
  )
}

export interface TreeNodeBase {
  node: string
  mass: number
  end: boolean
  children: string[]
}

export interface VisibleNode {
  node: any
  x: number
  y: number
  parentX?: number
  parentY?: number
  isActive?: boolean
}

export interface SpectrumItem {
  mass: number
  subpeptide: string
}

export interface TheoreticalSpectrum {
  [peptide: string]: SpectrumItem[]
}

export const NODE_RADIUS = 35

export const calculateEdgePoint = (x1: number, y1: number, x2: number, y2: number, radius: number) => {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return {
    x: x1 + radius * Math.cos(angle),
    y: y1 + radius * Math.sin(angle),
  }
}

export const flattenTree = (
  treeMap: { [key: string]: any },
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
  node.children.forEach((childName: string, index: number) => {
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

export const getTreeDimensions = (
  treeMap: { [key: string]: any },
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

export const calculateSvgDimensions = (treeMap: { [key: string]: any }) => {
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

export const renderSpectrum = (spectrum: SpectrumItem[], isSolution: boolean) => {
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
