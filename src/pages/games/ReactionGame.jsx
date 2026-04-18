import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useGame } from '@/lib/gameContext.jsx';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useNavigate } from 'react-router-dom';

const TOTAL_ROUNDS = 5;

export default function ReactionGame() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('ready'); // ready, waiting, GO, result, finished
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [reactionTime, setReactionTime] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [bestTimes, setBestTimes] = useState({ p1: [], p2: [] });
  const startRef = useRef(null);
  const timerRef = useRef(null);
  const [bgColor, setBgColor] = useState('bg-muted');

  const startWaiting = () => {
    setPhase('waiting');
    setBgColor('bg-red-500');
    setReactionTime(null);
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setPhase('GO');
      setBgColor('bg-green-500');
    }, delay);
  };

  const handleTap = () => {
    if (phase === 'waiting') {
      clearTimeout(timerRef.current);
      setPhase('toosoon');
      setBgColor('bg-muted');
      return;
    }
    if (phase === 'GO') {
      const elapsed = Date.now() - startRef.current;
      setReactionTime(elapsed);
      const key = currentPlayer === 1 ? 'p1' : 'p2';
      setBestTimes(prev => ({ ...prev, [key]: [...prev[key], elapsed] }));
      setPhase('result');
      setBgColor('bg-muted');
    }
  };

  const nextRound = () => {
    const nextRoundNum = round + 1;
    if (nextRoundNum > TOTAL_ROUNDS * 2) {
      const avgP1 = bestTimes.p1.reduce((a, b) => a + b, 0) / bestTimes.p1.length;
      const avgP2 = bestTimes.p2.reduce((a, b) => a + b, 0) / bestTimes.p2.length;
      if (avgP1 < avgP2) {
        const newScores = { p1: scores.p1 + 1, p2: scores.p2 };
        setScores(newScores);
        recordWin('reaction');
        setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
      } else {
        const newScores = { p1: scores.p1, p2: scores.p2 + 1 };
        setScores(newScores);
        recordLoss('reaction');
        setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
      }
      setPhase('finished');
      setShowWinner(true);
      return;
    }
    setRound(nextRoundNum);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setPhase('ready');
    setReactionTime(null);
  };

  const resetGame = () => {
    setPhase('ready');
    setCurrentPlayer(1);
    setScores({ p1: 0, p2: 0 });
    setRound(1);
    setReactionTime(null);
    setBestTimes({ p1: [], p2: [] });
    setShowWinner(false);
    setBgColor('bg-muted');
  };

  const playerName = `Jugador ${currentPlayer}`;
  const avgP1 = bestTimes.p1.length ? Math.round(bestTimes.p1.reduce((a, b) => a + b, 0) / bestTimes.p1.length) : null;
  const avgP2 = bestTimes.p2.length ? Math.round(bestTimes.p2.reduce((a, b) => a + b, 0) / bestTimes.p2.length) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Test de Reacción" subtitle={`Ronda ${Math.ceil(round / 2)}/${TOTAL_ROUNDS}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">J1</p>
            <p className="font-display font-bold text-primary">{avgP1 ? `${avgP1}ms` : '-'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">J2</p>
            <p className="font-display font-bold text-secondary">{avgP2 ? `${avgP2}ms` : '-'}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
              <p className="text-muted-foreground text-sm text-center">Turno de <span className="font-bold text-foreground">{playerName}</span></p>
              <p className="text-muted-foreground text-sm text-center">Cuando el fondo se ponga <span className="text-green-500 font-bold">verde</span>, ¡toca la pantalla!</p>
              <Button onClick={startWaiting} className="h-16 px-10 rounded-2xl text-lg font-display">¡Empezar!</Button>
            </motion.div>
          )}

          {(phase === 'waiting' || phase === 'GO') && (
            <motion.button
              key="tap"
              onClick={handleTap}
              className={`w-64 h-64 rounded-full flex items-center justify-center text-white font-display font-bold text-4xl transition-colors active:scale-95 ${phase === 'waiting' ? 'bg-red-500' : 'bg-green-500'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {phase === 'waiting' ? '⏳' : '¡AHORA!'}
            </motion.button>
          )}

          {phase === 'toosoon' && (
            <motion.div key="toosoon" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
              <div className="text-6xl">⚡</div>
              <p className="font-display text-xl font-bold text-destructive text-center">¡Demasiado pronto!</p>
              <p className="text-muted-foreground text-center">Espera a que el fondo se ponga verde</p>
              <Button onClick={() => setPhase('ready')} variant="outline" className="rounded-xl">Reintentar</Button>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
              <div className="text-6xl">⚡</div>
              <p className="font-display text-xl font-bold text-center">{playerName}</p>
              <p className="font-display text-5xl font-bold text-primary">{reactionTime}ms</p>
              <p className="text-muted-foreground text-sm text-center">
                {reactionTime < 200 ? '🚀 ¡Reacción ultrarrápida!' : reactionTime < 300 ? '⚡ ¡Muy bien!' : reactionTime < 500 ? '👍 Bien' : '🐌 Un poco lento...'}
              </p>
              <Button onClick={nextRound} className="rounded-xl px-8">
                {round >= TOTAL_ROUNDS * 2 ? 'Ver resultado' : 'Siguiente →'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={avgP1 && avgP2 ? (avgP1 < avgP2 ? 'Jugador 1' : 'Jugador 2') : ''}
        isDraw={avgP1 === avgP2}
        onPlayAgain={resetGame}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}