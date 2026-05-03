import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_ERRORS = 6;

const CATEGORIES = {
  '🐾 Animales': ['elefante','cocodrilo','mariposa','pingüino','dinosaurio','tiburón','murciélago','flamenco','camaleón','avestruz'],
  '🌍 Países': ['australia','argentina','portugal','tailandia','marruecos','filipinas','indonesia','zimbabue','kazajistán','dinamarca'],
  '🎬 Películas': ['encanto','titanic','avatar','interstellar','inception','parasite','coco','ratatouille','gladiator','braveheart'],
  '🍕 Comidas': ['pizza','paella','hamburguesa','sashimi','gazpacho','lasaña','guacamole','empanada','croissant','enchiladas'],
};

function HangmanSVG({ errors }) {
  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="110" x2="110" y2="110" stroke="currentColor" strokeWidth="3" />
      <line x1="30" y1="110" x2="30" y2="10" stroke="currentColor" strokeWidth="3" />
      <line x1="30" y1="10" x2="75" y2="10" stroke="currentColor" strokeWidth="3" />
      <line x1="75" y1="10" x2="75" y2="25" stroke="currentColor" strokeWidth="3" />
      {errors >= 1 && <circle cx="75" cy="33" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />}
      {errors >= 2 && <line x1="75" y1="41" x2="75" y2="70" stroke="currentColor" strokeWidth="2.5" />}
      {errors >= 3 && <line x1="75" y1="50" x2="55" y2="62" stroke="currentColor" strokeWidth="2.5" />}
      {errors >= 4 && <line x1="75" y1="50" x2="95" y2="62" stroke="currentColor" strokeWidth="2.5" />}
      {errors >= 5 && <line x1="75" y1="70" x2="60" y2="88" stroke="currentColor" strokeWidth="2.5" />}
      {errors >= 6 && <line x1="75" y1="70" x2="90" y2="88" stroke="currentColor" strokeWidth="2.5" />}
    </svg>
  );
}

export default function HangmanDuo() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, enter, play, won, lost
  const [word, setWord] = useState('');
  const [input, setInput] = useState('');
  const [guessed, setGuessed] = useState([]);
  const [errors, setErrors] = useState(0);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [guesser, setGuesser] = useState(2);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const ROUNDS = 4;

  const startRound = (w) => {
    setWord(w.toLowerCase());
    setGuessed([]);
    setErrors(0);
    setPhase('play');
  };

  const pickRandom = () => {
    const cats = Object.values(CATEGORIES);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const w = cat[Math.floor(Math.random() * cat.length)];
    startRound(w);
  };

  const guess = (letter) => {
    if (guessed.includes(letter)) return;
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);
    if (!word.includes(letter)) {
      const newErrors = errors + 1;
      setErrors(newErrors);
      if (newErrors >= MAX_ERRORS) {
        endRound(false);
        return;
      }
    }
    const won = word.split('').every(c => c === ' ' || newGuessed.includes(c));
    if (won) endRound(true);
  };

  const endRound = (won) => {
    const newScores = { ...scores };
    if (won) { newScores[`p${guesser === 2 ? 2 : 1}`] += 1; }
    setScores(newScores);
    if (round >= ROUNDS) {
      setPhase('finished');
      setTimeout(() => {
        if (newScores.p1 > newScores.p2) { recordWin('hangman'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
        else if (newScores.p2 > newScores.p1) { recordLoss('hangman'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
        setShowWinner(true);
      }, 500);
    } else {
      setPhase(won ? 'won' : 'lost');
    }
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setGuesser(g => g === 2 ? 1 : 2);
    setPhase('setup');
    setSelectedCat(null);
    setInput('');
  };

  const displayWord = word.split('').map(c => (c === ' ' ? ' ' : guessed.includes(c) ? c : '_')).join(' ');

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Ahorcado" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
              <p className="text-muted-foreground text-sm text-center">
                <span className={guesser === 2 ? 'text-primary font-bold' : 'text-secondary font-bold'}>Jugador {guesser === 2 ? 1 : 2}</span> elige una palabra
              </p>
              <input
                className="w-full max-w-xs p-4 rounded-2xl border-2 border-border bg-card text-center font-display text-xl focus:border-primary outline-none uppercase tracking-widest"
                placeholder="Escribe la palabra…"
                value={input}
                onChange={e => setInput(e.target.value.replace(/[^a-záéíóúüñ ]/gi, ''))}
                maxLength={16}
                autoCorrect="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">El otro jugador no debe mirar</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={pickRandom} className="rounded-xl">Aleatoria 🎲</Button>
                <Button disabled={input.trim().length < 2} onClick={() => startRound(input.trim())} className="rounded-xl px-6">Listo ✓</Button>
              </div>
            </motion.div>
          )}

          {phase === 'play' && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 w-full">
              <p className="text-sm text-muted-foreground">Adivina la palabra — <span className={`font-bold ${guesser === 2 ? 'text-secondary' : 'text-primary'}`}>Jugador {guesser}</span></p>
              <HangmanSVG errors={errors} />
              <p className="font-mono text-2xl font-bold tracking-[0.3em] mt-2">{displayWord}</p>
              <p className="text-xs text-destructive">{errors}/{MAX_ERRORS} errores</p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {ALPHABET.map(l => (
                  <button key={l} onClick={() => guess(l)} disabled={guessed.includes(l)}
                    className={`w-9 h-9 rounded-lg font-display font-bold text-sm transition-all active:scale-90 border ${guessed.includes(l) ? (word.includes(l) ? 'bg-green-400 text-white border-green-400' : 'bg-muted text-muted-foreground border-muted opacity-50') : 'bg-card border-border hover:bg-muted'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {(phase === 'won' || phase === 'lost') && (
            <motion.div key="roundend" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="text-6xl">{phase === 'won' ? '🎉' : '💀'}</div>
              <h2 className="font-display text-2xl font-bold">{phase === 'won' ? '¡Adivinado!' : 'Sin vidas'}</h2>
              <p className="text-muted-foreground">La palabra era: <span className="font-bold text-foreground">{word.toUpperCase()}</span></p>
              <Button onClick={nextRound} className="rounded-2xl px-8">Siguiente ronda →</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); setScores({ p1: 0, p2: 0 }); setRound(1); setGuesser(2); setPhase('setup'); setInput(''); setSelectedCat(null); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}