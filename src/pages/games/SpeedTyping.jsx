import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const PHRASES = [
  'El rápido zorro marrón salta sobre el perro perezoso',
  'La vida es corta y el arte es largo',
  'Un café con leche y dos croissants por favor',
  'Mañana será otro día lleno de posibilidades',
  'El tiempo vuela cuando te diviertes con amigos',
  'La música calma el alma y alegra el corazón',
  'Cada día es una nueva oportunidad para mejorar',
  'Los sueños son el motor que mueve el mundo',
  'El sol brilla fuerte sobre las montañas nevadas',
  'Nunca es demasiado tarde para aprender algo nuevo',
  'El viento soplaba fuerte aquella noche de invierno',
  'Las estrellas brillan más cuando el cielo está oscuro',
  'Un paseo por la playa siempre levanta el ánimo',
  'La amistad es el tesoro más valioso de la vida',
  'El conocimiento es poder pero la sabiduría es libertad',
];

export default function SpeedTyping() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup'); // setup, p1typing, p1done, p2typing, p2done, result
  const [phrase, setPhrase] = useState('');
  const [input, setInput] = useState('');
  const [p1Time, setP1Time] = useState(null);
  const [p2Time, setP2Time] = useState(null);
  const [p1Errors, setP1Errors] = useState(0);
  const [p2Errors, setP2Errors] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const startRef = useRef(null);
  const inputRef = useRef(null);

  const pickPhrase = () => {
    const p = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setPhrase(p);
    setInput('');
    setPhase('p1typing');
    setTimeout(() => inputRef.current?.focus(), 100);
    startRef.current = Date.now();
  };

  const handleInput = (val, player) => {
    setInput(val);
    if (val === phrase) {
      const elapsed = Date.now() - startRef.current;
      const errors = countErrors(val, phrase);
      if (player === 1) {
        setP1Time(elapsed); setP1Errors(errors); setInput(''); setPhase('p1done');
      } else {
        setP2Time(elapsed); setP2Errors(errors); finishGame(elapsed, errors);
      }
    }
  };

  const countErrors = (typed, target) => {
    let errs = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== target[i]) errs++;
    }
    return errs;
  };

  const startP2 = () => {
    setInput('');
    setPhase('p2typing');
    setTimeout(() => inputRef.current?.focus(), 100);
    startRef.current = Date.now();
  };

  const finishGame = (t2, e2) => {
    const t1 = p1Time;
    setPhase('result');
    setTimeout(() => {
      if (t1 < t2) {
        recordWin('speedtyping'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 }));
      } else if (t2 < t1) {
        recordLoss('speedtyping'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 }));
      }
      setShowWinner(true);
    }, 1500);
  };

  const renderTypingUI = (player) => {
    const typed = input;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-4 p-6 max-w-md mx-auto w-full">
        <p className="text-center text-sm text-muted-foreground">
          Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span>
        </p>
        <div className="bg-muted rounded-2xl p-4 font-mono text-lg leading-relaxed select-text">
          {phrase.split('').map((ch, i) => {
            let color = 'text-muted-foreground';
            if (i < typed.length) color = typed[i] === ch ? 'text-green-500 font-bold' : 'text-destructive font-bold underline';
            return <span key={i} className={color}>{ch}</span>;
          })}
        </div>
        <textarea
          ref={inputRef}
          className="w-full p-4 rounded-2xl border-2 border-border bg-card font-mono resize-none text-base focus:border-primary outline-none"
          rows={3}
          value={input}
          onChange={e => handleInput(e.target.value, player)}
          placeholder="Escribe aquí..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground text-center">Escribe exactamente el texto de arriba</p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NativeHeader title="Mecanografía Veloz" backTo="/games" />

      {phase === 'setup' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-6xl">⌨️</div>
          <h2 className="font-display text-2xl font-bold text-center">Mecanografía Veloz</h2>
          <p className="text-muted-foreground text-center text-sm">¿Quién escribe más rápido?</p>
          <Button onClick={pickPhrase} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
        </div>
      )}

      {phase === 'p1typing' && renderTypingUI(1)}

      {phase === 'p1done' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-5xl">✅</div>
          <p className="font-display text-xl font-bold">Jugador 1: {(p1Time / 1000).toFixed(2)}s</p>
          <p className="text-muted-foreground">Pasa el móvil a Jugador 2</p>
          <Button onClick={startP2} className="rounded-2xl px-8 font-display">Turno de Jugador 2 →</Button>
        </div>
      )}

      {phase === 'p2typing' && renderTypingUI(2)}

      {phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-6xl">🏆</div>
          <div className="w-full max-w-xs space-y-3">
            {[{ n: 'Jugador 1', t: p1Time, e: p1Errors }, { n: 'Jugador 2', t: p2Time, e: p2Errors }].map((p, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                <span className={`font-display font-bold ${i === 0 ? 'text-primary' : 'text-secondary'}`}>{p.n}</span>
                <div className="text-right">
                  <p className="font-bold">{(p.t / 1000).toFixed(2)}s</p>
                  <p className="text-xs text-muted-foreground">{p.e} errores</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <WinnerModal
        show={showWinner}
        winner={p1Time && p2Time ? (p1Time < p2Time ? 'Jugador 1' : p2Time < p1Time ? 'Jugador 2' : '') : ''}
        isDraw={p1Time === p2Time}
        onPlayAgain={() => { setShowWinner(false); setP1Time(null); setP2Time(null); setP1Errors(0); setP2Errors(0); setInput(''); pickPhrase(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}