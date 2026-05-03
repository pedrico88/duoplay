import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Two players each hold one finger on the screen simultaneously.
// A chopper goes across the screen. Don't get chopped!
// Simulated as a timed hold challenge - who holds longer without lifting.

export default function FingerChop() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [holding, setHolding] = useState({ p1: false, p2: false });
  const [released, setReleased] = useState(null); // who released first
  const [chopTime] = useState(() => 2000 + Math.random() * 4000);
  const [showWinner, setShowWinner] = useState(false);
  const [started, setStarted] = useState(false);
  const chopRef = useRef(null);
  const holdStartRef = useRef(null);
  const ROUNDS = 5;

  const startRound = () => {
    setHolding({ p1: false, p2: false });
    setReleased(null);
    setStarted(false);
    setPhase('hold');
  };

  const onPressStart = (player) => {
    const key = player === 1 ? 'p1' : 'p2';
    const newHolding = { ...holding, [key]: true };
    setHolding(newHolding);

    if (newHolding.p1 && newHolding.p2 && !started) {
      setStarted(true);
      holdStartRef.current = Date.now();
      // schedule random chop
      const delay = 2000 + Math.random() * 4000;
      chopRef.current = setTimeout(() => {
        // Both still holding = both survive this round, redraw
        setPhase('chop');
        setTimeout(() => endRound(null), 800);
      }, delay);
    }
  };

  const onPressEnd = (player) => {
    if (!started) return;
    clearTimeout(chopRef.current);
    setReleased(player);
    const loser = player;
    const winner = loser === 1 ? 2 : 1;
    const key = winner === 1 ? 'p1' : 'p2';
    const newScores = { ...scores, [key]: scores[key] + 1 };
    setScores(newScores);
    setPhase('chopped');
    if (round >= ROUNDS) {
      setTimeout(() => {
        if (newScores.p1 > newScores.p2) { recordWin('fingerchop'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
        else { recordLoss('fingerchop'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
        setShowWinner(true);
      }, 1000);
    }
  };

  const endRound = (nobody) => {
    setPhase('survived');
  };

  const next = () => {
    setRound(r => r + 1);
    startRound();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="No Levantes el Dedo" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
              <div className="text-7xl">☝️✌️</div>
              <h2 className="font-display text-2xl font-bold">No Levantes el Dedo</h2>
              <p className="text-muted-foreground text-sm">Ambos ponen el dedo en su botón al mismo tiempo. En cualquier momento aparecerá un hacha. ¡El que levante primero pierde!</p>
              <Button onClick={startRound} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'hold' && (
            <motion.div key="hold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full">
              {!started && (
                <p className="text-muted-foreground text-center text-sm">Los dos deben poner el dedo en su botón para empezar</p>
              )}
              {started && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <p className="font-display text-2xl font-bold text-destructive animate-pulse">¡NO LEVANTES!</p>
                </motion.div>
              )}
              <div className="flex gap-6">
                <button
                  onTouchStart={() => onPressStart(1)}
                  onMouseDown={() => onPressStart(1)}
                  onTouchEnd={() => onPressEnd(1)}
                  onMouseUp={() => onPressEnd(1)}
                  className={`w-32 h-32 rounded-full font-display text-xl font-bold text-white transition-all select-none ${holding.p1 ? 'bg-primary scale-95 shadow-inner' : 'bg-primary/50 shadow-lg'}`}
                >
                  {holding.p1 ? '✋' : 'J1'}
                </button>
                <button
                  onTouchStart={() => onPressStart(2)}
                  onMouseDown={() => onPressStart(2)}
                  onTouchEnd={() => onPressEnd(2)}
                  onMouseUp={() => onPressEnd(2)}
                  className={`w-32 h-32 rounded-full font-display text-xl font-bold text-white transition-all select-none ${holding.p2 ? 'bg-secondary scale-95 shadow-inner' : 'bg-secondary/50 shadow-lg'}`}
                >
                  {holding.p2 ? '✋' : 'J2'}
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'chopped' && (
            <motion.div key="chopped" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-7xl">🪓</div>
              <p className="font-display text-3xl font-bold text-destructive">¡CORTADO!</p>
              <p className="text-muted-foreground">Jugador {released} levantó el dedo primero</p>
              {round < ROUNDS && <Button onClick={next} className="rounded-2xl px-8 mt-2">Siguiente →</Button>}
            </motion.div>
          )}

          {phase === 'survived' && (
            <motion.div key="survived" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-7xl">🎉</div>
              <p className="font-display text-2xl font-bold">¡Ambos sobrevivieron!</p>
              <p className="text-muted-foreground text-sm">Nadie obtuvo puntos esta ronda</p>
              {round < ROUNDS && <Button onClick={next} className="rounded-2xl px-8">Siguiente →</Button>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setScores({ p1: 0, p2: 0 }); setRound(1); startRound(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}