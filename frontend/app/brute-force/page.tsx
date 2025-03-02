"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlayCircle, PauseCircle, RotateCcw } from "lucide-react";

export default function BruteForcePage() {
  const [sequence, setSequence] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizationData, setVisualizationData] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/brute-force", {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Algoritam grube sile</h1>
      
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

        <div className="bg-card rounded-lg p-6 min-h-[400px]">
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