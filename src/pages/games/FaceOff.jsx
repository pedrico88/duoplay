import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Simultaneous buzzer - both players see the question, first to buzz answers
const QUESTIONS = [
  { q: '¿Capital de Australia?', a: 'Canberra' },
  { q: '¿Cuántos lados tiene un hexágono?', a: '6' },
  { q: '¿En qué año llegó el hombre a la luna?', a: '1969' },
  { q: '¿Cuál es el animal terrestre más rápido?', a: 'Guepardo' },
  { q: '¿Cuántos planetas tiene el sistema solar?', a: '8' },
  { q: '¿Qué país tiene más habitantes?', a: 'India' },
  { q: '¿Autor de Don Quijote?', a: 'Cervantes' },
  { q: '¿Cuántos cromosomas tiene el ser humano?', a: '46' },
  { q: '¿Cuál es el río más largo del mundo?', a: 'Nilo' },
  { q: '¿Cuántos colores tiene el arcoíris?', a: '7' },
  { q: '¿Qué gas respiran las plantas?', a: 'CO2' },
  { q: '¿A qué temperatura hierve el agua?', a: '100°C' },
  { q: '¿Cuál es el metal más caro?', a: 'Rodio' },
  { q: '¿Cuántas cuerdas tiene una guitarra clásica?', a: '6' },
  { q: '¿Qué instrumento toca Beethoven?', a: 'Piano' },
  { q: '¿Cuál es el océano más grande?', a: 'Pacífico' },
  { q: '¿En qué continente está Egipto?', a: 'África' },
  { q: '¿Cuántos huesos tiene el cuerpo humano adulto?', a: '206' },
  { q: '¿Cuál es el idioma más hablado del mundo?', a: 'Inglés' },
  { q: '¿Qué planeta es el más cercano al sol?', a: 'Mercurio' },
];

const ROUNDS = 10;
const ANSWER_TIME = 8;

export default function FaceOff() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [qIdx, setQIdx] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [buzzed, setBuzzed] = useState(null); // null | 1 | 2
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null); // null | correct | wrong
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const [answerTime, setAnswerTime] = useState(ANSWER_TIME);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const startGame = () => {
    const qs = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffled(qs);
    setQIdx(0); setScores({ p1: 0, p2: 0 }); setRound(1);
    setPhase('playing'); setBuzzed(null); setResult(null); setAnswer('');
  };

  const buzz = (player) => {
    if (buzzed !== null) return;
    setBuzzed(player);
    setAnswerTime(ANSWER_TIME);
    timerRef.current = setInterval(() => {
      setAnswerTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitAnswer(''); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitAnswer = (ans) => {
    clearInterval(timerRef.current);
    const q = shuffled[qIdx];
    const ok = (ans || answer).trim().toLowerCase().includes(q.a.toLowerCase()) ||
               q.a.toLowerCase().includes((ans || answer).trim().toLowerCase());
    setResult(ok ? 'correct' : 'wrong');
    if (ok) {
      const key = buzzed === 1 ? 'p1' : 'p2';
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const next = () => {
    if (round >= ROUNDS) {
      const s = scores;
      if (s.p1 > s.p2) { recordWin('faceoff'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (s.p2 > s.p1) { recordLoss('faceoff'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      setShowWinner(true);
      return;
    }
    setRound(r => r + 1);
    setQIdx(i => i + 1);
    setBuzzed(null); setResult(null); setAnswer('');
  };

  const q = shuffled[qIdx];

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Cara a Cara" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
              <div className="text-6xl">⚡</div>
              <h2 className="font-display text-2xl font-bold">Cara a Cara</h2>
              <p className="text-muted-foreground text-sm">Los dos ven la pregunta. ¡El primero en pulsar su botón contesta!</p>
              <Button onClick={startGame} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'playing' && q && (
            <motion.div key={round} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 w-full">
              <div className="bg-card rounded-3xl border-2 border-border p-6 text-center">
                <p className="font-display text-xl font-bold">{q.q}</p>
              </div>

              {buzzed === null ? (
                <div className="flex gap-3">
                  <button onClick={() => buzz(1)}
                    className="flex-1 h-20 rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold active:scale-95 transition-all shadow-lg">
                    🔵 J1
                  </button>
                  <button onClick={() => buzz(2)}
                    className="flex-1 h-20 rounded-2xl bg-secondary text-secondary-foreground font-display text-xl font-bold active:scale-95 transition-all shadow-lg">
                    🟢 J2
                  </button>
                </div>
              ) : result === null ? (
                <div className="flex flex-col gap-3">
                  <p className="text-center font-bold">
                    <span className={buzzed === 1 ? 'text-primary' : 'text-secondary'}>Jugador {buzzed}</span> tiene {answerTime}s para responder
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      className="flex-1 p-4 rounded-2xl border-2 border-border bg-card font-display text-lg focus:border-primary outline-none"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitAnswer(answer)}
                      placeholder="Responde…"
                    />
                    <Button onClick={() => submitAnswer(answer)} className="rounded-2xl px-4">✓</Button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
                  <div className="text-5xl">{result === 'correct' ? '✅' : '❌'}</div>
                  <p className="font-display text-xl font-bold">{result === 'correct' ? '¡Correcto!' : 'Incorrecto'}</p>
                  <p className="text-muted-foreground">Respuesta: <span className="font-bold text-foreground">{q.a}</span></p>
                  <Button onClick={next} className="rounded-2xl px-8">{round >= ROUNDS ? 'Ver resultado' : 'Siguiente →'}</Button>
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
        onPlayAgain={() => { setShowWinner(false); startGame(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}