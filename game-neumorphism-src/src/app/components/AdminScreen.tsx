import React, { useState } from 'react';
import { useLevels } from '../hooks/useLevels';
import { LevelDef, EquationDef, OpValue, LevelLayer } from './GameScreen';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  LayoutGrid,
  ListChecks,
  Settings,
  ChevronRight,
  Database
} from 'lucide-react';

const NEU = {
  bg: '#dde3ec',
  shadowDark: '#b8bfc8',
  shadowLight: '#ffffff',
  text: '#3d4f66',
  textLight: '#8a9bb5',
  accent: '#7b8cde',
  red: '#e05c5c',
  green: '#5ab583'
};

const neu = (pressed = false) =>
  pressed
    ? `inset 4px 4px 8px ${NEU.shadowDark}, inset -4px -4px 8px ${NEU.shadowLight}`
    : `6px 6px 12px ${NEU.shadowDark}, -6px -6px 12px ${NEU.shadowLight}`;

export function AdminScreen({ onBack }: { onBack: () => void }) {
  const { levels, loading, addLevel, updateLevel, deleteLevel } = useLevels();
  const [selectedLevel, setSelectedLevel] = useState<LevelDef | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = (level: LevelDef) => {
    // Migration for old data if needed
    const migratedLevel = { ...level };
    if (!(migratedLevel as any).layers) {
      (migratedLevel as any).layers = [
        { 
          equations: (migratedLevel as any).equations || [], 
          spawnMatrix: Array(36).fill(true) 
        }
      ];
      if ((migratedLevel as any).layer1Eqs) {
        (migratedLevel as any).layers.push({
          equations: (migratedLevel as any).layer1Eqs,
          spawnMatrix: Array(36).fill(false)
        });
      }
    }
    setSelectedLevel(migratedLevel);
    setIsEditing(true);
  };

  const createNew = () => {
    const nextId = levels.length > 0 ? Math.max(...levels.map(l => l.id)) + 1 : 1;
    setSelectedLevel({
      id: nextId,
      name: `Level ${nextId}`,
      desc: 'Short description...',
      rows: 6,
      cols: 6,
      layers: [
        { 
          equations: [{ a: 1, op: '+', b: 1, c: 2 }], 
          spawnMatrix: Array(36).fill(true) 
        }
      ]
    });
    setIsEditing(true);
  };

  const save = async () => {
    if (!selectedLevel) return;
    if (levels.find(l => l.id === selectedLevel.id)) {
      await updateLevel(selectedLevel);
    } else {
      await addLevel(selectedLevel);
    }
    setIsEditing(false);
  };

  const addLayer = () => {
    if (!selectedLevel) return;
    const newLayer: LevelLayer = {
      equations: [{ a: 1, op: '+', b: 1, c: 2 }],
      spawnMatrix: Array(36).fill(false)
    };
    setSelectedLevel({ ...selectedLevel, layers: [...selectedLevel.layers, newLayer] });
  };

  const removeLayer = (idx: number) => {
    if (!selectedLevel || selectedLevel.layers.length <= 1) return;
    const newLayers = selectedLevel.layers.filter((_, i) => i !== idx);
    setSelectedLevel({ ...selectedLevel, layers: newLayers });
  };

  const addEq = (layerIdx: number) => {
    if (!selectedLevel) return;
    const newLayers = [...selectedLevel.layers];
    newLayers[layerIdx].equations.push({ a: 1, op: '+', b: 1, c: 2 });
    setSelectedLevel({ ...selectedLevel, layers: newLayers });
  };

  const updateEq = (layerIdx: number, eqIdx: number, field: keyof EquationDef, val: any) => {
    if (!selectedLevel) return;
    const newLayers = [...selectedLevel.layers];
    (newLayers[layerIdx].equations[eqIdx] as any)[field] = val;
    setSelectedLevel({ ...selectedLevel, layers: newLayers });
  };

  const removeEq = (layerIdx: number, eqIdx: number) => {
    if (!selectedLevel) return;
    const newLayers = [...selectedLevel.layers];
    newLayers[layerIdx].equations = newLayers[layerIdx].equations.filter((_, i) => i !== eqIdx);
    setSelectedLevel({ ...selectedLevel, layers: newLayers });
  };

  const toggleMatrix = (layerIdx: number, r: number, c: number) => {
    if (!selectedLevel) return;
    const newLayers = [...selectedLevel.layers];
    const matrix = [...newLayers[layerIdx].spawnMatrix];
    const flatIdx = r * 6 + c;
    matrix[flatIdx] = !matrix[flatIdx];
    newLayers[layerIdx].spawnMatrix = matrix;
    setSelectedLevel({ ...selectedLevel, layers: newLayers });
  };

  if (loading) return (
    <div style={{ height: '100dvh', background: NEU.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
      <Database size={32} className="animate-pulse" style={{ color: NEU.accent }} />
      <div style={{ fontWeight: 600 }}>Loading levels...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', background: NEU.bg, padding: '24px 16px', color: NEU.text, fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto 30px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: NEU.bg, boxShadow: neu(), cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Level Designer</h1>
          <p style={{ margin: 0, fontSize: 13, color: NEU.textLight }}>Configure layers and spawn positions</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={createNew} style={{ padding: '12px 20px', borderRadius: 14, border: 'none', background: NEU.bg, boxShadow: neu(), cursor: 'pointer', fontWeight: 700, color: NEU.accent, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> New Level
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {levels.map(l => (
              <div key={l.id} style={{ padding: 24, borderRadius: 24, background: NEU.bg, boxShadow: neu(), position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: NEU.accent }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: NEU.accent + '15', color: NEU.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>
                    {l.id}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(l)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: NEU.bg, boxShadow: neu(), cursor: 'pointer', color: NEU.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Settings size={18} />
                    </button>
                    <button onClick={() => { if (confirm('Delete this level?')) deleteLevel(l.id); }} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: NEU.bg, boxShadow: neu(), cursor: 'pointer', color: NEU.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: 13, color: NEU.textLight, marginBottom: 12 }}>{l.desc}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 600, color: NEU.textLight }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><LayoutGrid size={14} /> {l.layers?.length || (l as any).layer1Eqs ? 2 : 1} Layers</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ListChecks size={14} /> Grid 6x6</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 120 }}>
            {/* Global Settings */}
            <div style={{ padding: 24, borderRadius: 24, background: NEU.bg, boxShadow: `inset 5px 5px 10px ${NEU.shadowDark}, inset -5px -5px 10px ${NEU.shadowLight}`, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 12, color: NEU.textLight, marginBottom: 6, display: 'block', fontWeight: 600 }}>Level name</label>
                <input 
                  type="text" 
                  value={selectedLevel?.name} 
                  onChange={e => setSelectedLevel({ ...selectedLevel!, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: 'none', borderRadius: 12, background: NEU.bg, boxShadow: neu(true), fontSize: 15, outline: 'none', color: NEU.text }}
                />
              </div>
              <div style={{ width: 80 }}>
                <label style={{ fontSize: 12, color: NEU.textLight, marginBottom: 6, display: 'block', fontWeight: 600 }}>Order</label>
                <input 
                  type="number" 
                  value={selectedLevel?.id} 
                  onChange={e => setSelectedLevel({ ...selectedLevel!, id: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: NEU.bg, boxShadow: neu(true), fontSize: 15, outline: 'none', textAlign: 'center' }}
                />
              </div>
              <div style={{ flex: '2 1 300px' }}>
                <label style={{ fontSize: 12, color: NEU.textLight, marginBottom: 6, display: 'block', fontWeight: 600 }}>Description</label>
                <input 
                  type="text" 
                  value={selectedLevel?.desc} 
                  onChange={e => setSelectedLevel({ ...selectedLevel!, desc: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: 'none', borderRadius: 12, background: NEU.bg, boxShadow: neu(true), fontSize: 15, outline: 'none' }}
                />
              </div>
            </div>

            {/* Layers Area */}
            {selectedLevel?.layers.map((layer, lIdx) => (
              <div key={lIdx} style={{ padding: 24, borderRadius: 28, background: NEU.bg, boxShadow: neu(), border: `1px solid ${NEU.shadowLight}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 10, background: NEU.accent, color: '#fff', fontSize: 12, fontWeight: 800 }}>
                      LAYER {lIdx}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Layer config {lIdx}</h3>
                  </div>
                  {lIdx > 0 && (
                    <button onClick={() => removeLayer(lIdx)} style={{ color: NEU.red, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                      <Trash2 size={16} /> Delete Layer
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                  {/* Matrix Editor */}
                  <div style={{ flex: '0 0 auto' }}>
                    <label style={{ fontSize: 12, color: NEU.textLight, marginBottom: 12, display: 'block', fontWeight: 600 }}>Spawn positions (6x6 matrix)</label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(6, 36px)', 
                      gap: 8,
                      padding: 12,
                      borderRadius: 20,
                      background: NEU.bg,
                      boxShadow: neu(true)
                    }}>
                      {Array(6).fill(null).map((_, r) => (
                        Array(6).fill(null).map((_, c) => {
                          const isActive = layer.spawnMatrix[r * 6 + c];
                          return (
                            <div
                              key={`${r}-${c}`}
                              onClick={() => toggleMatrix(lIdx, r, c)}
                              style={{
                                width: 36, height: 36, borderRadius: 8,
                                background: isActive ? NEU.accent : NEU.bg,
                                boxShadow: isActive ? 'none' : neu(),
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: isActive ? `2px solid #fff` : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff'
                              }}
                            >
                              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />}
                            </div>
                          );
                        })
                      ))}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 11, color: NEU.textLight, textAlign: 'center' }}>
                      Check a cell to allow tile spawn
                    </div>
                  </div>

                  {/* Equations Editor */}
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: 12, color: NEU.textLight, marginBottom: 12, display: 'block', fontWeight: 600 }}>Layer equations</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {layer.equations.map((eq, eIdx) => (
                        <EqRow 
                          key={eIdx} 
                          eq={eq} 
                          onUpdate={(f, v) => updateEq(lIdx, eIdx, f, v)} 
                          onRemove={() => removeEq(lIdx, eIdx)} 
                        />
                      ))}
                      <button 
                        onClick={() => addEq(lIdx)} 
                        style={{ 
                          padding: '12px', borderRadius: 12, border: '1px dashed #7b8cde', 
                          background: NEU.bg, boxShadow: neu(), cursor: 'pointer', 
                          color: NEU.accent, fontWeight: 700, fontSize: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = NEU.accent + '08'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = NEU.bg; }}
                      >
                        <Plus size={16} /> Add Equation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={addLayer} 
              style={{ 
                width: '100%', padding: '20px', borderRadius: 24, border: 'none', 
                background: NEU.bg, boxShadow: neu(), cursor: 'pointer', 
                color: NEU.accent, fontWeight: 800, fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
              }}
            >
              <LayoutGrid size={22} /> ADD NEW LAYER (LAYER {selectedLevel?.layers.length})
            </button>

            {/* Bottom Bar */}
            <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 800, display: 'flex', gap: 16, zIndex: 100 }}>
              <button 
                onClick={() => setIsEditing(false)} 
                style={{ flex: 1, padding: '18px', borderRadius: 18, border: 'none', background: NEU.bg, boxShadow: neu(), cursor: 'pointer', fontWeight: 700, color: NEU.textLight, fontSize: 16 }}
              >
                Discard changes
              </button>
              <button 
                onClick={save} 
                style={{ flex: 2, padding: '18px', borderRadius: 18, border: 'none', background: NEU.accent, boxShadow: `8px 8px 16px ${NEU.shadowDark}`, cursor: 'pointer', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 16 }}
              >
                <Save size={22} /> SAVE LEVEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EqRow({ eq, onUpdate, onRemove }: { eq: EquationDef, onUpdate: (f: keyof EquationDef, v: any) => void, onRemove: () => void }) {
  return (
    <div style={{ padding: 16, borderRadius: 20, background: NEU.bg, boxShadow: neu(), display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="number" value={eq.a} onChange={e => onUpdate('a', parseInt(e.target.value))} style={{ width: 50, padding: 8, border: 'none', borderRadius: 8, background: NEU.bg, boxShadow: neu(true), textAlign: 'center' }} />

      <select value={eq.op} onChange={e => onUpdate('op', e.target.value)} style={{ width: 50, padding: 8, border: 'none', borderRadius: 8, background: NEU.bg, boxShadow: neu(true), textAlign: 'center' }}>
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="×">×</option>
        <option value="÷">÷</option>
      </select>

      <input type="number" value={eq.b} onChange={e => onUpdate('b', parseInt(e.target.value))} style={{ width: 50, padding: 8, border: 'none', borderRadius: 8, background: NEU.bg, boxShadow: neu(true), textAlign: 'center' }} />

      <span>=</span>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input 
          type="number" 
          value={eq.c} 
          onChange={e => onUpdate('c', parseInt(e.target.value))} 
          title="Digit C"
          style={{ width: 44, padding: 8, border: 'none', borderRadius: 8, background: NEU.bg, boxShadow: neu(true), textAlign: 'center' }} 
        />
        <input 
          type="number" 
          placeholder="D"
          value={eq.d ?? ''} 
          onChange={e => onUpdate('d', e.target.value === '' ? undefined : parseInt(e.target.value))} 
          title="Digit D"
          style={{ width: 44, padding: 8, border: 'none', borderRadius: 8, background: NEU.bg, boxShadow: neu(true), textAlign: 'center', opacity: eq.d === undefined ? 0.6 : 1 }} 
        />
      </div>

      <div style={{ flex: 1 }} />
      <button onClick={onRemove} style={{ color: NEU.red, border: 'none', background: 'none', cursor: 'pointer' }}>
        <Trash2 size={18} />
      </button>
    </div>
  );
}

