import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';
import { TRIVIA_QUESTIONS_HARD } from '@/lib/triviaQuestions';
import { TRIVIA_CIENCIA, TRIVIA_HISTORIA, TRIVIA_ENTRETENIMIENTO, TRIVIA_DEPORTE } from '@/lib/triviaData';

const TRIVIA_QUESTIONS = {
  ciencia: TRIVIA_CIENCIA,
  historia: TRIVIA_HISTORIA,
  entretenimiento: TRIVIA_ENTRETENIMIENTO,
  deporte: TRIVIA_DEPORTE,
};

const CATS = [
  { id: 'ciencia', name: 'Ciencia', emoji: '🔬' },
  { id: 'historia', name: 'Historia', emoji: '📜' },
  { id: 'entretenimiento', name: 'Entretenimiento', emoji: '🎬' },
  { id: 'deporte', name: 'Deporte', emoji: '⚽' },
];

export default function Trivia() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [difficulty, setDifficulty] = useState(null);
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [robUsed, setRobUsed] = useState({ p1: false, p2: false });
  const timerRef = useRef(null);

  const startGame = (catId) => {
    setCategory(catId);
    const pool = difficulty === 'hard' ? TRIVIA_QUESTIONS_HARD : TRIVIA_QUESTIONS;
    const allQs = catId === 'mixed'
      ? Object.values(pool).flat()
      : pool[catId] || [];
    const shuffled = [...allQs].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setQIndex(0);
    setScores({ p1: 0, p2: 0 });
    setCurrentPlayer(1);
    setPhase('playing');
    setTimeLeft(15);
    setRobUsed({ p1: false, p2: false });
  };

  useEffect(() => {
    if (phase !== 'playing' || answered !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setAnswered('timeout');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIndex, answered]);

  const handleAnswer = (opt) => {
    clearInterval(timerRef.current);
    const correct = opt === questions[qIndex].a;
    setAnswered(opt);
    if (correct) {
      const key = currentPlayer === 1 ? 'p1' : 'p2';
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const nextQuestion = () => {
    if (qIndex >= questions.length - 1) {
      setPhase('finished');
      setShowWinner(true);
      if (scores.p1 > scores.p2) {
        recordWin('trivia');
        setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
      } else if (scores.p2 > scores.p1) {
        recordLoss('trivia');
        setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
      }
      return;
    }
    setQIndex(q => q + 1);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setAnswered(null);
    setTimeLeft(15);
  };

  const handleRob = () => {
    const key = currentPlayer === 1 ? 'p1' : 'p2';
    if (robUsed[key]) return;
    setRobUsed(prev => ({ ...prev, [key]: true }));
    // Rob: same question but switch player
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setAnswered(null);
    setTimeLeft(15);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader emoji="🧠💡" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="font-display text-xl font-bold">Trivia</h2>

          {/* Difficulty selector */}
          {!difficulty ? (
            <>
              <p className="text-sm text-muted-foreground">Elige la dificultad</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <button
                  onClick={() => setDifficulty('normal')}
                  className="h-28 rounded-2xl border-2 border-border bg-card flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-3xl">😊</span>
                  <span className="font-display font-bold text-base">Normal</span>
                  <span className="text-xs text-muted-foreground text-center px-2">Preguntas accesibles</span>
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className="h-28 rounded-2xl border-2 border-destructive/50 bg-destructive/5 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-3xl">🔥</span>
                  <span className="font-display font-bold text-base text-destructive">Difícil</span>
                  <span className="text-xs text-muted-foreground text-center px-2">Preguntas avanzadas</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Dificultad:</span>
                <span className={`text-sm font-bold ${difficulty === 'hard' ? 'text-destructive' : 'text-primary'}`}>
                  {difficulty === 'hard' ? '🔥 Difícil' : '😊 Normal'}
                </span>
                <button onClick={() => setDifficulty(null)} className="text-xs text-muted-foreground underline ml-1">
                  cambiar
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Elige una categoría</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {CATS.map(cat => (
                  <Button key={cat.id} variant="outline" onClick={() => startGame(cat.id)}
                    className="h-20 rounded-2xl font-display flex flex-col gap-1">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-sm">{cat.name}</span>
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => startGame('mixed')} className="rounded-2xl px-8 font-display">
                🎲 Mixto
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🧠💡"
        onReset={() => setPhase('setup')}
        player1Score={scores.p1}
        player2Score={scores.p2}
        player1Name="J1"
        player2Name="J2"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg mx-auto w-full">
        {/* Progress & Timer */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">{qIndex + 1}/{questions.length}</span>
          <span className={`font-display text-lg font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : ''}`}>
            {timeLeft}s
          </span>
          <span className={`text-sm font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>
            Jugador {currentPlayer}
          </span>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 15) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        {q && (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl border border-border p-6 w-full"
          >
            <p className="font-display font-bold text-lg text-center mb-6">{q.q}</p>
            <div className="grid grid-cols-1 gap-3">
              {q.opts.map((opt, i) => {
                let bg = 'bg-muted hover:bg-muted/70';
                if (answered) {
                  if (opt === q.a) bg = 'bg-green-500 text-white';
                  else if (opt === answered) bg = 'bg-destructive text-white';
                  else bg = 'bg-muted opacity-50';
                }
                return (
                  <button
                    key={i}
                    disabled={answered !== null}
                    onClick={() => handleAnswer(opt)}
                    className={`p-4 rounded-xl text-left font-medium transition-all active:scale-[0.97] ${bg}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 w-full">
          {answered === null && !robUsed[currentPlayer === 1 ? 'p1' : 'p2'] && (
            <Button variant="outline" onClick={handleRob} className="flex-1 rounded-xl text-sm">
              🔄 Robar turno
            </Button>
          )}
          {answered !== null && (
            <Button onClick={nextQuestion} className="flex-1 rounded-xl">
              {qIndex >= questions.length - 1 ? 'Ver resultado' : 'Siguiente'}
            </Button>
          )}
        </div>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setPhase('setup'); setDifficulty(null); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}