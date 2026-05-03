import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

// Like the TV show Countdown - make the longest word from letters
const VOWELS = 'AAEEIIOOUUU'.split('');
const CONSONANTS = 'BBCCDDDFFGGHJLLLLMMNNNPQRRRRSSSTTTTVWXYZ'.split('');
const TIME = 30;

function pickLetters(nVowels = 4, nCons = 5) {
  const letters = [];
  for (let i = 0; i < nVowels; i++) letters.push(VOWELS[Math.floor(Math.random() * VOWELS.length)]);
  for (let i = 0; i < nCons; i++) letters.push(CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]);
  return letters.sort(() => Math.random() - 0.5);
}

function canFormWord(word, letters) {
  const pool = [...letters];
  for (const c of word.toUpperCase()) {
    const idx = pool.indexOf(c);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}

export default function Countdown() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [letters, setLetters] = useState([]);
  const [p1Word, setP1Word] = useState('');
  const [p2Word, setP2Word] = useState('');
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState('p1'); // p1, p2, result
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const [p1Error, setP1Error] = useState('');
  const [p2Error, setP2Error] = useState('');
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const ROUNDS = 5;

  const startRound = () => {
    const l = pickLetters();
    setLetters(l);
    setP1Word(''); setP2Word('');
    setInput('');
    setP1Error(''); setP2Error('');
    setTimeLeft(TIME);
    setCurrentStep('p1');
    setPhase('playing');
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setCurrentStep('p2submit'); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitP1 = () => {
    clearInterval(timerRef.current);
    const word = input.trim().toUpperCase();
    if (word && !canFormWord(word, letters)) { setP1Error('No se puede formar con esas letras'); return; }
    setP1Word(word);
    setInput('');
    setP1Error('');
    setCurrentStep('p2');
    setTimeLeft(TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishRound(word, ''); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitP2 = () => {
    clearInterval(timerRef.current);
    const word = input.trim().toUpperCase();
    if (word && !canFormWord(word, letters)) { setP2Error('No se puede formar con esas letras'); return; }
    finishRound(p1Word, word);
  };

  const finishRound = (w1, w2) => {
    setP1Word(w1); setP2Word(w2);
    const newScores = { ...scores };
    if (w1.length > w2.length) newScores.p1++;
    else if (w2.length > w1.length) newScores.p2++;
    setScores(newScores);
    setCurrentStep('result');
    setPhase('result');
    if (round >= ROUNDS) {
      setTimeout(() => {
        if (newScores.p1 > newScores.p2) { recordWin('countdown'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
        else if (newScores.p2 > newScores.p1) { recordLoss('countdown'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
        setShowWinner(true);
      }, 1000);
    }
  };

  const nextRound = () => { setRound(r => r + 1); startRound(); };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Letras y Palabras" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-6xl">🔡</div>
              <h2 className="font-display text-2xl font-bold text-center">Letras y Palabras</h2>
              <p className="text-muted-foreground text-sm text-center">Forma la palabra más larga posible con las letras dadas. ¡{TIME}s por turno!</p>
              <Button onClick={startRound} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {(phase === 'playing') && (
            <motion.div key={`playing-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm">{currentStep === 'p1' ? '🔵 Jugador 1' : '🟢 Jugador 2'}</p>
                <span className={`font-display text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / TIME) * 100}%` }} />
              </div>
              <div className="flex flex-wrap gap-2 justify-center bg-muted rounded-2xl p-4">
                {letters.map((l, i) => (
                  <span key={i} className="w-10 h-10 bg-card rounded-lg border-2 border-border flex items-center justify-center font-display font-bold text-lg">{l}</span>
                ))}
              </div>
              <input
                ref={inputRef}
                className="w-full p-4 rounded-2xl border-2 border-border bg-card font-mono text-xl text-center uppercase tracking-widest focus:border-primary outline-none"
                value={input}
                onChange={e => { setInput(e.target.value.replace(/[^a-záéíóúüñ]/gi, '').toUpperCase()); setP1Error(''); setP2Error(''); }}
                onKeyDown={e => e.key === 'Enter' && (currentStep === 'p1' ? submitP1() : submitP2())}
                placeholder="Escribe tu palabra…"
                autoCorrect="off"
                spellCheck={false}
              />
              {(p1Error || p2Error) && <p className="text-destructive text-sm text-center">{p1Error || p2Error}</p>}
              <Button onClick={currentStep === 'p1' ? submitP1 : submitP2} className="rounded-2xl font-display text-lg">
                {currentStep === 'p1' ? 'Listo J1 →' : 'Listo J2 →'}
              </Button>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
              <p className="font-display text-xl font-bold">Ronda {round}</p>
              <div className="w-full space-y-3">
                {[{ n: 'J1', w: p1Word, color: 'text-primary' }, { n: 'J2', w: p2Word, color: 'text-secondary' }].map((p, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
                    <span className={`font-display font-bold ${p.color}`}>{p.n}</span>
                    <span className="font-mono font-bold text-xl">{p.w || '—'}</span>
                    <span className="text-muted-foreground">{p.w.length} letras</span>
                  </div>
                ))}
              </div>
              <p className="font-display font-bold text-lg">
                {p1Word.length > p2Word.length ? '🔵 J1 gana +1' : p2Word.length > p1Word.length ? '🟢 J2 gana +1' : '🤝 Empate'}
              </p>
              <Button onClick={round >= ROUNDS ? () => setShowWinner(true) : nextRound} className="rounded-2xl px-8">
                {round >= ROUNDS ? 'Ver resultado final' : 'Siguiente →'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setScores({ p1: 0, p2: 0 }); setRound(1); setPhase('setup'); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}