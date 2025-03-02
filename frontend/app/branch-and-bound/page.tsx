"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PlayCircle, PauseCircle, RotateCcw, Download } from "lucide-react";
import GIF from "gif.js";
import { toPng } from "html-to-image";

interface TreeNode {
  node: string;
  end: boolean;
  children: TreeNode[];
}

interface VisibleNode {
  node: TreeNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
  isActive?: boolean;
}

const NODE_RADIUS = 20;

const getMockData = (): TreeNode => ({
  node: "Root",
  end: false,
  children: [
    {
      node: "A",
      end: true,
      children: []
    },
    {
      node: "B",
      end: false,
      children: [
        {
          node: "C",
          end: true,
          children: []
        },
        {
          node: "D",
          end: false,
          children: []
        }
      ]
    }
  ]
});

const calculateEdgePoint = (x1: number, y1: number, x2: number, y2: number, radius: number) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return {
    x: x1 + radius * Math.cos(angle),
    y: y1 + radius * Math.sin(angle)
  };
};

const flattenTree = (node: TreeNode, x: number, y: number, parentX?: number, parentY?: number, result: VisibleNode[] = []): VisibleNode[] => {
  result.push({ node, x, y, parentX, parentY });
  
  const levelHeight = 100;
  const siblingSpacing = 120;
  
  node.children.forEach((child, index) => {
    const childX = x + (index - (node.children.length - 1)/2) * siblingSpacing;
    const childY = y + levelHeight;
    flattenTree(child, childX, childY, x, y, result);
  });
  
  return result;
};

export default function BranchAndBoundPage() {
  const [sequence, setSequence] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizationData, setVisualizationData] = useState<TreeNode | null>(null);
  const [visibleNodes, setVisibleNodes] = useState<VisibleNode[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const STEP_DURATION = 1000; // 1 second per step

  useEffect(() => {
    if (visualizationData) {
      const totalNodes = flattenTree(visualizationData, 0, 0).length;
      setTotalDuration(totalNodes * STEP_DURATION);
    }
  }, [visualizationData]);

  useEffect(() => {
    if (visualizationData && isPlaying) {
      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const deltaTime = timestamp - lastTimeRef.current;
        
        if (deltaTime >= STEP_DURATION) {
          lastTimeRef.current = timestamp;
          if (currentStep < flattenTree(visualizationData, 0, 0).length - 1) {
            setCurrentStep(prev => prev + 1);
            setLineProgress(0);
          } else {
            setIsAnimationComplete(true);
            setIsPlaying(false);
            return;
          }
        } else {
          setLineProgress((deltaTime / STEP_DURATION) * 100);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };

      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [visualizationData, isPlaying, currentStep]);

  useEffect(() => {
    if (visualizationData) {
      const allNodes = flattenTree(visualizationData, 0, 0);
      const currentNodes = allNodes.slice(0, currentStep + 1);
      setVisibleNodes(currentNodes.map((node, index) => ({
        ...node,
        isActive: index === currentStep
      })));
      setCurrentTime(currentStep * STEP_DURATION + (STEP_DURATION * lineProgress / 100));
    }
  }, [visualizationData, currentStep, lineProgress]);

  const handleTimelineChange = (value: number[]) => {
    if (!visualizationData) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    
    const newTime = value[0];
    const newStep = Math.floor(newTime / STEP_DURATION);
    const newProgress = ((newTime % STEP_DURATION) / STEP_DURATION) * 100;
    
    setCurrentTime(newTime);
    setCurrentStep(Math.min(newStep, flattenTree(visualizationData, 0, 0).length - 1));
    setLineProgress(newProgress);
    lastTimeRef.current = 0;
  };

  const downloadAnimation = async () => {
    if (!visualizationData || isDownloading) return;
    
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
      const allNodes = flattenTree(visualizationData, 0, 0);
      const totalFrames = allNodes.length * 10; // 10 frames per step
      
      // Create a temporary component for GIF frames
      const tempVisibleNodes: VisibleNode[] = [];
      
      for (let frame = 0; frame < totalFrames; frame++) {
        const step = Math.floor(frame / 10);
        const progress = (frame % 10) * 10;
        
        // Update temporary nodes for GIF frame
        if (step < allNodes.length) {
          if (frame % 10 === 0) {
            tempVisibleNodes.push({
              ...allNodes[step],
              isActive: true
            });
          }
          
          // Render frame to temporary container
          gifContainer.innerHTML = `
            <svg width="800" height="600">
              <g transform="translate(400,40)">
                ${tempVisibleNodes.map((node, index) => {
                  let elements = '';
                  
                  if (node.parentX !== undefined && node.parentY !== undefined) {
                    const startPoint = calculateEdgePoint(
                      node.parentX,
                      node.parentY,
                      node.x,
                      node.y,
                      NODE_RADIUS
                    );
                    
                    const endPoint = calculateEdgePoint(
                      node.x,
                      node.y,
                      node.parentX,
                      node.parentY,
                      NODE_RADIUS
                    );

                    const lineProgress = index === tempVisibleNodes.length - 1 ? progress : 100;
                    const currentEndPoint = {
                      x: startPoint.x + (endPoint.x - startPoint.x) * (lineProgress / 100),
                      y: startPoint.y + (endPoint.y - startPoint.y) * (lineProgress / 100)
                    };

                    elements += `
                      <line
                        x1="${startPoint.x}"
                        y1="${startPoint.y}"
                        x2="${currentEndPoint.x}"
                        y2="${currentEndPoint.y}"
                        stroke="gray"
                        stroke-width="2"
                      />
                    `;
                  }

                  elements += `
                    <circle
                      cx="${node.x}"
                      cy="${node.y}"
                      r="${NODE_RADIUS}"
                      fill="${node.isActive ? (node.node.end ? "rgb(239 68 68)" : "rgb(59 130 246)") : "rgb(209 213 219)"}"
                    />
                    <text
                      x="${node.x}"
                      y="${node.y}"
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="white"
                      font-size="14"
                    >
                      ${node.node.node}
                    </text>
                  `;

                  return elements;
                }).join('')}
              </g>
            </svg>
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
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tree-animation.gif';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setCurrentStep(0);
      setVisibleNodes([]);
      setLineProgress(0);
      setCurrentTime(0);
      lastTimeRef.current = 0;
      setVisualizationData(getMockData());
      setIsPlaying(true);
      setIsAnimationComplete(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(0);
    setVisibleNodes([]);
    setLineProgress(0);
    setCurrentTime(0);
    lastTimeRef.current = 0;
    setIsAnimationComplete(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Branch & Bound Algoritam</h1>
      
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
              disabled={isDownloading}
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
              disabled={isDownloading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {isAnimationComplete && (
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

        {visualizationData && (
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={totalDuration}
              step={1}
              onValueChange={handleTimelineChange}
              className="w-full"
              disabled={isDownloading}
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
          {visualizationData ? (
            <svg ref={svgRef} width="100%" height="600" className="mx-auto">
              <g transform="translate(400,40)">
                {visibleNodes.map((visibleNode, index) => {
                  const isLastNode = index === visibleNodes.length - 1;
                  
                  if (visibleNode.parentX !== undefined && visibleNode.parentY !== undefined) {
                    const startPoint = calculateEdgePoint(
                      visibleNode.parentX,
                      visibleNode.parentY,
                      visibleNode.x,
                      visibleNode.y,
                      NODE_RADIUS
                    );
                    
                    const endPoint = calculateEdgePoint(
                      visibleNode.x,
                      visibleNode.y,
                      visibleNode.parentX,
                      visibleNode.parentY,
                      NODE_RADIUS
                    );

                    const progress = isLastNode ? lineProgress : 100;
                    const currentEndPoint = {
                      x: startPoint.x + (endPoint.x - startPoint.x) * (progress / 100),
                      y: startPoint.y + (endPoint.y - startPoint.y) * (progress / 100)
                    };

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
                          fill={visibleNode.isActive ? (visibleNode.node.end ? "rgb(239 68 68)" : "rgb(59 130 246)") : "rgb(209 213 219)"}
                          className="transition-colors duration-300"
                        />
                        <text
                          x={visibleNode.x}
                          y={visibleNode.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="14"
                        >
                          {visibleNode.node.node}
                        </text>
                      </g>
                    );
                  }

                  return (
                    <g key={`${visibleNode.node.node}-${index}`}>
                      <circle
                        cx={visibleNode.x}
                        cy={visibleNode.y}
                        r={NODE_RADIUS}
                        fill={visibleNode.isActive ? (visibleNode.node.end ? "rgb(239 68 68)" : "rgb(59 130 246)") : "rgb(209 213 219)"}
                        className="transition-colors duration-300"
                      />
                      <text
                        x={visibleNode.x}
                        y={visibleNode.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="14"
                      >
                        {visibleNode.node.node}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
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