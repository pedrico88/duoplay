import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Two players hold one side of the screen each. When GO appears, tap your side first.
const TOTAL_ROUNDS = 7;

export default function QuickDraw() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('ready'); // ready, countdown, GO, result, finished
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [roundWinner, setRoundWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [countNum, setCountNum] = useState(3);
  const timerRef = useRef(null);
  const goRef = useRef(false);

  const startCountdown = () => {
    setPhase('countdown');
    setCountNum(3);
    goRef.current = false;
    let count = 3;
    const tick = () => {
      count--;
      if (count > 0) {
        setCountNum(count);
        timerRef.current = setTimeout(tick, 700 + Math.random() * 400);
      } else {
        goRef.current = true;
        setPhase('GO');
        // auto-timeout after 3s
        timerRef.current = setTimeout(() => {
          if (goRef.current) {
            goRef.current = false;
            setPhase('ready');
          }
        }, 3000);
      }
    };
    timerRef.current = setTimeout(tick, 800 + Math.random() * 600);
  };

  const handleTap = (player) => {
    if (phase === 'countdown') {
      clearTimeout(timerRef.current);
      setRoundWinner(player === 1 ? 2 : 1); // wrong tap = other player wins
      const key = player === 1 ? 'p2' : 'p1';
      resolveRound(key, 'early');
      return;
    }
    if (phase === 'GO' && goRef.current) {
      clearTimeout(timerRef.current);
      goRef.current = false;
      setRoundWinner(player);
      const key = player === 1 ? 'p1' : 'p2';
      resolveRound(key, 'win');
    }
  };

  const resolveRound = (winKey, type) => {
    const newScores = { ...scores, [winKey]: scores[winKey] + 1 };
    setScores(newScores);
    setPhase('result');
    if (round >= TOTAL_ROUNDS) {
      setTimeout(() => {
        if (newScores.p1 > newScores.p2) { recordWin('quickdraw'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
        else if (newScores.p2 > newScores.p1) { recordLoss('quickdraw'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
        setShowWinner(true);
      }, 1000);
    }
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setRoundWinner(null);
    setPhase('ready');
  };

  const reset = () => { setScores({ p1: 0, p2: 0 }); setRound(1); setRoundWinner(null); setPhase('ready'); setShowWinner(false); };

  const bgColor = phase === 'countdown' ? 'bg-red-500' : phase === 'GO' ? 'bg-green-500' : 'bg-background';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-100 ${bgColor}`}>
      <NativeHeader title="Duelo de Reflejos" subtitle={`${round}/${TOTAL_ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col">
        {/* Player 2 side (rotated) */}
        <button
          onClick={() => handleTap(2)}
          className="flex-1 flex items-center justify-center select-none active:opacity-80"
          disabled={phase === 'ready' || phase === 'result'}
        >
          <div className="rotate-180 text-center pointer-events-none">
            {phase === 'GO' ? <p className="font-display text-6xl font-black text-white drop-shadow-lg">¡TOCA!</p>
              : phase === 'countdown' ? <p className="font-display text-8xl font-black text-white drop-shadow-lg">{countNum}</p>
              : phase === 'result' ? <p className={`font-display text-3xl font-bold ${roundWinner === 2 ? 'text-green-300' : 'text-red-300'}`}>{roundWinner === 2 ? '🏆 Ganaste' : '💀 Perdiste'}</p>
              : <p className="font-display text-2xl font-bold opacity-50">Jugador 2</p>}
          </div>
        </button>

        <div className="h-px bg-border" />

        {/* Center controls */}
        {phase === 'ready' && (
          <div className="py-4 flex justify-center">
            <Button onClick={startCountdown} className="rounded-2xl px-8 font-display">¡Duelo! ⚔️</Button>
          </div>
        )}
        {phase === 'result' && round < TOTAL_ROUNDS && (
          <div className="py-4 flex justify-center">
            <Button onClick={nextRound} className="rounded-2xl px-8 font-display">Siguiente →</Button>
          </div>
        )}

        {/* Player 1 side */}
        <button
          onClick={() => handleTap(1)}
          className="flex-1 flex items-center justify-center select-none active:opacity-80"
          disabled={phase === 'ready' || phase === 'result'}
        >
          <div className="text-center pointer-events-none">
            {phase === 'GO' ? <p className="font-display text-6xl font-black text-white drop-shadow-lg">¡TOCA!</p>
              : phase === 'countdown' ? <p className="font-display text-8xl font-black text-white drop-shadow-lg">{countNum}</p>
              : phase === 'result' ? <p className={`font-display text-3xl font-bold ${roundWinner === 1 ? 'text-green-300' : 'text-red-300'}`}>{roundWinner === 1 ? '🏆 Ganaste' : '💀 Perdiste'}</p>
              : <p className="font-display text-2xl font-bold opacity-50">Jugador 1</p>}
          </div>
        </button>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={reset}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}