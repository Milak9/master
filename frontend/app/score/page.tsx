"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlayCircle, PauseCircle, RotateCcw, Download } from "lucide-react";
import GIF from "gif.js";
import { toPng } from "html-to-image";

export default function ScorePage() {
  const [sequence, setSequence] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizationData, setVisualizationData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sequence }),
      });
      const data = await response.json();
      setVisualizationData(data);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadAnimation = async () => {
    if (!visualizationData || isDownloading || !containerRef.current) return;
    
    setIsDownloading(true);

    const gifContainer = document.createElement('div');
    gifContainer.style.width = '800px';
    gifContainer.style.height = '600px';
    gifContainer.style.position = 'absolute';
    gifContainer.style.left = '-9999px';
    document.body.appendChild(gifContainer);

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 800,
      height: 600,
      background: '#ffffff'
    });

    try {
      // Capture 30 frames for the animation
      for (let frame = 0; frame < 30; frame++) {
        // Update visualization state for each frame
        // This is a placeholder - implement actual frame rendering logic
        gifContainer.innerHTML = `
          <div class="p-6 bg-white">
            <p>Frame ${frame + 1}</p>
            <!-- Add visualization content here -->
          </div>
        `;

        await new Promise(resolve => setTimeout(resolve, 50));
        const frameData = await toPng(gifContainer);
        
        const img = new Image();
        img.src = frameData;
        await new Promise(resolve => {
          img.onload = () => {
            gif.addFrame(img, { delay: 100 });
            resolve(null);
          };
        });
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'score-algorithm-animation.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        document.body.removeChild(gifContainer);
        setIsDownloading(false);
      });

      gif.render();
    } catch (error) {
      console.error('Error generating GIF:', error);
      document.body.removeChild(gifContainer);
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Score Algoritam</h1>
      
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Unesi sekvencu
            </label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="Unesi svoju sekvencu..."
              className="max-w-md"
            />
          </div>
          <div className="space-x-2">
            <Button type="submit">
              Analiziraj sekvencu
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsPlaying(false);
                // Reset visualization logic here
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {visualizationData && (
            <Button
              variant="outline"
              onClick={downloadAnimation}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Generating GIF...' : 'Download Animation'}
            </Button>
          )}
        </div>

        <div ref={containerRef} className="bg-card rounded-lg p-6 min-h-[400px]">
          {visualizationData ? (
            <div>
              {/* Add your visualization components here */}
              <p>Visualization placeholder</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Unesi sekvencu i klikni analiziraj da bi video algoritam
            </div>
          )}
        </div>
      </div>
    </div>
  );
}