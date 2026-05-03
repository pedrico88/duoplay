import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';

const TOPICS = [
  { topic: '¿Pizza o hamburguesa?', a: '🍕 Pizza', b: '🍔 Hamburguesa' },
  { topic: '¿Playa o montaña?', a: '🏖️ Playa', b: '⛰️ Montaña' },
  { topic: '¿Gato o perro?', a: '🐱 Gato', b: '🐶 Perro' },
  { topic: '¿Verano o invierno?', a: '☀️ Verano', b: '❄️ Invierno' },
  { topic: '¿Series o películas?', a: '📺 Series', b: '🎬 Películas' },
  { topic: '¿Madrugar o trasnochar?', a: '🌅 Madrugar', b: '🌙 Trasnochar' },
  { topic: '¿Libro o podcast?', a: '📚 Libro', b: '🎧 Podcast' },
  { topic: '¿Redes sociales o sin redes?', a: '📱 Con redes', b: '🚫 Sin redes' },
  { topic: '¿Ciudad o pueblo?', a: '🏙️ Ciudad', b: '🏡 Pueblo' },
  { topic: '¿Chocolate o vainilla?', a: '🍫 Chocolate', b: '🍦 Vainilla' },
  { topic: '¿Coche o transporte público?', a: '🚗 Coche', b: '🚇 Transporte' },
  { topic: '¿Mañana o tarde/noche?', a: '🌤️ Mañana', b: '🌆 Tarde/noche' },
  { topic: '¿Musica en altavoz o auriculares?', a: '🔊 Altavoz', b: '🎧 Auriculares' },
  { topic: '¿Comer en casa o restaurante?', a: '🏠 Casa', b: '🍽️ Restaurante' },
  { topic: '¿Trabajo en oficina o remoto?', a: '🏢 Oficina', b: '💻 Remoto' },
];

const DEBATE_TIME = 45;
const ROUNDS = 6;

export default function Debate() {
  const navigate = useNavigate();
  const [topicIdx, setTopicIdx] = useState(Math.floor(Math.random() * TOPICS.length));
  const [phase, setPhase] = useState('setup'); // setup, assign, p1speaks, p2speaks, vote, result
  const [p1Side, setP1Side] = useState(null);
  const [p2Side, setP2Side] = useState(null);
  const [speaking, setSpeaking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DEBATE_TIME);
  const [vote, setVote] = useState(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const timerRef = useRef(null);

  const t = TOPICS[topicIdx];

  const start = () => {
    const p1 = Math.random() < 0.5 ? 'a' : 'b';
    setP1Side(p1);
    setP2Side(p1 === 'a' ? 'b' : 'a');
    setVote(null);
    setPhase('p1speaks');
    startTimer();
  };

  const startTimer = () => {
    setTimeLeft(DEBATE_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const finishP1 = () => {
    clearInterval(timerRef.current);
    setPhase('p2speaks');
    startTimer();
  };

  const finishP2 = () => {
    clearInterval(timerRef.current);
    setPhase('vote');
  };

  const castVote = (winner) => {
    setVote(winner);
    const key = `p${winner}`;
    setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    setPhase('result');
  };

  const next = () => {
    if (round >= ROUNDS) { navigate('/games'); return; }
    let n;
    do { n = Math.floor(Math.random() * TOPICS.length); } while (n === topicIdx);
    setTopicIdx(n); setRound(r => r + 1); setPhase('setup'); setVote(null);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const getSideLabel = (side) => side === 'a' ? t.a : t.b;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
      <NativeHeader title="Debate" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
              <div className="text-6xl">🗣️</div>
              <h2 className="font-display text-2xl font-bold">Debate</h2>
              <p className="text-muted-foreground text-sm">Cada jugador defiende una opción. Al final, el jurado (o deciden entre ellos) elige al mejor argumento.</p>
              <div className="bg-card rounded-2xl border-2 border-border p-4 w-full text-center">
                <p className="font-display text-xl font-bold">{t.topic}</p>
              </div>
              <Button onClick={start} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {(phase === 'p1speaks' || phase === 'p2speaks') && (
            <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <div className="text-5xl"><Mic className="w-12 h-12 text-primary" /></div>
              <p className="font-display text-xl font-bold text-center">
                {phase === 'p1speaks' ? '🔵 Jugador 1' : '🟢 Jugador 2'} habla
              </p>
              <div className="bg-card rounded-2xl border-2 border-primary p-4 w-full text-center">
                <p className="text-xs text-muted-foreground">Defiende:</p>
                <p className="font-display text-2xl font-bold">{phase === 'p1speaks' ? getSideLabel(p1Side) : getSideLabel(p2Side)}</p>
              </div>
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-display text-3xl font-bold ${timeLeft <= 10 ? 'border-destructive text-destructive animate-pulse' : 'border-primary text-primary'}`}>
                {timeLeft}
              </div>
              <Button onClick={phase === 'p1speaks' ? finishP1 : finishP2} variant="outline" className="rounded-2xl px-8 gap-2">
                <MicOff className="w-4 h-4" /> Listo
              </Button>
            </motion.div>
          )}

          {phase === 'vote' && (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full">
              <div className="text-5xl">🗳️</div>
              <p className="font-display text-xl font-bold text-center">¿Quién ganó el debate?</p>
              <p className="text-muted-foreground text-sm text-center">(Decide un jurado externo, o entre los dos)</p>
              <div className="flex gap-4 w-full">
                <button onClick={() => castVote(1)} className="flex-1 h-24 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg active:scale-95 transition-all">
                  🔵 J1<br /><span className="text-sm font-normal opacity-80">{getSideLabel(p1Side)}</span>
                </button>
                <button onClick={() => castVote(2)} className="flex-1 h-24 rounded-2xl bg-secondary text-secondary-foreground font-display font-bold text-lg active:scale-95 transition-all">
                  🟢 J2<br /><span className="text-sm font-normal opacity-80">{getSideLabel(p2Side)}</span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
              <div className="text-6xl">🏆</div>
              <p className="font-display text-2xl font-bold">¡Jugador {vote} ganó!</p>
              <Button onClick={next} className="rounded-2xl px-8">{round >= ROUNDS ? 'Fin' : 'Siguiente →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}