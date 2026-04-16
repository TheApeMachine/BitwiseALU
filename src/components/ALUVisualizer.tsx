import React from 'react';
import { ProgramLine } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface ALUVisualizerProps {
  activeLine: ProgramLine | null;
}

export function ALUVisualizer({ activeLine }: ALUVisualizerProps) {
  if (!activeLine) {
    return (
      <div className="h-64 flex items-center justify-center border border-border-main bg-bg-panel text-text-secondary text-sm uppercase tracking-wider">
        Select a program and press Play or Step to visualize the ALU.
      </div>
    );
  }

  return (
    <div className="relative h-64 bg-[rgba(0,0,0,0.3)] border border-border-main rounded p-5 overflow-hidden flex items-center justify-around font-mono">
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeLine.raw}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex items-center justify-around"
        >
          {/* Inputs */}
          <div className="flex flex-col space-y-6">
            <div className="text-center w-[140px]">
              <div className="text-[10px] opacity-50 uppercase text-text-primary">Source A</div>
              <div className="h-[50px] border border-accent bg-accent-dim flex items-center justify-center font-bold my-2 text-text-primary">
                {activeLine.srcA}
              </div>
              <div className="text-[10px] text-accent">0x7F...3E</div>
            </div>
            
            <div className="text-center w-[140px]">
              <div className="text-[10px] opacity-50 uppercase text-text-primary">Source B</div>
              <div className="h-[50px] border border-accent bg-accent-dim flex items-center justify-center font-bold my-2 text-text-primary">
                {activeLine.srcB}
              </div>
              <div className="text-[10px] text-accent">0x12...9A</div>
            </div>
          </div>

          <div className="text-2xl opacity-30 text-text-primary">+</div>

          {/* ALU Core */}
          <div className="w-[120px] h-[120px] border-2 border-accent flex flex-col items-center justify-center relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}>
            <span className="text-xl font-bold text-text-primary uppercase">{activeLine.op}</span>
            <span className="text-[10px] mt-1 text-code-orange uppercase">{activeLine.mode}</span>
            <span className="text-[10px] absolute bottom-2 opacity-50 uppercase text-text-primary">ALU CORE</span>
          </div>

          {/* Output */}
          <div className="text-center w-[140px]">
            <div className="text-[10px] opacity-50 uppercase text-text-primary">Destination</div>
            <div className="h-[50px] border border-code-orange bg-[rgba(208,135,112,0.05)] flex items-center justify-center font-bold my-2 text-text-primary">
              {activeLine.dst}
            </div>
            <div className="text-[10px] text-code-orange">0x6D...A4</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
