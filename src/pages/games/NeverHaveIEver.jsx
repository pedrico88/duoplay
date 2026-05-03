import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useNavigate } from 'react-router-dom';

const STATEMENTS = [
  'Yo nunca he mentido para evitar ir a una fiesta',
  'Yo nunca he enviado un mensaje al destinatario equivocado',
  'Yo nunca he comido pizza con piña',
  'Yo nunca he dormido en clase o en el trabajo',
  'Yo nunca he fingido hablar por teléfono para evitar a alguien',
  'Yo nunca he cantado en la ducha a todo volumen',
  'Yo nunca he olvidado el nombre de alguien justo después de conocerle',
  'Yo nunca he rebuscado en el móvil de otra persona',
  'Yo nunca he visto una serie entera en un día',
  'Yo nunca me he hecho el/la enfermo/a para no ir al trabajo',
  'Yo nunca he llorado con una película de dibujos animados',
  'Yo nunca he comido algo caído al suelo',
  'Yo nunca he googleado mi propio nombre',
  'Yo nunca he mandado un audio y luego arrepentirme',
  'Yo nunca he comprado algo por impulso y luego devolverlo',
  'Yo nunca he intentado ligar con alguien por Instagram',
  'Yo nunca he dado mal una dirección por error',
  'Yo nunca he borrado una foto de Instagram por los pocos likes',
  'Yo nunca he perdido un objeto valioso por descuido',
  'Yo nunca he copiado en un examen',
  'Yo nunca he llegado tarde a una cita importante',
  'Yo nunca he olvidado el cumpleaños de un familiar cercano',
  'Yo nunca he hecho spoiler sin querer',
  'Yo nunca he abierto un mensaje y dejado de responder a propósito',
  'Yo nunca he ido al supermercado con hambre y comprado de más',
  'Yo nunca he tenido un crush con un/a profesor/a',
  'Yo nunca he discutido con un extraño en internet',
  'Yo nunca he prometido hacer ejercicio y no hacerlo',
  'Yo nunca me he inventado una excusa para cancelar planes',
  'Yo nunca he releído mis propios mensajes para asegurarme de sonar bien',
];

export default function NeverHaveIEver() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(Math.floor(Math.random() * STATEMENTS.length));
  const [revealed, setRevealed] = useState(false);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [player, setPlayer] = useState(1);
  const [round, setRound] = useState(1);
  const ROUNDS = 12;

  const stmt = STATEMENTS[idx];

  const admit = () => {
    if (player === 1) setP1Score(s => s + 1);
    else setP2Score(s => s + 1);
    setRevealed(true);
  };

  const deny = () => setRevealed(true);

  const next = () => {
    if (round >= ROUNDS) { navigate('/games'); return; }
    let n;
    do { n = Math.floor(Math.random() * STATEMENTS.length); } while (n === idx);
    setIdx(n);
    setRevealed(false);
    setPlayer(p => p === 1 ? 2 : 1);
    setRound(r => r + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
      <NativeHeader title="Yo Nunca…" subtitle={`Ronda ${round}/${ROUNDS} · J1:${p1Score} J2:${p2Score}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">J1 lo hizo</p>
            <p className="font-display text-2xl font-bold text-primary">{p1Score}</p>
          </div>
          <div className="text-6xl">🙈</div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">J2 lo hizo</p>
            <p className="font-display text-2xl font-bold text-secondary">{p2Score}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span>
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-3xl border-2 border-border p-6 w-full text-center">
            <p className="font-display text-xl font-bold leading-relaxed">{stmt}</p>
          </motion.div>
        </AnimatePresence>

        {!revealed ? (
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={deny} className="flex-1 rounded-2xl font-display text-base">
              😇 Nunca
            </Button>
            <Button onClick={admit} className="flex-1 rounded-2xl font-display text-base bg-destructive hover:bg-destructive/90">
              🙋 Sí lo hice (+1)
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => { let n; do { n = Math.floor(Math.random() * STATEMENTS.length); } while (n === idx); setIdx(n); setRevealed(false); }} className="flex-1 rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> Otra
            </Button>
            <Button onClick={next} className="flex-1 rounded-xl">Siguiente →</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}