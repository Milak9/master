import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { motion } from "framer-motion";
import ReactFlow, { Background, Controls, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';

// Initial fake mass spectra for visualization
const exampleSpectrum = [
  { mass: 100, intensity: 70 },
  { mass: 200, intensity: 90 },
  { mass: 300, intensity: 50 },
  { mass: 400, intensity: 30 },
];

function MassSpectraChart() {
  const data = {
    labels: exampleSpectrum.map(point => point.mass),
    datasets: [
      {
        label: 'Mass Spectrum',
        data: exampleSpectrum.map(point => point.intensity),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      x: { title: { display: true, text: 'Mass (Daltons)' } },
      y: { title: { display: true, text: 'Intensity' } },
    },
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-xl">Mass Spectrometry Visualization</h3>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
}

function PeptideBuilder() {
  const [sequence, setSequence] = useState("");
  const [spectrum, setSpectrum] = useState([]);

  useEffect(() => {
    const computeSpectrum = () => {
      return sequence.split('').map((amino, index) => {
        const mass = (index + 1) * 110; // Approximate mass per amino acid
        return { mass, intensity: Math.random() * 100 };
      });
    };
    setSpectrum(computeSpectrum());
  }, [sequence]);

  return (
    <Card>
      <CardContent>
        <h3 className="text-xl">Peptide Builder</h3>
        <TextField
          fullWidth
          label="Peptide Sequence"
          variant="outlined"
          placeholder="Enter peptide sequence (e.g., ACTG)"
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
        />
        <motion.div
          className="mt-4 text-center"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          <h4 className="text-lg">Generated Spectrum:</h4>
          {spectrum.map(point => (
            <p key={point.mass}>Mass: {point.mass} Da | Intensity: {point.intensity.toFixed(2)}</p>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}

function BranchAndBoundVisualization() {
  const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [spectrumInput, setSpectrumInput] = useState("");

  const handleInputChange = (e) => {
    setSpectrumInput(e.target.value);
  };

  const startBranchAndBound = async () => {
    try {
      const response = await fetch('http://your-backend-url/api/branch-bound-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spectrum: spectrumInput.split(',').map(Number) }),
      });
      const treeData = await response.json();
      visualizeTree(treeData);
    } catch (error) {
      console.error('Error fetching tree data:', error);
    }
  };

  const visualizeTree = (node, parentNodeId = null, depth = 0) => {
    if (!node) return;

    const nodeId = `node-${node.mass}-${depth}`;
    setNodes(prevNodes => [
      ...prevNodes,
      {
        id: nodeId,
        position: { x: 150 * depth, y: 100 * Math.random() },
        data: { label: `${node.mass} Da (${node.type})` },
        style: {
          backgroundColor: node.status === 'stopped' ? '#f87171' : '#86efac',
        },
      },
    ]);

    if (parentNodeId) {
      setEdges(prevEdges => [
        ...prevEdges,
        { id: `edge-${parentNodeId}-${nodeId}`, source: parentNodeId, target: nodeId },
      ]);
    }

    if (node.children) {
      node.children.forEach(child => visualizeTree(child, nodeId, depth + 1));
    }
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-xl">Branch-and-Bound Tree Visualization</h3>
        <TextField
          fullWidth
          label="Spectrum Values"
          variant="outlined"
          placeholder="Enter spectrum values separated by commas (e.g., 100,200,300)"
          value={spectrumInput}
          onChange={handleInputChange}
        />
        <Button variant="contained" color="primary" className="mt-2" onClick={startBranchAndBound}>Start Visualization</Button>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
          <Background />
          <Controls />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}

export default function SequencingVisualizer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <MassSpectraChart />
      <PeptideBuilder />
      <BranchAndBoundVisualization />
    </div>
  );
}
s