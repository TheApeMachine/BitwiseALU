import React from 'react';
import { Program } from '../data';
import { cn } from '../lib/utils';
import { Play, Square, StepForward } from 'lucide-react';

interface ProgramViewerProps {
  program: Program;
  activeStepIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function ProgramViewer({ program, activeStepIndex, isPlaying, onPlayPause, onStep, onReset }: ProgramViewerProps) {
  return (
    <div className="flex flex-col h-full bg-bg-panel border border-border-main overflow-hidden">
      <div className="bg-bg-panel border-b border-border-main p-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase">{program.name}</h2>
          <p className="text-[10px] text-text-secondary mt-1 uppercase">{program.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPlayPause}
            className={cn(
              "p-1.5 rounded transition-colors flex items-center justify-center border",
              isPlaying ? "bg-accent-dim text-accent border-accent" : "bg-bg-main text-text-secondary border-border-main hover:text-text-primary"
            )}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={onStep}
            disabled={isPlaying}
            className="p-1.5 bg-bg-main text-text-secondary border border-border-main rounded hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Step Forward"
          >
            <StepForward className="w-3 h-3" />
          </button>
          <button
            onClick={onReset}
            className="px-2 py-1 text-[10px] font-bold text-text-secondary bg-bg-main border border-border-main rounded hover:text-text-primary transition-colors uppercase"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto bg-black font-mono text-sm leading-[1.6]">
        <div className="text-text-secondary text-[11px] mb-2">// EXECUTING {program.id.toUpperCase()}</div>
        {program.lines.map((line, index) => {
          const isActive = index === activeStepIndex;
          return (
            <div 
              key={index}
              className={cn(
                "py-1 px-2 transition-colors duration-200 flex items-center",
                isActive ? "bg-[rgba(255,255,255,0.1)] border-l-2 border-accent" : "border-l-2 border-transparent"
              )}
            >
              <span className="flex-1 whitespace-pre">
                <span className="text-code-green">{line.srcA}</span>{' '}
                <span className="text-code-green">{line.srcB}</span>{' '}
                <span className="text-code-green">{line.dst}</span>{' '}
                <span className="text-code-orange">{line.op}</span>{' '}
                <span className="text-code-purple">{line.mode}</span>
              </span>
            </div>
          );
        })}
        {program.next && (
          <div className="py-1 px-2 border-l-2 border-transparent flex items-center mt-2">
            <span className="italic text-text-secondary">
              <span className="text-code-purple">next</span> <span className="text-code-green">{program.next}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
