import React from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useLevels } from '../hooks/useLevels';
import { 
  Map, 
  Calendar, 
  Infinity as InfinityIcon, 
  List, 
  ChevronRight, 
  Lock, 
  X,
  Coins,
  Trophy,
  Star,
  Binary,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const NEU = {
  bg: '#dde3ec',
  shadowDark: '#b8bfc8',
  shadowLight: '#ffffff',
  text: '#4a5568',
  textLight: '#8a9bb5',
  accent: '#7b8cde',
  gold: '#c9a650',
};

const neu = (pressed = false, strong = false) =>
  pressed
    ? `inset 5px 5px 10px ${NEU.shadowDark}, inset -5px -5px 10px ${NEU.shadowLight}`
    : strong
    ? `8px 8px 16px ${NEU.shadowDark}, -8px -8px 16px ${NEU.shadowLight}`
    : `5px 5px 10px ${NEU.shadowDark}, -5px -5px 10px ${NEU.shadowLight}`;

interface ModeSelectScreenProps {
  onSelectMode: (mode: 'campaign' | 'daily' | 'endless', levelIdx?: number) => void;
}

const MODES = [
  {
    id: 'campaign' as const,
    icon: <Map size={24} />,
    title: 'Campaign',
    subtitle: 'Campaign',
    desc: '100+ handcrafted levels',
    color: '#7b8cde',
    lightColor: '#eef0fc',
  },
  {
    id: 'daily' as const,
    icon: <Calendar size={24} />,
    title: 'Challenge',
    subtitle: 'Daily Challenge',
    desc: 'Daily • Same seed for everyone',
    color: '#6db88e',
    lightColor: '#eef8f2',
  },
  {
    id: 'endless' as const,
    icon: <InfinityIcon size={24} />,
    title: 'Endless',
    subtitle: 'Endless Mode',
    desc: 'Infinite • High Score',
    color: '#d4876e',
    lightColor: '#fdf1ed',
  },
];

export function ModeSelectScreen({ onSelectMode }: ModeSelectScreenProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [showLevels, setShowLevels] = React.useState(false);
  const { progress, loading: progressLoading, user, loginWithGoogle, logout } = useFirebase();
  const { levels, loading: levelsLoading } = useLevels();

  const loading = progressLoading || levelsLoading;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: NEU.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: 'relative'
      }}
    >
      {/* Auth Button (Top Left) */}
      <button 
        onClick={user ? logout : loginWithGoogle}
        style={{
          position: 'absolute', top: 20, left: 20,
          padding: '0 16px', height: 44, borderRadius: 14, border: 'none',
          background: NEU.bg, boxShadow: neu(), cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: user ? NEU.accent : NEU.textLight,
          gap: 10,
          transition: 'all 0.2s',
          fontSize: 14, fontWeight: 600
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = neu(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = neu();
        }}
        title={user ? 'Sign out' : 'Sign in with Google'}
      >
        {user ? (
          <>
            <img 
              src={user.photoURL || ''} 
              alt="avatar" 
              style={{ width: 24, height: 24, borderRadius: '50%', background: '#eee' }} 
            />
            <span style={{ color: NEU.text, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName?.split(' ')[0]}
            </span>
            <LogOut size={18} />
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Sign in</span>
          </>
        )}
      </button>

      

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            background: NEU.bg,
            boxShadow: neu(false, true),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: NEU.accent,
          }}
        >
          <Binary size={48} />
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            color: NEU.text,
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          Num<span style={{ color: NEU.accent }}>Strata</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6db88e', letterSpacing: '0.06em' }}>ALPHA</span>
        </h1>
        <p style={{ margin: '6px 0 0', color: NEU.textLight, fontSize: 14 }}>
          Mathematics × Strategy
        </p>
      </div>

      {/* Mode Cards */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MODES.map((mode) => {
          const isHovered = hoveredId === mode.id;
          return (
            <button
              key={mode.id}
              onMouseEnter={() => setHoveredId(mode.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectMode(mode.id)}
              style={{
                width: '100%',
                padding: '20px 24px',
                borderRadius: 20,
                border: 'none',
                background: NEU.bg,
                boxShadow: isHovered ? neu(true) : neu(false, false),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                transform: isHovered ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: mode.lightColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  flexShrink: 0,
                  boxShadow: `3px 3px 6px ${NEU.shadowDark}, -3px -3px 6px ${NEU.shadowLight}`,
                }}
              >
                {mode.icon}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: NEU.text }}>{mode.title}</span>
                  <span style={{ fontSize: 12, color: mode.color, fontWeight: 600 }}>{mode.subtitle}</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: NEU.textLight }}>
                  {mode.id === 'daily' ? dateStr : mode.desc}
                </p>
              </div>

              {mode.id === 'campaign' && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLevels(true);
                  }}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: NEU.bg, boxShadow: neu(false, true),
                    color: NEU.accent,
                    marginRight: 10,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.color = NEU.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.color = NEU.accent;
                  }}
                  title="Choose level"
                >
                  <List size={22} />
                </div>
              )}

              <div style={{ color: NEU.textLight }}>
                <ChevronRight size={20} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Level Selection Popup */}
      {showLevels && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(200,210,225,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%', maxWidth: 400,
            background: NEU.bg,
            borderRadius: 32,
            boxShadow: `20px 20px 60px ${NEU.shadowDark}, -20px -20px 60px ${NEU.shadowLight}`,
            padding: 24,
            position: 'relative'
          }}>
            <button
              onClick={() => setShowLevels(false)}
              style={{
                position: 'absolute', top: 20, right: 20,
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: NEU.bg,
                boxShadow: neu(false, false),
                cursor: 'pointer', color: NEU.textLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{ margin: '0 0 20px', color: NEU.text, textAlign: 'center' }}>Choose Level</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px 16px',
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '10px 8px',
              scrollbarWidth: 'thin',
              scrollbarColor: `${NEU.accent}66 transparent`,
            }}>
              {Array.from({ length: 50 }).map((_, idx) => {
                const levelNumber = idx + 1;
                const actualLevel = levels[idx];
                const isLocked = idx > (progress?.maxLevel ?? 0) || !actualLevel;
                
                return (
                  <button
                    key={idx}
                    disabled={isLocked}
                    onClick={() => {
                      if (actualLevel) {
                        onSelectMode('campaign', idx);
                        setShowLevels(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      borderRadius: 18,
                      border: 'none',
                      background: NEU.bg,
                      boxShadow: isLocked ? neu(true, false) : neu(false, false),
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700,
                      color: isLocked ? NEU.textLight + '66' : NEU.text,
                      opacity: isLocked ? 0.7 : 1,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLocked) e.currentTarget.style.boxShadow = neu(true, false);
                    }}
                    onMouseLeave={(e) => {
                      if (!isLocked) e.currentTarget.style.boxShadow = neu(false, false);
                    }}
                  >
                    <span style={{ 
                      opacity: isLocked ? 0.4 : 1,
                      transition: 'opacity 0.2s'
                    }}>
                      {levelNumber}
                    </span>
                    {isLocked && (
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        color: NEU.textLight,
                        opacity: 0.8
                      }}>
                        <Lock size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: NEU.textLight }}>
              Complete levels to unlock new ones!
            </div>
          </div>
        </div>
      )}

      {/* Stat chips */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 32,
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        {[
          { label: 'Gold', value: progress?.gold ?? 0, color: NEU.gold, icon: <Coins size={14} /> },
          { label: 'Campaign Lv.', value: (progress?.maxLevel ?? 0) + 1, color: NEU.accent, icon: <Star size={14} /> },
          { label: 'Endless Best', value: progress?.highScoreEndless ?? 0, color: '#d4876e', icon: <Trophy size={14} /> },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: '10px 16px',
              borderRadius: 14,
              background: NEU.bg,
              boxShadow: neu(true),
              textAlign: 'center',
              minWidth: 80,
              position: 'relative'
            }}
          >
            {loading ? (
              <div style={{
                height: 24, width: 40, background: 'rgba(0,0,0,0.05)',
                borderRadius: 4, margin: '0 auto', animation: 'pulse 1.5s infinite'
              }} />
            ) : (
              <div style={{ 
                fontSize: 18, fontWeight: 700, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
              }}>
                <span style={{ opacity: 0.8 }}>{s.icon}</span>
                {s.value}
              </div>
            )}
            <div style={{ fontSize: 11, color: NEU.textLight, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
    </div>
  );
}
