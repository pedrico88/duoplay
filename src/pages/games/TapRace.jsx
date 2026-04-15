import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';
import ActionSheetSelect from '@/components/duoplay/ActionSheetSelect';

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🫐', '🥝', '🍑', '🥭'];

export default function TapRace() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, playing, finished
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [targets, setTargets] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const idCounter = useRef(0);

  const spawnTarget = useCallback(() => {
    const player = Math.random() > 0.5 ? 'p1' : 'p2';
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const x = player === 'p1'
      ? Math.random() * 40 + 5  // left half
      : Math.random() * 40 + 55; // right half
    const y = Math.random() * 60 + 15;
    idCounter.current++;
    setTargets(prev => [...prev.slice(-12), { id: idCounter.current, player, emoji, x, y, born: Date.now() }]);
  }, []);

  const startGame = (dur) => {
    setDuration(dur);
    setTimeLeft(dur);
    setScores({ p1: 0, p2: 0 });
    setTargets([]);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPhase('finished');
          clearInterval(timerRef.current);
          clearInterval(spawnRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    spawnRef.current = setInterval(spawnTarget, 600);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    };
  }, [phase, spawnTarget]);

  useEffect(() => {
    if (phase === 'finished') {
      setTimeout(() => {
        setShowWinner(true);
        if (scores.p1 > scores.p2) {
          recordWin('taprace');
          setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
        } else if (scores.p2 > scores.p1) {
          recordLoss('taprace');
          setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
        }
      }, 300);
    }
  }, [phase]);

  const handleTap = (target) => {
    setTargets(prev => prev.filter(t => t.id !== target.id));
    setScores(prev => ({ ...prev, [target.player]: prev[target.player] + 1 }));
  };

  // Remove old targets
  useEffect(() => {
    if (phase !== 'playing') return;
    const cleanup = setInterval(() => {
      setTargets(prev => prev.filter(t => Date.now() - t.born < 2500));
    }, 500);
    return () => clearInterval(cleanup);
  }, [phase]);

  const DURATION_OPTIONS = [
    { value: 30, label: '30 segundos', description: 'Rápido e intenso' },
    { value: 60, label: '60 segundos', description: 'Ritmo normal' },
    { value: 90, label: '90 segundos', description: 'Partida larga' },
  ];

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader emoji="👆⚡" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="font-display text-xl font-bold">Puntería</h2>
          <p className="text-sm text-muted-foreground text-center">Toca las frutas de tu lado lo más rápido posible</p>

          <ActionSheetSelect
            value={duration}
            onChange={(v) => setDuration(v)}
            options={DURATION_OPTIONS}
            title="Duración de la partida"
            trigger={
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-border bg-card hover:bg-muted/60 active:bg-muted transition-colors cursor-pointer">
                <span className="font-display font-bold text-lg">⏱ {duration}s</span>
                <span className="text-xs text-muted-foreground">
                  {DURATION_OPTIONS.find(o => o.value === duration)?.description}
                </span>
                <span className="text-muted-foreground text-xs ml-1">▼</span>
              </div>
            }
          />

          <Button onClick={() => startGame(duration)} className="h-14 px-10 rounded-2xl font-display text-lg">
            ¡Jugar!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="👆⚡"
        player1Score={scores.p1}
        player2Score={scores.p2}
        player1Name="Izq"
        player2Name="Der"
      />

      {/* Timer */}
      <div className="text-center py-2">
        <span className={`font-display text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : ''}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Game area */}
      <div className="flex-1 relative overflow-hidden" style={{ touchAction: 'manipulation' }}>
        {/* Divider */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-border opacity-50" />
        
        {/* Labels */}
        <div className="absolute top-2 left-4 text-xs font-bold text-primary opacity-50">J1</div>
        <div className="absolute top-2 right-4 text-xs font-bold text-secondary opacity-50">J2</div>

        {/* Targets */}
        <AnimatePresence>
          {targets.map(target => (
            <motion.button
              key={target.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileTap={{ scale: 0.5 }}
              onClick={() => handleTap(target)}
              className="absolute text-3xl"
              style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`p-2 rounded-full ${target.player === 'p1' ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-secondary/10 ring-2 ring-secondary/30'}`}>
                {target.emoji}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); startGame(duration); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}