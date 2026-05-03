import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const COLORS = [
  { name: 'Rojo', bg: 'bg-red-500', hex: '#ef4444' },
  { name: 'Azul', bg: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Verde', bg: 'bg-green-500', hex: '#22c55e' },
  { name: 'Amarillo', bg: 'bg-yellow-400', hex: '#facc15' },
  { name: 'Morado', bg: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Naranja', bg: 'bg-orange-500', hex: '#f97316' },
  { name: 'Rosa', bg: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Cian', bg: 'bg-cyan-500', hex: '#06b6d4' },
];

const ROUNDS = 10;

function makeQuestion() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const ink = COLORS[Math.floor(Math.random() * COLORS.length)];
  const correct = Math.random() < 0.5 ? 'word' : 'ink';
  return { word, ink, correct };
}

export default function ColorMatch() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3);
  const [showWinner, setShowWinner] = useState(false);
  const timerRef = useRef(null);

  const startRound = () => {
    const q = makeQuestion();
    setQuestion(q);
    setAnswered(false);
    setCorrect(null);
    setTimeLeft(3);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing' || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, answered, round]);

  const handleAnswer = (choice) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    const isCorrect = choice === question?.correct;
    setCorrect(isCorrect);
    if (isCorrect) {
      const key = currentPlayer === 1 ? 'p1' : 'p2';
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const nextRound = () => {
    if (round >= ROUNDS) {
      setPhase('finished');
      setShowWinner(true);
      if (scores.p1 > scores.p2) { recordWin('colormatch'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (scores.p2 > scores.p1) { recordLoss('colormatch'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      return;
    }
    setRound(r => r + 1);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    startRound();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Stroop Color" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
              <div className="text-6xl">🎨</div>
              <h2 className="font-display text-2xl font-bold">Stroop Color</h2>
              <p className="text-muted-foreground text-sm">Verás una palabra en un color. Elige si <strong>la palabra</strong> o el <strong>color de la tinta</strong> es el correcto, según la instrucción. ¡Rápido!</p>
              <Button onClick={() => { setRound(1); setScores({ p1: 0, p2: 0 }); setCurrentPlayer(1); startRound(); }} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'playing' && question && (
            <motion.div key={`q-${round}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 w-full">
              <p className="text-sm text-muted-foreground">Turno de <span className={`font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {currentPlayer}</span></p>
              <div className={`w-14 h-14 rounded-full border-4 ${timeLeft <= 1 ? 'border-destructive' : 'border-border'} flex items-center justify-center font-display text-2xl font-bold ${timeLeft <= 1 ? 'text-destructive animate-pulse' : ''}`}>
                {timeLeft}
              </div>
              <div className="bg-card rounded-3xl p-8 border-2 border-border w-full text-center">
                <p className="font-display text-5xl font-bold" style={{ color: question.ink.hex }}>{question.word.name}</p>
              </div>
              <p className="font-bold text-center">
                {question.correct === 'word' ? '¿Qué dice la palabra?' : '¿De qué color es la tinta?'}
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {COLORS.slice(0, 4).map(c => (
                  <button key={c.name} onClick={() => {
                    const isCorrect = question.correct === 'word' ? c.name === question.word.name : c.name === question.ink.name;
                    handleAnswer(isCorrect ? question.correct : 'wrong');
                  }}
                    className={`h-14 rounded-2xl font-display font-bold text-white transition-all active:scale-95 ${c.bg}`}
                  >{c.name}</button>
                ))}
                {COLORS.slice(4, 8).map(c => (
                  <button key={c.name} onClick={() => {
                    const isCorrect = question.correct === 'word' ? c.name === question.word.name : c.name === question.ink.name;
                    handleAnswer(isCorrect ? question.correct : 'wrong');
                  }}
                    className={`h-14 rounded-2xl font-display font-bold text-white transition-all active:scale-95 ${c.bg}`}
                  >{c.name}</button>
                ))}
              </div>

              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
                  <p className={`font-display text-2xl font-bold ${correct ? 'text-green-500' : 'text-destructive'}`}>{correct ? '¡Correcto! +1' : 'Incorrecto'}</p>
                  <Button onClick={nextRound} className="rounded-2xl px-8">{round >= ROUNDS ? 'Ver resultado' : 'Siguiente →'}</Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setRound(1); setScores({ p1: 0, p2: 0 }); setCurrentPlayer(1); startRound(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}