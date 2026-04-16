import React, { useState, useEffect } from 'react';
import { PROGRAMS } from './data';
import { MemoryMap } from './components/MemoryMap';
import { ALUVisualizer } from './components/ALUVisualizer';
import { ProgramViewer } from './components/ProgramViewer';
import { Info } from 'lucide-react';

export default function App() {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(PROGRAMS[4].id); // Default to beam_swarm_step
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedProgram = PROGRAMS.find(p => p.id === selectedProgramId) || PROGRAMS[0];
  const activeLine = activeStepIndex >= 0 && activeStepIndex < selectedProgram.lines.length 
    ? selectedProgram.lines[activeStepIndex] 
    : null;

  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setTimeout(() => {
        setActiveStepIndex(prev => {
          if (prev >= selectedProgram.lines.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per step for visualization
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, selectedProgram.lines.length]);

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProgramId(e.target.value);
    setActiveStepIndex(-1);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (!isPlaying && activeStepIndex >= selectedProgram.lines.length - 1) {
      setActiveStepIndex(0);
    } else if (!isPlaying && activeStepIndex === -1) {
      setActiveStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStep = () => {
    if (activeStepIndex >= selectedProgram.lines.length - 1) {
      setActiveStepIndex(0);
    } else {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setActiveStepIndex(-1);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-primary font-mono selection:bg-accent-dim">
      <header className="bg-bg-panel border-b border-border-main sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--color-accent)]"></span>
            <h1 className="text-sm font-bold tracking-[2px] text-text-primary uppercase">V-ALU Architecture v1.0.4</h1>
          </div>
          <div className="flex items-center space-x-4 text-xs text-text-secondary">
            <span className="hidden sm:inline">CYCLE_COUNT: 4,289 | SUBSTRATE_SWEEP: 16-ROT | CORE: ACTIVE</span>
            <label htmlFor="program-select" className="sr-only">Select Program:</label>
            <select
              id="program-select"
              value={selectedProgramId}
              onChange={handleProgramChange}
              className="block w-48 sm:w-64 rounded bg-bg-main border border-border-main py-1.5 pl-3 pr-8 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-text-primary"
            >
              {PROGRAMS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          
          {/* Left Column: Program Viewer & Info */}
          <div className="flex flex-col space-y-6">
            <div className="h-[400px]">
              <ProgramViewer 
                program={selectedProgram}
                activeStepIndex={activeStepIndex}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onStep={handleStep}
                onReset={handleReset}
              />
            </div>
            
            <div className="bg-bg-panel border border-border-main p-5 text-sm text-text-secondary">
              <h3 className="font-bold flex items-center mb-2 text-text-primary">
                <Info className="w-4 h-4 mr-2 text-accent" /> How it works
              </h3>
              <p className="mb-3">
                A <strong className="text-accent font-normal">Value</strong> is a 1KB (128 words) atom of computation. It serves as data, program, and identity simultaneously.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text-primary font-normal">ALU Sweep:</strong> The ALU performs a linear bitwise sweep across regions.</li>
                <li><strong className="text-text-primary font-normal">Accumulate:</strong> XORs/ORs/ANDs the results into the destination slice. Multi-line programs build up state.</li>
                <li><strong className="text-text-primary font-normal">Reduce:</strong> Popcounts the whole region and writes the scalar total to the destination.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: ALU & Memory Map */}
          <div className="flex flex-col space-y-6">
            <section>
              <ALUVisualizer activeLine={activeLine} />
            </section>
            
            <section className="bg-bg-panel p-6 border border-border-main">
              <MemoryMap activeLine={activeLine} />
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
