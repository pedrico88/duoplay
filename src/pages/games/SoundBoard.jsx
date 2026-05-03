import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Repeat the pattern of taps
const MAX_LENGTH = 8;
const ROUNDS = 6;
const BEAT_INTERVAL = 500;

export default function SoundBoard() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, showing, repeat, result, finished
  const [pattern, setPattern] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [activeIdx, setActiveIdx] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [patternLength, setPatternLength] = useState(3);
  const [correct, setCorrect] = useState(null);
  const timerRef = useRef(null);

  const COLORS = [
    { bg: 'bg-red-400', active: 'bg-red-200', name: 'rojo' },
    { bg: 'bg-blue-400', active: 'bg-blue-200', name: 'azul' },
    { bg: 'bg-green-400', active: 'bg-green-200', name: 'verde' },
    { bg: 'bg-yellow-400', active: 'bg-yellow-200', name: 'amarillo' },
  ];

  const generatePattern = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 4));

  const startRound = () => {
    const len = Math.min(3 + Math.floor((round - 1) / 2), MAX_LENGTH);
    setPatternLength(len);
    const p = generatePattern(len);
    setPattern(p);
    setPlayerInput([]);
    setCorrect(null);
    setPhase('showing');
    showPattern(p);
  };

  const showPattern = (p) => {
    let i = 0;
    const next = () => {
      if (i >= p.length) { setTimeout(() => setPhase('repeat'), 500); return; }
      setActiveIdx(p[i]);
      timerRef.current = setTimeout(() => {
        setActiveIdx(null);
        i++;
        timerRef.current = setTimeout(next, 200);
      }, BEAT_INTERVAL);
    };
    timerRef.current = setTimeout(next, 600);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleTap = (idx) => {
    if (phase !== 'repeat') return;
    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 150);
    const newInput = [...playerInput, idx];
    setPlayerInput(newInput);

    if (newInput[newInput.length - 1] !== pattern[newInput.length - 1]) {
      setCorrect(false);
      setPhase('result');
      return;
    }
    if (newInput.length === pattern.length) {
      setCorrect(true);
      const key = currentPlayer === 1 ? 'p1' : 'p2';
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
      setPhase('result');
    }
  };

  const next = () => {
    if (round >= ROUNDS) {
      if (scores.p1 > scores.p2) { recordWin('soundboard'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (scores.p2 > scores.p1) { recordLoss('soundboard'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      setShowWinner(true);
      return;
    }
    setRound(r => r + 1);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    startRound();
  };

  const grid = (disabled) => (
    <div className="grid grid-cols-2 gap-4">
      {COLORS.map((c, i) => (
        <motion.button
          key={i}
          onClick={() => handleTap(i)}
          disabled={disabled}
          whileTap={{ scale: 0.92 }}
          className={`h-28 rounded-3xl font-display text-white text-xl font-bold transition-colors shadow-md active:shadow-inner
            ${activeIdx === i ? c.active + ' scale-95' : c.bg} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {c.name}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Repite el Patrón" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-5 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
              <div className="text-6xl">🎵</div>
              <h2 className="font-display text-2xl font-bold text-center">Repite el Patrón</h2>
              <p className="text-muted-foreground text-sm text-center">Memoriza la secuencia de colores y repítela en el mismo orden. ¡Cada ronda es más larga!</p>
              <Button onClick={startRound} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'showing' && (
            <motion.div key="showing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <p className="text-sm text-muted-foreground text-center">
                <span className={`font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {currentPlayer}</span> — ¡Memoriza!
              </p>
              <p className="text-xs text-muted-foreground">{patternLength} pasos</p>
              {grid(true)}
            </motion.div>
          )}

          {phase === 'repeat' && (
            <motion.div key="repeat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <p className="font-display font-bold text-center text-primary">¡Repite la secuencia! ({playerInput.length}/{pattern.length})</p>
              {grid(false)}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-6xl">{correct ? '🎉' : '😅'}</div>
              <p className={`font-display text-2xl font-bold ${correct ? 'text-green-500' : 'text-destructive'}`}>{correct ? '¡Perfecto!' : 'Incorrecto'}</p>
              <Button onClick={next} className="rounded-2xl px-8">{round >= ROUNDS ? 'Ver resultado' : 'Siguiente →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setScores({ p1: 0, p2: 0 }); setRound(1); setCurrentPlayer(1); startRound(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}