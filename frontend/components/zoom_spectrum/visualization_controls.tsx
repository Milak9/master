"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ZoomIn, ZoomOut, MoveHorizontal, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ZoomableSpectrumProps {
  spectrum: { mass: number; subpeptide: string }[]
  experimentalSpectrum?: number[]
  peptide?: string
  qualified?: boolean
  isSolution?: boolean
  className?: string
  height?: number
}

export function ZoomableSpectrum({
  spectrum,
  experimentalSpectrum,
  peptide,
  qualified = true,
  isSolution = false,
  className,
  height = 200,
}: ZoomableSpectrumProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [initialPanOffset, setInitialPanOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Normalize spectrum data to a consistent format
  const normalizedSpectrum = spectrum.map((item) => {
    if (typeof item === "number") {
      return { mass: item, subpeptide: "" }
    }
    return item as { mass: number; subpeptide: string }
  })

  // Sort spectrum by mass
  const sortedSpectrum = [...normalizedSpectrum].sort((a, b) => a.mass - b.mass)

  // Get the maximum mass for scaling
  const maxMass = sortedSpectrum.length > 0 ? sortedSpectrum[sortedSpectrum.length - 1].mass : 0

  // Calculate visible range based on zoom and pan
  const visibleWidth = 100 / zoomLevel
  const maxPanOffset = Math.max(0, 100 - visibleWidth)
  const adjustedPanOffset = Math.min(maxPanOffset, Math.max(0, panOffset))

  // Convert experimental spectrum to a Set for faster lookups
  const experimentalSpectrumSet = experimentalSpectrum ? new Set(experimentalSpectrum) : new Set()

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
    setInitialPanOffset(adjustedPanOffset)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const dragDelta = e.clientX - dragStart
    const containerWidth = containerRef.current?.clientWidth || 1
    const panDelta = (dragDelta / containerWidth) * 100 * zoomLevel

    // Move in the opposite direction of drag (drag right = pan left)
    const newPanOffset = initialPanOffset - panDelta
    setPanOffset(Math.min(maxPanOffset, Math.max(0, newPanOffset)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse up handler to stop dragging even if mouse is released outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  // Reset zoom and pan
  const resetView = () => {
    setZoomLevel(1)
    setPanOffset(0)
  }

  // Zoom in/out functions
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, 10))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 1))
  }

  return (
    <div className={cn("p-6 rounded-lg bg-gray-50 dark:bg-gray-800/30", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomOut} title="Zoom Out" disabled={zoomLevel <= 1}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetView}
            title="Reset View"
            disabled={zoomLevel === 1 && panOffset === 0}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {zoomLevel > 1 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MoveHorizontal className="h-4 w-4" />
            <span>Držite mišem da biste prevukli levo ili desno</span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className={`relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ height: `${height}px`, overflow: "hidden" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute top-0 left-0 right-0 h-12 z-10"
          style={{
            width: `${zoomLevel * 100}%`,
            transform: `translateX(-${adjustedPanOffset}%)`,
          }}
        >
          {sortedSpectrum.map((item, index) => {
            const position = 5 + (item.mass / maxMass) * 90
            return (
              <div
                key={`label-${index}`}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                <div className="text-center text-xs whitespace-nowrap font-mono mb-4">
                  {item.mass === 0 ? "-" : item.subpeptide || ""}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bars and mass values */}
        <div
          className="absolute inset-0 pt-12 transition-transform duration-100 ease-out"
          style={{
            width: `${zoomLevel * 100}%`,
            transform: `translateX(-${adjustedPanOffset}%)`,
          }}
        >
          {sortedSpectrum.map((item, index) => {
            // Calculate position as percentage of total width with padding for edge items
            // Add 5% padding on each side to ensure first and last bars are fully visible
            const position = 5 + (item.mass / maxMass) * 90

            // Calculate height based on mass value (min 20px, max based on container height)
            const barHeight = Math.min(height * 0.5, 30 + (item.mass / maxMass) * (height * 0.3))

            // Check if this mass matches the experimental spectrum
            const matches = qualified && experimentalSpectrumSet.has(item.mass)

            // Calculate bar width based on zoom level (thinner bars when zoomed in)
            const barWidth = Math.max(2, Math.min(6, 20 / Math.sqrt((zoomLevel * sortedSpectrum.length) / 10)))

            return (
              <div
                key={index}
                className="absolute bottom-10 flex flex-col items-center"
                style={{
                  left: `${position}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className={`${matches || !experimentalSpectrum ? (isSolution ? "bg-green-500" : "bg-blue-500") : "bg-blue-300"}`}
                  style={{
                    height: `${barHeight}px`,
                    width: `${barWidth}px`,
                  }}
                ></div>
                <div className="text-center mt-2 font-mono text-xs whitespace-nowrap">{item.mass}</div>
              </div>
            )
          })}
        </div>
      </div>

      {zoomLevel > 1 && (
        <div className="mt-4">
          <Slider
            value={[adjustedPanOffset]}
            max={maxPanOffset}
            step={1}
            onValueChange={(value) => setPanOffset(value[0])}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}

