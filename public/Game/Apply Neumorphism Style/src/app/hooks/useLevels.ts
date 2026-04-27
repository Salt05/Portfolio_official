import { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { LevelDef } from '../components/GameScreen';

const fullMatrix = () => Array(36).fill(true);
const emptyMatrix = () => Array(36).fill(false);

export const CAMPAIGN_LEVELS: LevelDef[] = [
  {
    id: 1, name: 'Getting Started', desc: 'Basic addition & subtraction', rows: 6, cols: 6,
    layers: [
      {
        equations: [
          { a: 1, op: '+', b: 7, c: 8 },
          { a: 2, op: '+', b: 4, c: 6 },
          { a: 9, op: '-', b: 5, c: 4 },
          { a: 5, op: '-', b: 2, c: 3 },
        ],
        spawnMatrix: fullMatrix()
      }
    ]
  },
  {
    id: 2, name: 'Multipliers', desc: 'Adds multiplication & Layer 1', rows: 6, cols: 6,
    layers: [
      {
        equations: [
          { a: 2, op: '×', b: 3, c: 6 },
          { a: 4, op: '+', b: 5, c: 9 },
          { a: 8, op: '-', b: 3, c: 5 },
          { a: 7, op: '-', b: 4, c: 3 },
          { a: 1, op: '+', b: 7, c: 8 },
        ],
        spawnMatrix: fullMatrix()
      },
      {
        equations: [{ a: 6, op: '-', b: 3, c: 3 }],
        spawnMatrix: emptyMatrix().map((_, i) => {
          const r = Math.floor(i / 6);
          const c = i % 6;
          return r >= 2 && r <= 3 && c >= 2 && c <= 3;
        })
      }
    ]
  }
];

export function useLevels() {
  const [levels, setLevels] = useState<LevelDef[]>(CAMPAIGN_LEVELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'levels'));
        if (querySnapshot.empty) {
          // Sync default levels to Firestore
          for (const level of CAMPAIGN_LEVELS) {
            await setDoc(doc(db, 'levels', String(level.id)), level);
          }
          setLevels(CAMPAIGN_LEVELS);
        } else {
          const dbLevels: LevelDef[] = [];
          querySnapshot.forEach((doc) => {
            dbLevels.push(doc.data() as LevelDef);
          });
          // Sort by id
          dbLevels.sort((a, b) => a.id - b.id);
          setLevels(dbLevels);
        }
      } catch (e) {
        console.error("Error fetching levels:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  const addLevel = async (level: LevelDef) => {
    try {
      await setDoc(doc(db, 'levels', String(level.id)), level);
      setLevels(prev => [...prev.filter(l => l.id !== level.id), level].sort((a, b) => a.id - b.id));
    } catch (e) {
      console.error("Error adding level:", e);
    }
  };

  const updateLevel = async (level: LevelDef) => {
    try {
      await setDoc(doc(db, 'levels', String(level.id)), level);
      setLevels(prev => prev.map(l => l.id === level.id ? level : l));
    } catch (e) {
      console.error("Error updating level:", e);
    }
  };

  const deleteLevel = async (id: number) => {
    try {
      await setDoc(doc(db, 'levels', String(id)), {}); // or use deleteDoc
      // Actually deleteDoc is better
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'levels', String(id)));
      setLevels(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error("Error deleting level:", e);
    }
  };

  return { levels, loading, addLevel, updateLevel, deleteLevel };
}
