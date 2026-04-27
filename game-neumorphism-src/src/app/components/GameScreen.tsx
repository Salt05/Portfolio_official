import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLevels } from '../hooks/useLevels';
import { useFirebase, UserProgress } from '../hooks/useFirebase';
import {
  ArrowLeft,
  Coins,
  Star,
  RotateCcw,
  Shuffle,
  Undo2,
  Trash2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Infinity as InfinityIcon,
  Sparkles,
  PartyPopper,
  AlertTriangle,
  Frown,
  RefreshCw,
  ChevronRight,
  Flame,
  X,
  Calculator,
  Layers,
  SquareStack
} from 'lucide-react';

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const NEU = {
  bg: '#dde3ec',
  shadowDark: '#b8bfc8',
  shadowLight: '#ffffff',
  text: '#3d4f66',
  textLight: '#8a9bb5',
  accent: '#7b8cde',
  accentLight: '#eef0fc',
  opBg: '#ede9f8',
  opColor: '#7055c9',
  negBg: '#fce9ec',
  negColor: '#c0454e',
  gold: '#c9a650',
  goldBg: '#fdf6e3',
  green: '#5ab583',
  greenBg: '#eaf7f0',
  red: '#e05c5c',
  redBg: '#fdeaea',
};

const neu = (pressed = false, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizes = { sm: [3, 6], md: [5, 10], lg: [8, 16] };
  const [o, b] = sizes[size];
  return pressed
    ? `inset ${o}px ${o}px ${b}px ${NEU.shadowDark}, inset -${o}px -${o}px ${b}px ${NEU.shadowLight}`
    : `${o}px ${o}px ${b}px ${NEU.shadowDark}, -${o}px -${o}px ${b}px ${NEU.shadowLight}`;
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type OpValue = '+' | '-' | '×' | '÷';
export type TileValue = number | OpValue;
export type TileType = 'number' | 'operator';

export interface GameTile {
  id: string;
  value: TileValue;
  type: TileType;
  row: number;
  col: number;
  layer: number;
}

export interface EquationDef {
  a: number;
  op: OpValue;
  b: number;
  c: number; // result digit 1 (tens if d exists, otherwise units)
  d?: number; // result digit 2 (units)
}

export interface LevelLayer {
  equations: EquationDef[];
  spawnMatrix: boolean[]; // Flattened grid (36 elements: r * 6 + c)
}

export interface LevelDef {
  id: number;
  name: string;
  desc: string;
  rows: number;
  cols: number;
  layers: LevelLayer[];
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
let _tileId = 0;
function nextId() { return `t_${++_tileId}_${Date.now().toString(36)}`; }

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function shuffleArr<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COLS = 6;
const ROWS = 6;

function generateTiles(levelDef: LevelDef, seed?: number): GameTile[] {
  const rng = seededRandom(seed ?? Math.floor(Math.random() * 999999));
  const tiles: GameTile[] = [];

  // Migration: Handle old data format
  let layersData = levelDef.layers;
  if (!layersData) {
    layersData = [
      {
        equations: (levelDef as any).equations || [],
        spawnMatrix: Array(36).fill(true)
      }
    ];
    if ((levelDef as any).layer1Eqs) {
      layersData.push({
        equations: (levelDef as any).layer1Eqs,
        spawnMatrix: Array(36).fill(false)
      });
    }
  }

  let overflowPool: { value: TileValue; type: TileType }[] = [];

  layersData.forEach((layerDef, layerIdx) => {
    // Current layer's pool = its own tiles + overflow from previous
    const currentLayerPool: { value: TileValue; type: TileType }[] = [...overflowPool];

    layerDef.equations.forEach(eq => {
      currentLayerPool.push({ value: eq.a, type: 'number' });
      currentLayerPool.push({ value: eq.op, type: 'operator' });
      currentLayerPool.push({ value: eq.b, type: 'number' });
      currentLayerPool.push({ value: eq.c, type: 'number' });
      if (eq.d !== undefined) {
        currentLayerPool.push({ value: eq.d, type: 'number' });
      }
    });

    const shuffledValues = shuffleArr(currentLayerPool, rng);

    // Get available spots in current matrix
    const availablePos: { r: number, c: number }[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const flatIdx = r * 6 + c;
        const isSet = layerDef.spawnMatrix[flatIdx] === true;
        if (isSet) {
          availablePos.push({ r, c });
        }
      }
    }

    // Assign tiles to available positions in this layer
    const assignedCount = Math.min(shuffledValues.length, availablePos.length);
    for (let i = 0; i < assignedCount; i++) {
      tiles.push({
        id: nextId(),
        value: shuffledValues[i].value,
        type: shuffledValues[i].type,
        row: availablePos[i].r,
        col: availablePos[i].c,
        layer: layerIdx,
      });
    }

    // The rest goes to overflow for the next layer
    overflowPool = shuffledValues.slice(assignedCount);
  });

  if (overflowPool.length > 0) {
    console.warn(`Overflow: ${overflowPool.length} tiles could not be placed in any layer.`);
  }

  return tiles;
}

function generateEndlessTiles(rng: () => number): GameTile[] {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4, -5, -6, -7, -8, -9];
  const ops: OpValue[] = ['+', '-', '×', '÷'];
  // Generate more solvable equations for 6x6 (36 tiles total)
  const eqs: EquationDef[] = [];
  while (eqs.length < 7) { // 7 equations * 5 tiles = 35 tiles
    const a = nums[Math.floor(rng() * nums.length)];
    const op = ops[Math.floor(rng() * ops.length)];
    const b = nums[Math.floor(rng() * nums.length)];
    let c: number;
    if (op === '+') c = a + b;
    else if (op === '-') c = a - b;
    else if (op === '×') c = a * b;
    else {
      if (b === 0) continue;
      c = Math.trunc(a / b);
    }
    if (c >= -99 && c <= 99) eqs.push({ a, op, b, c });
  }
  const tvs: { value: TileValue; type: TileType }[] = [];
  eqs.forEach(eq => {
    tvs.push({ value: eq.a, type: 'number' });
    tvs.push({ value: eq.op, type: 'operator' });
    tvs.push({ value: eq.b, type: 'number' });
    const absC = Math.abs(eq.c);
    if (absC < 10) {
      tvs.push({ value: eq.c, type: 'number' });
    } else {
      const tens = Math.floor(absC / 10) * (eq.c < 0 ? -1 : 1);
      const units = (absC % 10) * (eq.c < 0 ? -1 : 1);
      tvs.push({ value: tens, type: 'number' });
      tvs.push({ value: units, type: 'number' });
    }
  });
  const shuffled = shuffleArr(tvs, rng);
  return shuffled.map((tv, i) => ({
    id: nextId(), value: tv.value, type: tv.type,
    row: Math.floor(i / COLS), col: i % COLS, layer: 0,
  }));
}

function isLocked(tile: GameTile, allTiles: GameTile[]): boolean {
  // A tile is locked if there is a tile with a LOWER layer index on top of it at the same position
  return allTiles.some(
    t => t.id !== tile.id && t.row === tile.row && t.col === tile.col && t.layer < tile.layer
  );
}

function compute(a: number, op: OpValue, b: number): { result: number; remainder: number } {
  if (op === '+') return { result: a + b, remainder: 0 };
  if (op === '-') return { result: a - b, remainder: 0 };
  if (op === '×') return { result: a * b, remainder: 0 };
  if (op === '÷') {
    if (b === 0) return { result: NaN, remainder: 0 };
    const result = Math.trunc(a / b);
    const remainder = a - result * b;
    return { result, remainder };
  }
  return { result: NaN, remainder: 0 };
}

function detectDeadlock(tiles: GameTile[], conveyor: GameTile[]): boolean {
  const available = [
    ...tiles.filter(t => !isLocked(t, tiles)),
    ...conveyor,
  ];
  const numbers = available.filter(t => t.type === 'number');
  const operators = available.filter(t => t.type === 'operator').map(t => t.value as OpValue);

  for (let i = 0; i < numbers.length; i++) {
    for (const op of operators) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j) continue;
        const a = numbers[i].value as number;
        const b = numbers[j].value as number;
        if (b === 0 && op === '÷') continue;
        const { result } = compute(a, op, b);

        if (result >= -99 && result <= 99) {
          const absRes = Math.abs(result);
          const rest = numbers.filter((_, idx) => idx !== i && idx !== j);
          if (absRes < 10) {
            if (rest.some(t => t.value === result)) return false;
          } else {
            const tens = Math.floor(absRes / 10) * (result < 0 ? -1 : 1);
            const units = (absRes % 10) * (result < 0 ? -1 : 1);
            const tensIdx = rest.findIndex(t => t.value === tens);
            if (tensIdx !== -1) {
              const restAfterTens = rest.filter((_, idx) => idx !== tensIdx);
              if (restAfterTens.some(t => t.value === units)) return false;
            }
          }
        }
      }
    }
  }
  return true;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function TileCell({
  tile,
  locked,
  selected,
  flash,
  onClick,
  size = 58,
}: {
  tile: GameTile;
  locked?: boolean;
  selected?: boolean;
  flash?: 'correct' | 'wrong';
  onClick?: () => void;
  size?: string | number;
}) {
  const isOp = tile.type === 'operator';
  const bg = isOp ? NEU.opBg : NEU.bg;
  const color = flash === 'correct' ? NEU.green
    : flash === 'wrong' ? NEU.red
      : isOp ? NEU.opColor
        : NEU.text;

  const shadow = locked
    ? `2px 2px 5px ${NEU.shadowDark}, -1px -1px 3px ${NEU.shadowLight}`
    : selected
      ? neu(true, 'sm')
      : neu(false, 'sm');

  return (
    <div
      onClick={!locked ? onClick : undefined}
      style={{
        width: typeof size === 'number' ? size : '100%',
        aspectRatio: '1/1',
        borderRadius: 12,
        background: flash === 'correct' ? NEU.greenBg : flash === 'wrong' ? NEU.redBg : bg,
        boxShadow: shadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.45 : 1,
        fontSize: size === 48 ? 18 : 22,
        fontWeight: 700,
        color,
        transition: 'all 0.15s ease',
        transform: selected ? 'scale(0.94)' : 'scale(1)',
        userSelect: 'none',
        flexShrink: 0,
        border: selected ? `2px solid ${NEU.accent}55` : '2px solid transparent',
      }}
    >
      {String(tile.value)}
    </div>
  );
}

function SlotCell({
  tile,
  label,
  flash,
  onClick,
}: {
  tile: GameTile | null;
  label: string;
  flash?: 'correct' | 'wrong';
  onClick?: () => void;
}) {
  const bg = flash === 'correct' ? NEU.greenBg : flash === 'wrong' ? NEU.redBg : NEU.bg;
  const shadow = tile ? neu(true, 'sm') : `inset 3px 3px 6px ${NEU.shadowDark}, inset -3px -3px 6px ${NEU.shadowLight}`;

  return (
    <div
      onClick={tile ? onClick : undefined}
      style={{
        width: 50, height: 50,
        borderRadius: 12,
        background: bg,
        boxShadow: shadow,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: tile ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {tile ? (
        <span style={{
          fontSize: 20, fontWeight: 700,
          color: tile.type === 'operator' ? NEU.opColor
            : flash === 'correct' ? NEU.green
              : flash === 'wrong' ? NEU.red
                : NEU.text,
        }}>
          {String(tile.value)}
        </span>
      ) : (
        <span style={{ fontSize: 10, color: NEU.textLight, fontWeight: 500 }}>{label}</span>
      )}
    </div>
  );
}

// ─── MAIN GAME SCREEN ────────────────────────────────────────────────────────
interface GameScreenProps {
  mode: 'campaign' | 'daily' | 'endless';
  initialLevelIdx?: number;
  onBack: () => void;
}

export function GameScreen({ mode, initialLevelIdx, onBack }: GameScreenProps) {
  const { levels, loading: levelsLoading } = useLevels();
  const { progress, loading: progressLoading, updateProgress } = useFirebase();

  const [levelIdx, setLevelIdx] = useState(0);
  const [gold, setGold] = useState(100);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  useEffect(() => {
    if (progress && !hasLoadedProgress && !progressLoading) {
      if (mode === 'campaign') setLevelIdx(initialLevelIdx !== undefined ? initialLevelIdx : (progress.maxLevel || 0));
      setGold(progress.gold ?? 100);
      setHasLoadedProgress(true);
    }
  }, [progress, mode, hasLoadedProgress, progressLoading]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'deadlock'>('playing');
  const [flashResult, setFlashResult] = useState<'correct' | 'wrong' | null>(null);
  const [message, setMessage] = useState('');
  const [undoStack, setUndoStack] = useState<{ tiles: GameTile[]; conveyor: GameTile[] }[]>([]);
  const [spawnInput, setSpawnInput] = useState('');
  const [showSpawn, setShowSpawn] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [moves, setMoves] = useState(0);
  const [tiles, setTiles] = useState<GameTile[]>([]);
  const [conveyor, setConveyor] = useState<GameTile[]>([]);
  const [slots, setSlots] = useState<(GameTile | null)[]>([null, null, null, null, null]);
  const msgTimeout = useRef<number | null>(null);
  const endlessRng = useRef(seededRandom(Date.now()));

  // Get daily seed from date
  useEffect(() => {
    if (progress) {
      setGold(progress.gold);
    }
  }, [progress]);

  const getDailySeed = () => {
    const now = new Date();
    return parseInt(`${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`);
  };

  // Sync gold with Firebase
  const updateGold = useCallback((newGold: number) => {
    setGold(newGold);
    updateProgress({ gold: newGold });
  }, [updateProgress]);

  // Sync scores for endless and daily modes
  const saveModeScores = useCallback(() => {
    if (!progress) return;
    if (mode === 'endless') {
      if (score > progress.highScoreEndless) {
        updateProgress({ highScoreEndless: score });
      }
    } else if (mode === 'daily') {
      const todayKey = new Date().toISOString().split('T')[0];
      const currentDaily = progress.dailyScore?.[todayKey] || 0;
      if (score > currentDaily) {
        updateProgress({ dailyScore: { ...progress.dailyScore, [todayKey]: score } });
      }
    }
  }, [mode, score, progress, updateProgress]);

  const handleBack = useCallback(() => {
    saveModeScores();
    onBack();
  }, [saveModeScores, onBack]);

  const initLevel = useCallback(() => {
    saveModeScores();
    setSlots([null, null, null, null, null]);
    setFlashResult(null);
    setStatus('playing');
    setMessage('');
    setUndoStack([]);
    setCombo(0);
    setMoves(0);

    if (mode === 'campaign') {
      const def = levels[levelIdx] ?? levels[0];
      setTiles(generateTiles(def));
      setConveyor([]);
    } else if (mode === 'daily') {
      const def = levels[1] ?? levels[0]; // medium level for daily
      setTiles(generateTiles(def, getDailySeed()));
      setConveyor([]);
    } else {
      endlessRng.current = seededRandom(Date.now());
      setTiles(generateEndlessTiles(endlessRng.current));
      setConveyor([]);
    }
  }, [mode, levelIdx, levels]);

  useEffect(() => {
    if (!levelsLoading && !progressLoading) {
      initLevel();
    }
  }, [initLevel, levelsLoading, progressLoading]);

  const showMsg = (msg: string, duration = 2000) => {
    setMessage(msg);
    if (msgTimeout.current) clearTimeout(msgTimeout.current);
    msgTimeout.current = window.setTimeout(() => setMessage(''), duration);
  };

  // Save undo snapshot
  const saveUndo = (currentTiles: GameTile[], currentConveyor: GameTile[]) => {
    setUndoStack(s => [...s.slice(-9), { tiles: currentTiles, conveyor: currentConveyor }]);
  };

  const executeEquationCheck = (newSlots: (GameTile | null)[], result: number, remainder: number) => {
    const tens = newSlots[3]?.value as number ?? 0;
    const units = newSlots[4]?.value as number ?? 0;
    const isSingleDigit = newSlots[4] === null;
    const targetVal = isSingleDigit ? tens : (tens * 10 + units);

    const a = newSlots[0]?.value as number ?? 0;
    const op = newSlots[1]?.value as OpValue ?? '+';
    const b = newSlots[2]?.value as number ?? 0;

    if (isNaN(result)) {
      setFlashResult('wrong');
      showMsg('❌ Chia cho 0!');
      setTimeout(() => {
        setSlots([null, null, null, null, null]);
        setFlashResult(null);
      }, 900);
      return;
    }

    if (result === targetVal) {
      setFlashResult('correct');
      const pts = 100 * (combo + 1);
      setScore(sc => sc + pts);
      setCombo(co => co + 1);
      setMoves(m => m + 1);
      showMsg(`✅ +${pts} points${combo > 0 ? ` 🔥 ×${combo + 1}` : ''}!`);
      saveUndo(tiles, conveyor);

      const removedIds = new Set(newSlots.filter(Boolean).map(s => s!.id));
      const newTiles = tiles.filter(t => !removedIds.has(t.id));
      const newConveyor = conveyor.filter(t => !removedIds.has(t.id));

      let finalConveyor = newConveyor;
      if (remainder !== 0) {
        if (newConveyor.length >= 6) {
          showMsg('⚠️ Conveyor is full (6/6)! Overflow was discarded.');
        } else {
          const remTile: GameTile = { id: nextId(), value: remainder, type: 'number', row: 0, col: 0, layer: 0 };
          finalConveyor = [...newConveyor, remTile];
          showMsg(`✅ +${pts} pts | Remainder ${remainder} → Conveyor`);
        }
      }

      setTimeout(() => {
        setTiles(newTiles);
        setConveyor(finalConveyor);
        setSlots([null, null, null, null, null]);
        setFlashResult(null);

        if (newTiles.length === 0 && finalConveyor.length === 0) {
          setStatus('won');
          if (mode === 'campaign' && progress) {
            const currentLevelId = levels[levelIdx]?.id || 1;
            const updates: Partial<UserProgress> = { gold: gold + 20 };
            if (currentLevelId > progress.maxLevel) updates.maxLevel = currentLevelId;
            updateProgress(updates);
            setGold(prev => prev + 20);
          }
        } else if (detectDeadlock(newTiles, finalConveyor)) {
          setStatus('deadlock');
          showMsg('⚠️ No moves left! Use Shuffle or give up.', 5000);
        }
      }, 700);
    } else {
      setFlashResult('wrong');
      setCombo(0);
      showMsg(`❌ ${a} ${op} ${b} ≠ ${targetVal} (= ${result})`);
      setTimeout(() => {
        setSlots([null, null, null, null, null]);
        setFlashResult(null);
      }, 900);
    }
  };

  const handleTileClick = useCallback((tile: GameTile, fromConveyor = false) => {
    if (status !== 'playing') return;

    if (deleteMode) {
      if (fromConveyor) setConveyor(c => c.filter(t => t.id !== tile.id));
      else setTiles(ts => ts.filter(t => t.id !== tile.id));
      setDeleteMode(false);
      updateGold(gold - 50);
      showMsg('Tile deleted!');
      return;
    }

    if (!fromConveyor && isLocked(tile, tiles)) return;

    const slotIdx = slots.findIndex(s => s?.id === tile.id);
    if (slotIdx !== -1) {
      const newSlots = [...slots];
      newSlots[slotIdx] = null;
      setSlots(newSlots);
      return;
    }

    const newSlots = [...slots];
    if (tile.type === 'operator') {
      if (!newSlots[1]) {
        if (!newSlots[0]) { showMsg('Pick the first number!'); return; }
        newSlots[1] = tile;
        setSlots(newSlots);
        return;
      } else { showMsg('Operator slot is already filled!'); return; }
    }

    if (!newSlots[0]) {
      newSlots[0] = tile;
    } else if (newSlots[1] && !newSlots[2]) {
      newSlots[2] = tile;
    } else if (newSlots[0] && newSlots[1] && newSlots[2] && !newSlots[3]) {
      newSlots[3] = tile;
      const a = newSlots[0].value as number;
      const op = newSlots[1].value as OpValue;
      const b = newSlots[2].value as number;
      const { result, remainder } = compute(a, op, b);
      if (result >= 0 && result < 10) {
        setSlots(newSlots);
        executeEquationCheck(newSlots, result, remainder);
      } else {
        setSlots(newSlots);
      }
      return;
    } else if (newSlots[0] && newSlots[1] && newSlots[2] && newSlots[3] && !newSlots[4]) {
      newSlots[4] = tile;
      const a = newSlots[0].value as number;
      const op = newSlots[1].value as OpValue;
      const b = newSlots[2].value as number;
      const { result, remainder } = compute(a, op, b);
      setSlots(newSlots);
      executeEquationCheck(newSlots, result, remainder);
      return;
    } else if (!newSlots[1]) {
      showMsg('Pick an operator (+, -, ×, ÷)!');
      return;
    }

    setSlots(newSlots);
  }, [status, deleteMode, tiles, conveyor, slots, combo, gold, mode, progress, levelIdx, levels, updateGold, updateProgress]);

  // Helper: Undo
  const handleUndo = () => {
    if (undoStack.length === 0) { showMsg('Nothing to undo!'); return; }
    if (gold < 10) { showMsg('Not enough gold!'); return; }
    const last = undoStack[undoStack.length - 1];
    setTiles(last.tiles);
    setConveyor(last.conveyor);
    setUndoStack(s => s.slice(0, -1));
    setSlots([null, null, null, null, null]);
    updateGold(gold - 10);
    setCombo(0);
    showMsg('↩ Undone! (-10G)');
  };

  // Helper: Shuffle
  const handleShuffle = () => {
    if (gold < 30) { showMsg('Not enough gold!'); return; }
    updateGold(gold - 30);
    const rng = seededRandom(Date.now());
    const unlocked = tiles.filter(t => !isLocked(t, tiles));
    const locked = tiles.filter(t => isLocked(t, tiles));
    const shuffledUnlocked = shuffleArr(unlocked, rng).map((t, i) => ({
      ...t, row: unlocked[i].row, col: unlocked[i].col,
    }));
    setTiles([...locked, ...shuffledUnlocked]);
    setSlots([null, null, null, null, null]);
    setStatus('playing');
    showMsg('🔀 Shuffled! (-30G)');
  };

  // Helper: Return
  const handleReturn = () => {
    if (gold < 20) { showMsg('Not enough gold!'); return; }
    const inSlots = slots.filter(Boolean) as GameTile[];
    if (inSlots.length === 0) { showMsg('No tiles in slots!'); return; }
    updateGold(gold - 20);
    // Return board tiles
    setSlots([null, null, null, null, null]);
    showMsg('↩ Slots returned! (-20G)');
  };

  // Helper: Delete mode
  const handleDeleteMode = () => {
    if (gold < 50) { showMsg('Not enough gold!'); return; }
    setDeleteMode(d => !d);
    showMsg(deleteMode ? 'Delete canceled' : '🗑️ Pick a tile to delete! (-50G)');
  };

  // Helper: Spawn
  const handleSpawn = () => {
    if (!spawnInput || isNaN(+spawnInput)) return;
    const val = parseInt(spawnInput);
    if (val < 1 || val > 9) { showMsg('Enter a number from 1 to 9!'); return; }
    if (conveyor.length >= 6) {
      showMsg('⚠️ Conveyor is full (6/6)!');
      return;
    }
    updateGold(gold - 100);
    const newTile: GameTile = {
      id: nextId(), value: val, type: 'number', row: 0, col: 0, layer: 0,
    };
    setConveyor(c => [...c, newTile]);
    setSpawnInput('');
    setShowSpawn(false);
    showMsg(`✨ Spawned ${val}! (-100G)`);
  };

  const getLevelName = () => {
    if (mode === 'campaign') return `Level ${levels[levelIdx]?.id ?? 1}: ${levels[levelIdx]?.name ?? ''}`;
    if (mode === 'daily') return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Star size={16} /> Daily Challenge
      </div>
    );
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <InfinityIcon size={16} /> Endless Mode
      </div>
    );
  };

  const GAP = 6;
  const LAYER_OFFSET = 4;

  // Board dimensions
  const levelDef = mode === 'campaign' ? (levels[levelIdx] ?? levels[0]) : (levels[1] ?? levels[0]);

  // Group tiles by position (Top layers first for visual depth)
  const tilesByPos: Record<string, GameTile[]> = {};
  tiles.forEach(t => {
    const key = `${t.row}_${t.col}`;
    if (!tilesByPos[key]) tilesByPos[key] = [];
    tilesByPos[key].push(t);
  });
  // Sort so that LOWER layers (closer to surface) are at the END of the array (rendered last/top)
  Object.values(tilesByPos).forEach(arr => arr.sort((a, b) => b.layer - a.layer));


  // All unique positions
  const maxRow = tiles.reduce((m, t) => Math.max(m, t.row), 0);

  const tileInSlot = (id: string) => slots.some(s => s?.id === id);

  if (progressLoading || levelsLoading) {
    return (
      <div style={{
        height: '100dvh', background: NEU.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 20
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: `4px solid ${NEU.accent}22`,
          borderTopColor: NEU.accent,
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: NEU.text, fontWeight: 600 }}>Loading data...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100dvh',
        background: NEU.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}
    >
      {/* ── HUD ── */}
      <div style={{
        width: '100%', maxWidth: 440,
        padding: '10px 16px 0',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={handleBack}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: NEU.bg, boxShadow: neu(false, 'sm'),
            cursor: 'pointer', color: NEU.textLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: NEU.text }}>{getLevelName()}</div>
          <div style={{ fontSize: 10, color: NEU.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={10} /> {tiles.length + conveyor.length} tiles
          </div>
        </div>

        <div style={{
          padding: '4px 10px', borderRadius: 10, background: NEU.bg,
          boxShadow: neu(true, 'sm'), display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ color: NEU.gold }}><Coins size={12} /></span>
          <span style={{ fontWeight: 700, color: NEU.text, fontSize: 13 }}>{gold}</span>
        </div>

        <div style={{
          padding: '4px 10px', borderRadius: 10, background: NEU.bg,
          boxShadow: neu(true, 'sm'), display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ color: '#e0a040' }}><Trophy size={12} /></span>
          <span style={{ fontWeight: 700, color: NEU.text, fontSize: 13 }}>{score}</span>
        </div>
      </div>

      {/* ── Message Toast ── */}
      <div style={{
        height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, gap: 6,
        color: message.includes('✅') ? NEU.green : message.includes('❌') ? NEU.red : message.includes('⚠️') ? NEU.gold : NEU.accent,
        transition: 'opacity 0.3s',
        opacity: message ? 1 : 0,
        margin: '2px 0',
      }}>
        {message.includes('✅') && <CheckCircle2 size={14} />}
        {message.includes('❌') && <AlertCircle size={14} />}
        {message.includes('⚠️') && <AlertTriangle size={14} />}
        {message.includes('🔥') && <Flame size={14} color={NEU.gold} />}
        {message.includes('↩') && <Undo2 size={14} />}
        {message.includes('🔀') && <Shuffle size={14} />}
        {message.includes('🗑️') && <Trash2 size={14} />}
        {message.includes('✨') && <Sparkles size={14} />}
        {message.replace(/[✅❌⚠️🔥↩🔀🗑️✨]/g, '') || '·'}
      </div>

      {/* ── BOARD ── */}
      <div style={{
        width: 'fit-content',
        maxWidth: 'calc(100% - 32px)',
        background: NEU.bg,
        borderRadius: 20,
        padding: '10px',
        boxShadow: `inset 6px 6px 12px ${NEU.shadowDark}, inset -6px -6px 12px ${NEU.shadowLight}`,
        overflow: 'hidden',
        flexShrink: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 50px)`,
            gridTemplateRows: `repeat(${ROWS}, 50px)`,
            gap: GAP,
          }}
        >
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const key = `${row}_${col}`;
              const cellTiles = tilesByPos[key] ?? [];
              return (
                <div
                  key={key}
                  style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}
                >
                  {(() => {
                    // Lower layer index means higher (top) priority
                    const currentMinLayer = tiles.reduce((min, t) => Math.min(min, t.layer), 99);
                    
                    return cellTiles
                      .filter(t => t.layer === currentMinLayer || t.layer === currentMinLayer + 1)
                      .map((tile, i) => {
                        // In the sorted array, last element should be the one at minLayer
                        const fromTop = (cellTiles.length - 1) - i;
                        const locked = isLocked(tile, tiles);
                        const selected = tileInSlot(tile.id);
                        
                        return (
                          <div
                            key={tile.id}
                            style={{
                              position: 'absolute',
                              top: fromTop * LAYER_OFFSET,
                              left: fromTop * LAYER_OFFSET,
                              width: '100%',
                              height: '100%',
                              zIndex: 10 - tile.layer, // Lower layer index higher z-index
                              transition: 'all 0.4s ease-out',
                            }}
                          >
                            <TileCell
                              tile={tile}
                              locked={locked}
                              selected={selected}
                              flash={selected ? flashResult ?? undefined : undefined}
                              onClick={() => handleTileClick(tile)}
                              size="100%"
                            />
                          </div>
                        );
                      });
                  })()}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CONVEYOR ── */}
      <div style={{ width: 'calc(100% - 32px)', maxWidth: 440, marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 'fit-content',
          display: 'flex', gap: 8,
          padding: '8px 10px',
          borderRadius: 20,
          background: NEU.bg,
          boxShadow: `inset 6px 6px 12px ${NEU.shadowDark}, inset -6px -6px 12px ${NEU.shadowLight}`,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const tile = conveyor[i];
            return (
              <div
                key={i}
                style={{
                  width: 50, height: 50,
                  borderRadius: 12,
                  background: NEU.bg,
                  boxShadow: `inset 2px 2px 5px ${NEU.shadowDark}, inset -2px -2px 5px ${NEU.shadowLight}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {tile && (
                  <TileCell
                    tile={tile}
                    selected={tileInSlot(tile.id)}
                    flash={tileInSlot(tile.id) ? flashResult ?? undefined : undefined}
                    onClick={() => handleTileClick(tile, true)}
                    size="100%"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FORMULA BAR ── */}
      <div style={{ width: 'calc(100% - 32px)', maxWidth: 440, margin: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 'fit-content',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 10px',
          borderRadius: 20,
          background: NEU.bg,
          boxShadow: `inset 6px 6px 12px ${NEU.shadowDark}, inset -6px -6px 12px ${NEU.shadowLight}`,
          justifyContent: 'center'
        }}>
          <SlotCell
            tile={slots[0]}
            label=""
            flash={flashResult ?? undefined}
            onClick={() => {
              const newSlots = [...slots];
              newSlots[0] = null;
              setSlots(newSlots);
            }}
          />
          <SlotCell
            tile={slots[1]}
            label=""
            flash={flashResult ?? undefined}
            onClick={() => {
              const newSlots = [...slots];
              newSlots[1] = null;
              setSlots(newSlots);
            }}
          />
          <SlotCell
            tile={slots[2]}
            label=""
            flash={flashResult ?? undefined}
            onClick={() => {
              const newSlots = [...slots];
              newSlots[2] = null;
              setSlots(newSlots);
            }}
          />
          <div style={{
            width: 50, height: 50,
            borderRadius: 12,
            background: NEU.bg,
            boxShadow: `inset 3px 3px 6px ${NEU.shadowDark}, inset -3px -3px 6px ${NEU.shadowLight}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: NEU.textLight,
            flexShrink: 0,
          }}>
            =
          </div>
          <SlotCell
            tile={slots[3]}
            label=""
            flash={flashResult ?? undefined}
            onClick={() => {
              const newSlots = [...slots];
              newSlots[3] = null;
              setSlots(newSlots);
            }}
          />
          <SlotCell
            tile={slots[4]}
            label=""
            flash={flashResult ?? undefined}
            onClick={() => {
              const newSlots = [...slots];
              newSlots[4] = null;
              setSlots(newSlots);
            }}
          />

          {/* Preview */}
          {slots[0] && slots[1] && slots[2] && !slots[3] && !slots[4] && (
            <div style={{
              marginLeft: 4, padding: '4px 10px', borderRadius: 10,
              background: NEU.accentLight, fontSize: 13, fontWeight: 700, color: NEU.accent,
              flexShrink: 0,
            }}>
              {(() => {
                const { result } = compute(
                  slots[0]!.value as number,
                  slots[1]!.value as OpValue,
                  slots[2]!.value as number,
                );
                return isNaN(result) ? '⚠️' : `=${result < 0 ? result : (result < 10 ? '0' + result : result)}`;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── HELPERS ── */}
      <div style={{
        width: '100%', maxWidth: 440,
        padding: '0 16px 8px',
        display: 'flex', gap: 6,
        justifyContent: 'center',
      }}>
        {[
          { icon: <Undo2 size={20} />, sub: 'Undo\n-10G', action: handleUndo, cost: 10 },
          { icon: <Shuffle size={20} />, sub: 'Shuffle\n-30G', action: handleShuffle, cost: 30 },
          { icon: <RotateCcw size={20} />, sub: 'Return\n-20G', action: handleReturn, cost: 20 },
          { icon: <Trash2 size={20} />, sub: 'Delete\n-50G', action: handleDeleteMode, cost: 50, active: deleteMode },
          { icon: <Sparkles size={20} />, sub: 'Spawn\n-100G', action: () => setShowSpawn(s => !s), cost: 100 },
        ].map((h, i) => (
          <button
            key={i}
            onClick={h.action}
            style={{
              flex: 1, padding: '6px 2px', borderRadius: 12,
              border: 'none', background: NEU.bg,
              boxShadow: h.active ? neu(true, 'sm') : neu(false, 'sm'),
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
              opacity: gold < h.cost ? 0.5 : 1,
              color: h.active ? NEU.red : NEU.text,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 20 }}>
              {React.cloneElement(h.icon as React.ReactElement, { size: 18 })}
            </div>
            <span style={{ fontSize: 8, color: NEU.textLight, whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.2 }}>
              {h.sub}
            </span>
          </button>
        ))}
      </div>

      {/* ── Spawn Input ── */}
      {showSpawn && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50,
          padding: '16px',
          borderRadius: 20,
          background: NEU.bg,
          boxShadow: `10px 10px 20px ${NEU.shadowDark}, -10px -10px 20px ${NEU.shadowLight}`,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, color: NEU.text }}>Spawn:</span>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*"
            value={spawnInput}
            onChange={e => setSpawnInput(e.target.value)}
            style={{
              width: 60, height: 40, borderRadius: 10, border: 'none',
              background: NEU.bg, boxShadow: neu(true, 'sm'),
              textAlign: 'center', fontSize: 18, fontWeight: 700, color: NEU.text,
              outline: 'none',
            }}
          />
          <button
            onClick={handleSpawn}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: NEU.bg, boxShadow: neu(false, 'sm'),
              cursor: 'pointer', fontWeight: 700, color: NEU.accent, fontSize: 14,
            }}
          >OK</button>
          <button
            onClick={() => setShowSpawn(false)}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: NEU.bg, boxShadow: neu(false, 'sm'),
              cursor: 'pointer', color: NEU.textLight, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ── OVERLAYS ── */}
      {(status === 'won' || status === 'lost' || status === 'deadlock') && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(200,210,225,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 320, padding: 32, borderRadius: 28,
            background: NEU.bg,
            boxShadow: `16px 16px 32px ${NEU.shadowDark}, -16px -16px 32px ${NEU.shadowLight}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 52, color: status === 'won' ? NEU.green : status === 'deadlock' ? NEU.gold : NEU.red }}>
              {status === 'won' ? <PartyPopper size={64} style={{ margin: '0 auto' }} />
                : status === 'deadlock' ? <AlertTriangle size={64} style={{ margin: '0 auto' }} />
                  : <Frown size={64} style={{ margin: '0 auto' }} />}
            </div>
            <h2 style={{ margin: '12px 0 6px', color: NEU.text }}>
              {status === 'won' ? 'Victory!' : status === 'deadlock' ? 'Deadlock!' : 'Defeat!'}
            </h2>
            <p style={{ margin: '0 0 6px', color: NEU.textLight, fontSize: 14 }}>
              {status === 'won'
                ? `🏆 Score: ${score} | ${moves} moves`
                : status === 'deadlock'
                  ? 'No valid moves remaining!'
                  : 'No hope left!'}
            </p>
            {combo > 1 && status === 'won' && (
              <p style={{ color: NEU.gold, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                🔥 Max combo ×{combo}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {status === 'deadlock' && (
                <button
                  onClick={handleShuffle}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 14, border: 'none',
                    background: NEU.bg, boxShadow: neu(false, 'sm'),
                    cursor: 'pointer', fontWeight: 700, color: NEU.accent, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <Shuffle size={16} /> Shuffle (-30G)
                </button>
              )}
              <button
                onClick={initLevel}
                style={{
                  flex: 1, padding: '12px', borderRadius: 14, border: 'none',
                  background: NEU.bg, boxShadow: neu(false, 'sm'),
                  cursor: 'pointer', fontWeight: 700, color: NEU.text, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <RefreshCw size={16} /> Retry
              </button>
              {status === 'won' && mode === 'campaign' && levelIdx < levels.length - 1 && (
                <button
                  onClick={() => {
                    setLevelIdx(l => l + 1);
                  }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 14, border: 'none',
                    background: NEU.accentLight, boxShadow: neu(false, 'sm'),
                    cursor: 'pointer', fontWeight: 700, color: NEU.accent, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              )}
              <button
                onClick={onBack}
                style={{
                  flex: 1, padding: '12px', borderRadius: 14, border: 'none',
                  background: NEU.bg, boxShadow: neu(false, 'sm'),
                  cursor: 'pointer', fontWeight: 700, color: NEU.textLight, fontSize: 14,
                }}
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete mode overlay hint */}
      {deleteMode && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 12, zIndex: 40,
          background: NEU.redBg, color: NEU.red,
          fontWeight: 700, fontSize: 13,
          boxShadow: `4px 4px 8px ${NEU.shadowDark}, -4px -4px 8px ${NEU.shadowLight}`,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Trash2 size={16} /> Tap a tile to delete... (Tap again to cancel)
        </div>
      )}

      {/* Combo badge */}
      {combo > 1 && (
        <div style={{
          position: 'fixed', top: 80, right: 20,
          padding: '8px 14px', borderRadius: 12, zIndex: 30,
          background: NEU.goldBg, color: NEU.gold,
          fontWeight: 800, fontSize: 14,
          boxShadow: `4px 4px 8px ${NEU.shadowDark}`,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Flame size={16} /> ×{combo}
        </div>
      )}
    </div>
  );
}
