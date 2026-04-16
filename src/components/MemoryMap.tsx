import React from 'react';
import { MEMORY_MAP, parseRegionRef, ProgramLine } from '../data';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MemoryMapProps {
  activeLine: ProgramLine | null;
}

export function MemoryMap({ activeLine }: MemoryMapProps) {
  const words = Array.from({ length: 128 }, (_, i) => i);
  
  let activeSrcA = new Set<number>();
  let activeSrcB = new Set<number>();
  let activeDst = new Set<number>();
  
  if (activeLine) {
    const srcA = parseRegionRef(activeLine.srcA);
    const srcB = parseRegionRef(activeLine.srcB);
    const dst = parseRegionRef(activeLine.dst);
    
    if (srcA) {
      for (let i = srcA.absoluteStart; i <= srcA.absoluteEnd; i++) activeSrcA.add(i);
    }
    if (srcB) {
      for (let i = srcB.absoluteStart; i <= srcB.absoluteEnd; i++) activeSrcB.add(i);
    }
    if (dst) {
      for (let i = dst.absoluteStart; i <= dst.absoluteEnd; i++) activeDst.add(i);
    }
  }

  const getWordRegion = (index: number) => {
    return Object.values(MEMORY_MAP).find(r => index >= r.start && index < r.start + r.span);
  };

  return (
    <div className="flex flex-col font-mono">
      <div className="text-[11px] text-text-secondary uppercase mb-2.5 flex justify-between">
        <span>SUBSTRATE SIGNAL LAYER [64-BYTE SLICE]</span>
        <span>DENSITY: 42.8% (SHANNON THRESHOLD: 47%)</span>
      </div>
      
      <div className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-1">
        {words.map(i => {
          const region = getWordRegion(i);
          const isSrcA = activeSrcA.has(i);
          const isSrcB = activeSrcB.has(i);
          const isDst = activeDst.has(i);
          
          let highlightClass = 'bg-[#222]';
          if (isSrcA || isSrcB || isDst) {
            highlightClass = 'bg-accent shadow-[0_0_3px_var(--color-accent)]';
          } else if (activeLine) {
            highlightClass = 'bg-[#333]';
          }

          return (
            <div
              key={i}
              className="relative group aspect-square"
              title={`Word ${i} (${region?.name || 'unknown'})`}
            >
              <motion.div
                layout
                className={cn(
                  "w-full h-full rounded-[1px] transition-colors duration-300",
                  highlightClass
                )}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-max max-w-xs bg-bg-main border border-border-main text-text-primary text-xs p-2 pointer-events-none">
                <p className="font-bold uppercase text-accent">Word {i} : {region?.name}</p>
                <p className="text-text-secondary mt-1">{region?.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-[11px] uppercase mt-4 flex justify-between">
        <span className="text-accent">TOKENS [0-15]</span>
        <span className="text-code-orange">AFFINITY [0-5]</span>
        <span className="text-text-secondary">SIGNALS [0-8]</span>
        <span className="text-code-purple">PROPERTIES [0-4]</span>
      </div>
    </div>
  );
}
