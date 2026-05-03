import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useNavigate } from 'react-router-dom';

const RIDDLES = [
  { q: 'Cuanto más seco, más moja. ¿Qué es?', a: 'Una toalla' },
  { q: 'Tiene dientes pero no muerde, tiene hojas pero no es árbol. ¿Qué es?', a: 'Un libro' },
  { q: 'Vivo sin respirar, siempre frío, nunca tengo sed. ¿Qué soy?', a: 'Un pez' },
  { q: 'Tiene ojos pero no ve, tiene boca pero no habla. ¿Qué es?', a: 'Un río' },
  { q: 'Cuanto más grande, menos pesa. ¿Qué es?', a: 'Un agujero' },
  { q: 'Soy alto cuando joven y bajo cuando viejo. ¿Qué soy?', a: 'Una vela' },
  { q: 'Tengo ciudades, pero no casas. Tengo montañas pero no árboles. Tengo agua pero no peces. ¿Qué soy?', a: 'Un mapa' },
  { q: 'Siempre viene pero nunca llega. ¿Qué es?', a: 'El mañana' },
  { q: 'Tiene cabeza y cola pero no tiene cuerpo. ¿Qué es?', a: 'Una moneda' },
  { q: 'Cuantos más quitas, más grande se hace. ¿Qué es?', a: 'Un hoyo' },
  { q: 'Soy el hijo de mi padre pero no soy el hermano de nadie. ¿Qué soy?', a: 'Un hijo único' },
  { q: 'Te encuentro en el centro de la noche, al principio y al final del tiempo. ¿Qué soy?', a: 'La letra N' },
  { q: 'Corro pero no camino, tengo boca pero no hablo, tengo cama pero no duermo. ¿Qué soy?', a: 'Un río' },
  { q: 'Puedo volar sin alas, llorar sin ojos. Donde voy, oscurece, donde me voy, aclara. ¿Qué soy?', a: 'Una nube' },
  { q: 'Tengo manos pero no puedo aplaudir. ¿Qué soy?', a: 'Un reloj' },
  { q: 'Nace en la montaña y muere en el mar. ¿Qué es?', a: 'Un río' },
  { q: '¿Qué cosa es que tiene agujas y no cose?', a: 'Un reloj o un cactus' },
  { q: 'Antes de nacer ya tengo nombre. ¿Qué soy?', a: 'Un bebé' },
  { q: 'Soy blando cuando nací, duro de viejo, con barbas al final. ¿Qué soy?', a: 'Un queso' },
  { q: 'Tiene cuatro patas y no puede caminar. ¿Qué es?', a: 'Una mesa' },
];

const ROUNDS = 8;

export default function Riddles() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(Math.floor(Math.random() * RIDDLES.length));
  const [shown, setShown] = useState(false);
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);

  const riddle = RIDDLES[idx];

  const score = (win) => {
    if (win) {
      const key = `p${player}`;
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
    next();
  };

  const next = () => {
    if (round >= ROUNDS) { navigate('/games'); return; }
    let n;
    do { n = Math.floor(Math.random() * RIDDLES.length); } while (n === idx);
    setIdx(n); setShown(false);
    setPlayer(p => p === 1 ? 2 : 1);
    setRound(r => r + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
      <NativeHeader title="Acertijos" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <p className="text-sm text-muted-foreground text-center">
          Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span>
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full flex flex-col gap-4">
            <div className="bg-card rounded-3xl border-2 border-border p-6 text-center">
              <p className="font-display text-xl font-bold leading-relaxed">{riddle.q}</p>
            </div>

            <button
              onClick={() => setShown(s => !s)}
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{shown ? 'Ocultar respuesta' : 'Ver respuesta'}</span>
            </button>

            <AnimatePresence>
              {shown && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-primary/10 rounded-2xl p-4 text-center border-2 border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Respuesta</p>
                  <p className="font-display text-xl font-bold text-primary">{riddle.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={() => score(false)} className="flex-1 rounded-2xl">❌ Falló</Button>
          <Button onClick={() => score(true)} className="flex-1 rounded-2xl bg-green-500 hover:bg-green-600 text-white">✅ Acertó +1</Button>
        </div>
      </div>
    </div>
  );
}