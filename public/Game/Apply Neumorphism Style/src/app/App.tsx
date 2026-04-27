import { useState } from 'react';
import { ModeSelectScreen } from './components/ModeSelectScreen';
import { GameScreen } from './components/GameScreen';
import { AdminScreen } from './components/AdminScreen';

type Screen = 'menu' | 'game' | 'admin';
type GameMode = 'campaign' | 'daily' | 'endless';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('campaign');
  const [startLevelIdx, setStartLevelIdx] = useState<number | undefined>(undefined);

  const handleSelectMode = (mode: GameMode, levelIdx?: number) => {
    setGameMode(mode);
    setStartLevelIdx(levelIdx);
    setScreen('game');
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#dde3ec' }}>
      {screen === 'menu' && (
        <ModeSelectScreen 
          onSelectMode={handleSelectMode}
        />
      )}
      {screen === 'game' && (
        <GameScreen mode={gameMode} initialLevelIdx={startLevelIdx} onBack={() => setScreen('menu')} />
      )}
      {screen === 'admin' && (
        <AdminScreen onBack={() => setScreen('menu')} />
      )}
    </div>
  );
}
