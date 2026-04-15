import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Button } from '@/components/ui/button';
import ActionSheetSelect from '@/components/duoplay/ActionSheetSelect';

function generateProblem() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') {
    a = Math.floor(Math.random() * 50) + 1;
    b = Math.floor(Math.random() * 50) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * a);
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 12) + 2;
    answer = a * b;
  }
  // Generate wrong options
  const options = new Set([answer]);
  while (options.size < 4) {
    const wrong = answer + Math.floor(Math.random() * 20) - 10;
    if (wrong !== answer && wrong >= 0) options.add(wrong);
  }
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return { question: `${a} ${op} ${b}`, answer, options: shuffled };
}

export default function MathRace() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [problem, setProblem] = useState(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const timerRef = useRef(null);

  const startGame = (rounds) => {
    setTotalRounds(rounds);
    setRound(0);
    setScores({ p1: 0, p2: 0 });
    setCurrentPlayer(1);
    setProblem(generateProblem());
    setPhase('playing');
    setTimeLeft(10);
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
  }, [phase, round, answered]);

  const handleAnswer = (opt) => {
    clearInterval(timerRef.current);
    setAnswered(opt);
    if (opt === problem.answer) {
      const key = currentPlayer === 1 ? 'p1' : 'p2';
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const nextRound = () => {
    const newRound = round + 1;
    if (newRound >= totalRounds) {
      setPhase('finished');
      setShowWinner(true);
      if (scores.p1 > scores.p2) {
        recordWin('mathrace');
        setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
      } else if (scores.p2 > scores.p1) {
        recordLoss('mathrace');
        setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
      }
      return;
    }
    setRound(newRound);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setProblem(generateProblem());
    setAnswered(null);
    setTimeLeft(10);
  };

  const ROUNDS_OPTIONS = [
    { value: 10, label: '10 rondas', description: 'Partida rápida' },
    { value: 20, label: '20 rondas', description: 'Partida completa' },
    { value: 30, label: '30 rondas', description: 'Desafío largo' },
  ];

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col">
        <GameHeader emoji="🔢🏃" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <h2 className="font-display text-xl font-bold">Carrera Matemática</h2>
          <p className="text-sm text-muted-foreground">Resuelve más rápido que tu rival</p>

          <ActionSheetSelect
            value={totalRounds}
            onChange={(v) => setTotalRounds(v)}
            options={ROUNDS_OPTIONS}
            title="Número de rondas"
            trigger={
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-border bg-card hover:bg-muted/60 active:bg-muted transition-colors cursor-pointer">
                <span className="font-display font-bold text-lg">🔢 {totalRounds}</span>
                <span className="text-xs text-muted-foreground">
                  {ROUNDS_OPTIONS.find(o => o.value === totalRounds)?.description}
                </span>
                <span className="text-muted-foreground text-xs ml-1">▼</span>
              </div>
            }
          />

          <Button onClick={() => startGame(totalRounds)} className="h-14 px-10 rounded-2xl font-display text-lg">
            ¡Jugar!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🔢🏃"
        onReset={() => setPhase('setup')}
        player1Score={scores.p1}
        player2Score={scores.p2}
        player1Name="J1"
        player2Name="J2"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-sm mx-auto w-full">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">{round + 1}/{totalRounds}</span>
          <span className={`font-display text-lg font-bold ${timeLeft <= 3 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
          <span className={`text-sm font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>J{currentPlayer}</span>
        </div>

        {problem && (
          <motion.div
            key={round}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl border border-border p-8 w-full text-center"
          >
            <p className="font-display text-4xl font-bold mb-8">{problem.question} = ?</p>
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map((opt, i) => {
                let bg = 'bg-muted hover:bg-muted/70';
                if (answered !== null) {
                  if (opt === problem.answer) bg = 'bg-green-500 text-white';
                  else if (opt === answered) bg = 'bg-destructive text-white';
                  else bg = 'bg-muted opacity-50';
                }
                return (
                  <button
                    key={i}
                    disabled={answered !== null}
                    onClick={() => handleAnswer(opt)}
                    className={`p-4 rounded-xl text-xl font-bold transition-all active:scale-95 ${bg}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {answered !== null && (
          <Button onClick={nextRound} className="w-full rounded-xl">
            {round >= totalRounds - 1 ? 'Ver resultado' : 'Siguiente'}
          </Button>
        )}
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setPhase('setup'); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}