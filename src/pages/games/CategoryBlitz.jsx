import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Países de Europa', examples: ['España', 'Francia', 'Italia'] },
  { name: 'Marcas de coches', examples: ['Ferrari', 'Toyota', 'BMW'] },
  { name: 'Deportes olímpicos', examples: ['Natación', 'Esgrima', 'Judo'] },
  { name: 'Frutas tropicales', examples: ['Mango', 'Papaya', 'Lichi'] },
  { name: 'Instrumentos musicales', examples: ['Violín', 'Trompeta', 'Arpa'] },
  { name: 'Capitales del mundo', examples: ['Tokio', 'Ottawa', 'Lima'] },
  { name: 'Elementos químicos', examples: ['Oxígeno', 'Helio', 'Carbono'] },
  { name: 'Dibujos animados', examples: ['Bugs Bunny', 'Doraemon', 'Heidi'] },
  { name: 'Superhéroes Marvel', examples: ['Thor', 'Hulk', 'Hawkeye'] },
  { name: 'Tipos de queso', examples: ['Brie', 'Gouda', 'Manchego'] },
  { name: 'Constelaciones', examples: ['Orión', 'Osa Mayor', 'Casiopea'] },
  { name: 'Tipos de pasta', examples: ['Lasaña', 'Tagliatelle', 'Fusilli'] },
];

const TIME = 30;

export default function CategoryBlitz() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [catIdx, setCatIdx] = useState(0);
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const ROUNDS = 6;

  const startRound = () => {
    let ci;
    do { ci = Math.floor(Math.random() * CATEGORIES.length); } while (ci === catIdx);
    setCatIdx(ci);
    setAnswers([]);
    setInput('');
    setTimeLeft(TIME);
    setPhase('playing');
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setPhase('count'); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const addAnswer = () => {
    const val = input.trim();
    if (!val || answers.map(a => a.toLowerCase()).includes(val.toLowerCase())) { setInput(''); return; }
    setAnswers(prev => [...prev, val]);
    setInput('');
    inputRef.current?.focus();
  };

  const endRound = (count) => {
    const key = `p${player}`;
    setScores(prev => ({ ...prev, [key]: prev[key] + count }));
    if (round >= ROUNDS) {
      const newScores = { ...scores, [key]: scores[key] + count };
      if (newScores.p1 > newScores.p2) { recordWin('categoryblitz'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (newScores.p2 > newScores.p1) { recordLoss('categoryblitz'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      setPhase('finished');
      setShowWinner(true);
      return;
    }
    setRound(r => r + 1);
    setPlayer(p => p === 1 ? 2 : 1);
    setPhase('setup');
  };

  const cat = CATEGORIES[catIdx];

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Ráfaga de Categorías" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-6xl">⚡</div>
              <h2 className="font-display text-xl font-bold text-center">Ráfaga de Categorías</h2>
              <p className="text-muted-foreground text-sm text-center">Di el máximo de palabras de la categoría en {TIME}s</p>
              <p className="text-sm text-center">Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span></p>
              <Button onClick={startRound} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between">
                <div className="bg-card border border-border rounded-xl px-3 py-2">
                  <p className="font-display font-bold">{cat.name}</p>
                </div>
                <span className={`font-display text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / TIME) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
              <div className="bg-muted rounded-xl p-3 min-h-[80px] flex flex-wrap gap-2 content-start">
                {answers.map((a, i) => <span key={i} className="bg-primary/20 text-primary rounded-lg px-2 py-1 text-sm font-medium">{a}</span>)}
                {answers.length === 0 && <p className="text-muted-foreground text-sm">Escribe y pulsa Enter…</p>}
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 p-4 rounded-2xl border-2 border-border bg-card font-display text-lg focus:border-primary outline-none"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAnswer()}
                  placeholder="Escribe aquí…"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Button onClick={addAnswer} className="rounded-2xl px-4 font-display">+</Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">Total: {answers.length}</p>
            </motion.div>
          )}

          {phase === 'count' && (
            <motion.div key="count" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
              <p className="font-display text-xl font-bold text-center">Categoría: <span className="text-primary">{cat.name}</span></p>
              <p className="text-muted-foreground text-sm text-center">Respuestas de Jugador {player}:</p>
              <div className="w-full bg-muted rounded-2xl p-4 flex flex-wrap gap-2">
                {answers.map((a, i) => <span key={i} className="bg-card border border-border rounded-lg px-2 py-1 text-sm">{a}</span>)}
                {answers.length === 0 && <p className="text-muted-foreground text-sm">Ninguna respuesta</p>}
              </div>
              <p className="font-display text-lg">¿Cuántas son válidas?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: answers.length + 1 }, (_, i) => (
                  <button key={i} onClick={() => endRound(i)}
                    className="w-12 h-12 rounded-xl border-2 border-border bg-card font-display font-bold text-lg hover:bg-muted active:scale-90 transition-all">
                    {i}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setScores({ p1: 0, p2: 0 }); setRound(1); setPlayer(1); setPhase('setup'); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}