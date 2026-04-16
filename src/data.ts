export type RegionName = 'tokens' | 'program' | 'signals' | 'context' | 'gradient' | 'properties' | 'assets' | 'prev' | 'next' | 'id' | 'affinity';

export interface Region {
  name: RegionName;
  start: number;
  span: number;
  color: string;
  description: string;
}

export const MEMORY_MAP: Record<RegionName, Region> = {
  tokens: { name: 'tokens', start: 0, span: 16, color: 'bg-blue-500', description: 'Raw input data packed into 16-bit Morton slots.' },
  program: { name: 'program', start: 16, span: 8, color: 'bg-purple-500', description: 'Packed bits the compute kernels interpret.' },
  signals: { name: 'signals', start: 24, span: 8, color: 'bg-yellow-500', description: '64-byte execution lane for ALU output.' },
  context: { name: 'context', start: 32, span: 8, color: 'bg-green-500', description: '64-byte execution lane (local eigenmode/attractor).' },
  gradient: { name: 'gradient', start: 40, span: 8, color: 'bg-red-500', description: '64-byte execution lane for local gradient.' },
  properties: { name: 'properties', start: 48, span: 8, color: 'bg-indigo-500', description: 'Canonical property band (labels, TTL, noise, etc).' },
  assets: { name: 'assets', start: 56, span: 64, color: 'bg-gray-400', description: 'Staging scratchpad for peer data.' },
  prev: { name: 'prev', start: 120, span: 1, color: 'bg-teal-500', description: 'Linked-list pointer to previous segment.' },
  next: { name: 'next', start: 121, span: 1, color: 'bg-teal-600', description: 'Linked-list pointer to next segment.' },
  id: { name: 'id', start: 122, span: 1, color: 'bg-pink-500', description: '64-bit unique identifier.' },
  affinity: { name: 'affinity', start: 123, span: 5, color: 'bg-orange-500', description: '257-bit locality-sensitive hash fingerprint.' },
};

export interface ProgramLine {
  srcA: string;
  srcB: string;
  dst: string;
  op: string;
  mode: string;
  raw: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  lines: ProgramLine[];
  next?: string;
}

export const PROGRAMS: Program[] = [
  {
    id: 'link',
    name: 'Link Generation',
    description: 'Copies staged previous and next Value IDs into the prev and next regions.',
    lines: [
      { srcA: 'asset[0,1]', srcB: 'asset[0,1]', dst: 'prev[0,1]', op: 'or', mode: 'accumulate', raw: 'asset[0,1] asset[0,1] prev[0,1] or accumulate' },
      { srcA: 'asset[1,1]', srcB: 'asset[1,1]', dst: 'next[0,1]', op: 'or', mode: 'accumulate', raw: 'asset[1,1] asset[1,1] next[0,1] or accumulate' }
    ],
    next: 'self'
  },
  {
    id: 'affinity',
    name: 'Affinity Generation',
    description: 'Folds token words against each other through a 16-rotation sweep, accumulating the LSH signature.',
    lines: [
      { srcA: 'tokens[0,16]', srcB: 'tokens[0,16]', dst: 'affinity[0,5]', op: 'xor', mode: 'accumulate', raw: 'tokens[0,16] tokens[0,16] affinity[0,5] xor accumulate' }
    ]
  },
  {
    id: 'popcount',
    name: 'Saturation Witness (Popcount)',
    description: 'Popcount of the whole Affinity region into its Fermat tail word to check Shannon limit saturation.',
    lines: [
      { srcA: 'affinity[0,5]', srcB: 'affinity[0,5]', dst: 'affinity[4,1]', op: 'xor', mode: 'reduce', raw: 'affinity[0,5] affinity[0,5] affinity[4,1] xor reduce' }
    ]
  },
  {
    id: 'coupling',
    name: 'Jaccard Coupling',
    description: 'AND then OR over tokens and affinity; reduces to popcount scalars for routing distance.',
    lines: [
      { srcA: 'tokens[0,16]', srcB: 'affinity[0,5]', dst: 'signals[0,1]', op: 'and', mode: 'reduce', raw: 'tokens[0,16] affinity[0,5] signals[0,1] and reduce' },
      { srcA: 'tokens[0,16]', srcB: 'affinity[0,5]', dst: 'signals[1,1]', op: 'or', mode: 'reduce', raw: 'tokens[0,16] affinity[0,5] signals[1,1] or  reduce' }
    ]
  },
  {
    id: 'beam_swarm_step',
    name: 'Beam Swarm Step',
    description: 'Emergent exploration run by every Value. Advances state, scores interference, morphs affinity.',
    lines: [
      { srcA: 'tokens[0,8]', srcB: 'gradient[0,8]', dst: 'context[0,8]', op: 'xor', mode: 'accumulate', raw: 'tokens[0,8]     gradient[0,8]   context[0,8]    xor accumulate' },
      { srcA: 'tokens[0,8]', srcB: 'context[0,8]', dst: 'signals[0,8]', op: 'xor', mode: 'accumulate', raw: 'tokens[0,8]     context[0,8]    signals[0,8]    xor accumulate' },
      { srcA: 'signals[0,8]', srcB: 'signals[0,8]', dst: 'properties[0,1]', op: 'xor', mode: 'reduce', raw: 'signals[0,8]    signals[0,8]    properties[0,1] xor reduce' },
      { srcA: 'properties[0,1]', srcB: 'properties[1,1]', dst: 'properties[0,1]', op: 'or', mode: 'accumulate', raw: 'properties[0,1] properties[1,1] properties[0,1] or  accumulate' },
      { srcA: 'properties[0,1]', srcB: 'affinity[0,5]', dst: 'affinity[0,5]', op: 'xor', mode: 'accumulate', raw: 'properties[0,1] affinity[0,5]   affinity[0,5]   xor accumulate' }
    ],
    next: 'self'
  },
  {
    id: 'surprisal',
    name: 'Surprisal (Free Energy)',
    description: 'Computes the gap between incoming tokens and the context (local eigenmode/attractor).',
    lines: [
      { srcA: 'tokens[0,8]', srcB: 'context[0,8]', dst: 'signals[0,8]', op: 'xor', mode: 'accumulate', raw: 'tokens[0,8]  context[0,8] signals[0,8]    xor accumulate' },
      { srcA: 'signals[0,8]', srcB: 'signals[0,8]', dst: 'properties[0,1]', op: 'xor', mode: 'reduce', raw: 'signals[0,8] signals[0,8] properties[0,1] xor reduce' }
    ]
  },
  {
    id: 'falsification',
    name: 'Popperian Test',
    description: 'XORs tokens against a predicted-absent pattern. High popcount refutes the claim.',
    lines: [
      { srcA: 'tokens[0,8]', srcB: 'context[0,8]', dst: 'signals[0,8]', op: 'xor', mode: 'accumulate', raw: 'tokens[0,8]     context[0,8]    signals[0,8]    xor accumulate' },
      { srcA: 'signals[0,8]', srcB: 'signals[0,8]', dst: 'properties[1,1]', op: 'xor', mode: 'reduce', raw: 'signals[0,8]    signals[0,8]    properties[1,1] xor reduce' },
      { srcA: 'properties[1,1]', srcB: 'properties[3,1]', dst: 'properties[3,1]', op: 'and', mode: 'accumulate', raw: 'properties[1,1] properties[3,1] properties[3,1] and accumulate' }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    description: 'Physical noise injected into the Affinity vector during exploration to widen the search space.',
    lines: [
      { srcA: 'properties[4,1]', srcB: 'affinity[0,5]', dst: 'affinity[0,5]', op: 'xor', mode: 'accumulate', raw: 'properties[4,1] affinity[0,5] affinity[0,5] xor accumulate' }
    ]
  },
  {
    id: 'unsupervised_learn',
    name: 'Unsupervised Learning',
    description: 'XOR two token spans staged into asset. Zero bits mark shared positions; reduces self-knowledge metric.',
    lines: [
      { srcA: 'asset[0,16]', srcB: 'asset[16,16]', dst: 'signals[0,8]', op: 'xor', mode: 'accumulate', raw: 'asset[0,16]  asset[16,16] signals[0,8]    xor accumulate' },
      { srcA: 'signals[0,8]', srcB: 'signals[0,8]', dst: 'properties[1,1]', op: 'or', mode: 'reduce', raw: 'signals[0,8] signals[0,8] properties[1,1] or  reduce' }
    ]
  }
];

export function parseRegionRef(ref: string): { region: RegionName; startOffset: number; span: number; absoluteStart: number; absoluteEnd: number } | null {
  const match = ref.match(/^([a-z]+)\[(\d+)(?:,(\d+))?\]$/);
  if (!match) return null;
  
  const regionName = match[1] as RegionName;
  const startOffset = parseInt(match[2], 10);
  const span = match[3] ? parseInt(match[3], 10) : 1;
  
  const regionDef = MEMORY_MAP[regionName];
  if (!regionDef) return null;
  
  const absoluteStart = regionDef.start + startOffset;
  const absoluteEnd = absoluteStart + span - 1;
  
  return { region: regionName, startOffset, span, absoluteStart, absoluteEnd };
}
