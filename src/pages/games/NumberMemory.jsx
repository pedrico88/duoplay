import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

function genNumber(digits) {
  let n = '';
  for (let i = 0; i < digits; i++) n += Math.floor(Math.random() * 10);
  return n;
}

export default function NumberMemory() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, show, input, result, finished
  const [digits, setDigits] = useState(3);
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [showTime, setShowTime] = useState(3);
  const [correct, setCorrect] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const ROUNDS = 6;

  const startRound = () => {
    const n = genNumber(digits);
    setNumber(n);
    setInput('');
    setCorrect(null);
    setShowTime(Math.max(2, Math.floor(digits * 0.8)));
    setPhase('show');
  };

  useEffect(() => {
    if (phase !== 'show') return;
    let t = Math.max(2, Math.floor(digits * 0.8));
    setShowTime(t);
    timerRef.current = setInterval(() => {
      t--;
      setShowTime(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        setPhase('input');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const submit = () => {
    const ok = input === number;
    setCorrect(ok);
    if (ok) {
      const key = `p${player}`;
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
    setPhase('result');
  };

  const next = () => {
    if (round >= ROUNDS) {
      setPhase('finished');
      if (scores.p1 > scores.p2) { recordWin('numbermemory'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (scores.p2 > scores.p1) { recordLoss('numbermemory'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      setShowWinner(true);
      return;
    }
    const nextDigits = round % 2 === 0 ? digits + 1 : digits;
    setDigits(nextDigits);
    setRound(r => r + 1);
    setPlayer(p => p === 1 ? 2 : 1);
    startRound();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Memoria Numérica" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
              <div className="text-6xl">🔢</div>
              <h2 className="font-display text-2xl font-bold text-center">Memoria Numérica</h2>
              <p className="text-muted-foreground text-sm text-center">Memoriza el número y repítelo. Los dígitos aumentan con cada nivel.</p>
              <Button onClick={startRound} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'show' && (
            <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full">
              <p className="text-sm text-muted-foreground text-center">
                <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span> — memoriza
              </p>
              <div className="bg-primary/10 rounded-3xl p-8 w-full text-center border-2 border-primary">
                <p className="font-mono text-4xl font-bold tracking-[0.2em]">{number}</p>
              </div>
              <p className="font-display text-3xl font-bold text-muted-foreground">{showTime}s</p>
            </motion.div>
          )}

          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full">
              <p className="text-sm text-muted-foreground text-center">Escribe el número que viste</p>
              <input
                ref={inputRef}
                type="tel"
                className="w-full p-4 rounded-2xl border-2 border-border bg-card font-mono text-3xl text-center tracking-[0.2em] focus:border-primary outline-none"
                value={input}
                onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && input.length > 0 && submit()}
                maxLength={digits}
                placeholder={'_'.repeat(digits)}
              />
              <Button disabled={input.length === 0} onClick={submit} className="rounded-2xl px-8 font-display text-lg">Confirmar</Button>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-6xl">{correct ? '🎉' : '😅'}</div>
              <p className={`font-display text-2xl font-bold ${correct ? 'text-green-500' : 'text-destructive'}`}>{correct ? '¡Correcto!' : 'Incorrecto'}</p>
              <p className="text-muted-foreground">Era: <span className="font-mono font-bold text-foreground text-xl tracking-widest">{number}</span></p>
              {!correct && <p className="text-muted-foreground">Escribiste: <span className="font-mono font-bold text-foreground">{input}</span></p>}
              <Button onClick={next} className="rounded-2xl px-8">{round >= ROUNDS ? 'Ver resultado' : 'Siguiente →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setDigits(3); setRound(1); setPlayer(1); setScores({ p1: 0, p2: 0 }); startRound(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}