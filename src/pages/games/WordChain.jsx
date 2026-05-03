import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const STARTERS = ['casa','perro','elefante','árbol','mar','ciudad','libro','música','sol','flor','agua','montaña','fuego','hielo','luz'];
const TIME_LIMIT = 8;

export default function WordChain() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [words, setWords] = useState([]);
  const [input, setInput] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('setup');
  const [lives, setLives] = useState({ p1: 3, p2: 3 });
  const [showWinner, setShowWinner] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const lastWord = words.length > 0 ? words[words.length - 1] : null;

  const startGame = () => {
    const starter = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    setWords([starter]);
    setCurrentPlayer(1);
    setLives({ p1: 3, p2: 3 });
    setTimeLeft(TIME_LIMIT);
    setInput('');
    setError('');
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, words]);

  const handleTimeout = () => {
    const key = currentPlayer === 1 ? 'p1' : 'p2';
    const newLives = { ...lives, [key]: lives[key] - 1 };
    setLives(newLives);
    if (newLives[key] <= 0) {
      endGame(currentPlayer === 1 ? 2 : 1);
      return;
    }
    setError(`⏰ ¡Tiempo! Jugador ${currentPlayer} pierde una vida`);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setTimeLeft(TIME_LIMIT);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submit = () => {
    const word = input.trim().toLowerCase();
    if (!word) return;
    setError('');
    const last = lastWord.toLowerCase();
    const lastChar = last[last.length - 1];
    if (word[0] !== lastChar) {
      setError(`❌ "${word}" debe empezar por "${lastChar.toUpperCase()}"`);
      return;
    }
    if (words.map(w => w.toLowerCase()).includes(word)) {
      setError(`❌ "${word}" ya fue usada`);
      return;
    }
    clearInterval(timerRef.current);
    setWords(prev => [...prev, word]);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setTimeLeft(TIME_LIMIT);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const endGame = (winner) => {
    setPhase('finished');
    const newScores = winner === 1 ? { p1: 1, p2: 0 } : { p1: 0, p2: 1 };
    setScores(newScores);
    if (winner === 1) { recordWin('wordchain'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
    else { recordLoss('wordchain'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
    setShowWinner(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Cadena de Palabras" backTo="/games" />

      <div className="flex-1 flex flex-col items-center p-4 gap-4 max-w-md mx-auto w-full">
        {phase === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-6xl">🔤</div>
            <h2 className="font-display text-2xl font-bold text-center">Cadena de Palabras</h2>
            <p className="text-muted-foreground text-sm text-center">Cada palabra debe empezar por la última letra de la anterior. ¡{TIME_LIMIT}s por turno! 3 vidas cada uno.</p>
            <Button onClick={startGame} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-1">{'❤️'.repeat(lives.p1)}{'🖤'.repeat(3 - lives.p1)}</div>
              <span className={`font-display text-lg font-bold ${timeLeft <= 3 ? 'text-destructive animate-pulse' : ''}`}>{timeLeft}s</span>
              <div className="flex gap-1">{'❤️'.repeat(lives.p2)}{'🖤'.repeat(3 - lives.p2)}</div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>

            <p className="text-sm text-center">
              Turno de <span className={`font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {currentPlayer}</span>
            </p>

            <div className="bg-card rounded-2xl border border-border p-3 w-full max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {words.map((w, i) => (
                  <span key={i} className={`px-2 py-1 rounded-lg text-sm font-medium ${i === words.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{w}</span>
                ))}
              </div>
            </div>

            {lastWord && (
              <p className="text-center text-muted-foreground text-sm">
                La siguiente debe empezar por <span className="font-display text-2xl font-bold text-primary">{lastWord[lastWord.length - 1].toUpperCase()}</span>
              </p>
            )}

            {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}

            <div className="flex gap-2 w-full">
              <input
                ref={inputRef}
                className="flex-1 p-4 rounded-2xl border-2 border-border bg-card font-display text-lg focus:border-primary outline-none"
                value={input}
                onChange={e => { setInput(e.target.value.replace(/[^a-záéíóúüñ]/gi, '')); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Tu palabra…"
                autoCorrect="off"
                spellCheck={false}
              />
              <Button onClick={submit} disabled={!input.trim()} className="rounded-2xl px-5 font-display">OK</Button>
            </div>
          </>
        )}
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : 'Jugador 2'}
        isDraw={false}
        onPlayAgain={() => { setShowWinner(false); startGame(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}