"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PlayCircle, PauseCircle, RotateCcw, Download } from "lucide-react";
import GIF from "gif.js";
import { toPng } from "html-to-image";

interface MatrixCell {
  value: number | null;
  isActive: boolean;
  progress: number;
}

interface MatrixState {
  matrix: MatrixCell[][];
  currentStep: number;
  sequence: number[];
  isComplete: boolean;
  apiMatrix: number[][];
}

interface ApiResponse {
  matrix: number[][];
  sequence: number[];
}

const fetchMatrixData = async (sequence: number[]): Promise<ApiResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const size = sequence.length;
  const matrix: number[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  for (let i = 1; i < size; i++) {
    for (let j = 0; j < i; j++) {
      matrix[i][j] = Math.abs(sequence[i] - sequence[j]);
    }
  }
  
  return {
    matrix,
    sequence
  };
};

export default function ConvolutionPage() {
  const [sequence, setSequence] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [matrixState, setMatrixState] = useState<MatrixState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const STEP_DURATION = 1000;

  const initializeMatrix = (apiResponse: ApiResponse): MatrixState => {
    const size = apiResponse.sequence.length;
    const matrix: MatrixCell[][] = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        value: null,
        isActive: false,
        progress: 0
      }))
    );

    return {
      matrix,
      currentStep: 0,
      sequence: apiResponse.sequence,
      isComplete: false,
      apiMatrix: apiResponse.matrix
    };
  };

  const updateMatrixState = (state: MatrixState, step: number, progress: number): MatrixState => {
    const { sequence, apiMatrix } = state;
    const size = sequence.length;
    const newMatrix = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        value: null,
        isActive: false,
        progress: 0
      }))
    );

    let cellCount = 0;
    for (let i = 1; i < size; i++) {
      for (let j = 0; j < i; j++) {
        if (cellCount <= step) {
          newMatrix[i][j] = {
            value: apiMatrix[i][j],
            isActive: true,
            progress: cellCount === step ? progress : 100
          };
        }
        cellCount++;
      }
    }

    const totalSteps = ((size * (size - 1)) / 2) - 1;
    const isComplete = step >= totalSteps && progress >= 100;

    // Set animation complete when we reach the end
    if (isComplete && !state.isComplete) {
      setIsAnimationComplete(true);
      setIsPlaying(false);
    }

    return {
      ...state,
      matrix: newMatrix,
      currentStep: step,
      isComplete
    };
  };

  const downloadAnimation = async () => {
    if (!matrixState || isDownloading) return;
    
    setIsDownloading(true);

    // Create a separate container for GIF generation
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
      const size = matrixState.sequence.length;
      const totalCells = (size * (size - 1)) / 2;
      const totalFrames = totalCells * 10; // 10 frames per cell
      
      for (let frame = 0; frame < totalFrames; frame++) {
        const step = Math.floor(frame / 10);
        const progress = (frame % 10) * 10;
        
        const frameState = updateMatrixState(matrixState, step, progress);
        
        // Render frame to temporary container
        gifContainer.innerHTML = `
          <div class="p-6 bg-white">
            <table class="border-collapse">
              <thead>
                <tr>
                  <th class="border p-4"></th>
                  ${frameState.sequence.map((num, i) => `
                    <th class="border p-4">${num}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${frameState.matrix.map((row, rowIndex) => `
                  <tr>
                    <th class="border p-4">${frameState.sequence[rowIndex]}</th>
                    ${row.map((cell, colIndex) => `
                      <td
                        class="border p-4 text-center"
                        style="
                          background: ${cell.isActive ? `rgba(59, 130, 246, ${cell.progress / 100})` : 'white'};
                          color: ${cell.isActive ? 'white' : 'black'};
                          opacity: ${cell.value !== null ? 1 : 0};
                        "
                      >
                        ${cell.value !== null && rowIndex > colIndex ? cell.value : ''}
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        // Capture frame
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
        a.download = 'convolution-animation.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Clean up
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

  useEffect(() => {
    if (matrixState && isPlaying && !matrixState.isComplete) {
      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) {
          lastTimeRef.current = timestamp;
        }
        const deltaTime = timestamp - lastTimeRef.current;
        
        setCurrentTime(prev => {
          const newTime = Math.min(prev + deltaTime, totalDuration);
          const currentStep = Math.floor(newTime / STEP_DURATION);
          const progress = ((newTime % STEP_DURATION) / STEP_DURATION) * 100;
          
          setMatrixState(prevState => {
            if (!prevState) return null;
            return updateMatrixState(prevState, currentStep, progress);
          });
          
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            setIsAnimationComplete(true);
            return totalDuration;
          }
          
          return newTime;
        });
        
        lastTimeRef.current = timestamp;
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [matrixState, isPlaying, totalDuration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = sequence.split(',').map(num => parseInt(num.trim()));
    if (numbers.some(isNaN)) {
      alert('Please enter valid numbers separated by commas');
      return;
    }

    try {
      setIsLoading(true);
      setIsAnimationComplete(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const apiResponse = await fetchMatrixData(numbers);
      const totalSteps = (numbers.length * (numbers.length - 1)) / 2;
      const newTotalDuration = totalSteps * STEP_DURATION;
      
      setTotalDuration(newTotalDuration);
      setCurrentTime(0);
      lastTimeRef.current = 0;
      
      const initialState = initializeMatrix(apiResponse);
      setMatrixState(initialState);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error fetching matrix data:', error);
      alert('Failed to analyze sequence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    lastTimeRef.current = 0;
    setIsAnimationComplete(false);
    if (matrixState) {
      const resetState = initializeMatrix({ 
        matrix: matrixState.apiMatrix, 
        sequence: matrixState.sequence 
      });
      setMatrixState(resetState);
    }
  };

  const handleTimelineChange = (value: number[]) => {
    if (!matrixState) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    
    const newTime = value[0];
    const currentStep = Math.floor(newTime / STEP_DURATION);
    const progress = ((newTime % STEP_DURATION) / STEP_DURATION) * 100;
    
    setCurrentTime(newTime);
    lastTimeRef.current = 0;
    
    setMatrixState(prevState => {
      if (!prevState) return null;
      return updateMatrixState(prevState, currentStep, progress);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Spektralna konvolucija</h1>
      
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Unesi sekvencu
            </label>
            <Input
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="e.g., 1,2,3,4"
              className="max-w-md"
              disabled={isLoading}
            />
          </div>
          <div className="space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Analiziranje...' : 'Analiziraj sekvencu'}
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
              disabled={!matrixState || isLoading}
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
              onClick={handleReset}
              disabled={!matrixState || isLoading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {isAnimationComplete && matrixState && (
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

        {matrixState && (
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={totalDuration}
              step={1}
              onValueChange={handleTimelineChange}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0:00</span>
              <span>
                {Math.floor(totalDuration / 1000)}:
                {String(Math.floor((totalDuration % 1000) / 10)).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        <div ref={containerRef} className="bg-card rounded-lg p-6 min-h-[400px] overflow-auto">
          {matrixState ? (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-4"></th>
                    {matrixState.sequence.map((num, i) => (
                      <th key={i} className="border p-4">{num}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixState.matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <th className="border p-4">{matrixState.sequence[rowIndex]}</th>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="border p-4 text-center relative"
                          style={{
                            background: cell.isActive 
                              ? `rgba(59, 130, 246, ${cell.progress / 100})`
                              : undefined,
                            color: cell.isActive ? 'white' : undefined,
                            opacity: cell.value !== null ? 1 : 0,
                            transition: 'background 0.3s ease-in-out, opacity 0.3s ease-in-out'
                          }}
                        >
                          {cell.value !== null && rowIndex > colIndex ? cell.value : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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