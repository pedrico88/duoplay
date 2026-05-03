import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import { useNavigate } from 'react-router-dom';

const STORIES = [
  { emojis: '👨‍🚀🚀🌍➡️🌙😱👾🔫💥🏃‍♂️', answer: 'Astronauta va a la luna, encuentra un alienígena y huye' },
  { emojis: '👸🏰😴🌹🧙‍♀️🍎❤️‍🩹👑', answer: 'Princesa en castillo duerme, bruja da manzana, se despierta' },
  { emojis: '🧑‍🍳🍕🔥😅🐕💨🏃‍♀️', answer: 'Chef hace pizza, se quema, perro roba y corre' },
  { emojis: '🦈🏊‍♂️😱🚤⛵🆘🚁✅', answer: 'Tiburón persigue nadador, pide ayuda, helicóptero lo rescata' },
  { emojis: '👦🌳🍎⬇️💡🔭🌌🏆', answer: 'Niño bajo árbol, manzana cae, descubre la gravedad, gana premio' },
  { emojis: '🧙‍♂️📚✨🐉⚔️🏆🎉', answer: 'Mago estudia, usa magia, mata dragón, celebra' },
  { emojis: '🕵️📸🔍🦝🍩👮🚔', answer: 'Detective fotografía mapache robando donuts, llama a policía' },
  { emojis: '🧟🏙️🔔⛪🏃‍♀️🔫💥🎉', answer: 'Zombies invaden ciudad, campanada, gente escapa, los destruyen' },
  { emojis: '👨‍👩‍👧🚗🏕️⛺🌧️🐻😱🏃', answer: 'Familia va de acampada, llueve, aparece oso, corren' },
  { emojis: '🤖🏭💔🌱🌳🦋🌈', answer: 'Robot en fábrica, se rompe el corazón, sale, cuida naturaleza' },
  { emojis: '🐠🌊🪝😨🤿👨‍🦯🐙', answer: 'Pez en el mar, anzuelo, buzo aparece, pulpo lo rescata' },
  { emojis: '👩‍🔬🧬💉🐀🦠🏅🎊', answer: 'Científica experimenta, vacuna ratón, elimina virus, gana medalla' },
];

export default function EmojiStory() {
  const navigate = useNavigate();
  const [storyIdx, setStoryIdx] = useState(Math.floor(Math.random() * STORIES.length));
  const [phase, setPhase] = useState('guessing'); // guessing, revealed
  const [guess, setGuess] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const ROUNDS = 8;

  const story = STORIES[storyIdx];

  const reveal = () => setPhase('revealed');

  const score = (player) => {
    const key = `p${player}`;
    setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    next();
  };

  const next = () => {
    if (round >= ROUNDS) {
      navigate('/games');
      return;
    }
    let next;
    do { next = Math.floor(Math.random() * STORIES.length); } while (next === storyIdx);
    setStoryIdx(next);
    setGuess('');
    setPhase('guessing');
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setRound(r => r + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10">
      <NativeHeader title="Historia Emoji" subtitle={`Ronda ${round}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <p className="text-sm text-muted-foreground">Turno de <span className={`font-bold ${currentPlayer === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {currentPlayer}</span></p>

        <motion.div key={storyIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border-2 border-border p-6 w-full text-center">
          <p className="text-4xl leading-relaxed">{story.emojis}</p>
        </motion.div>

        <p className="text-center text-muted-foreground text-sm">¿Qué historia cuentan los emojis?</p>

        {phase === 'guessing' && (
          <div className="flex flex-col gap-3 w-full">
            <textarea
              className="w-full p-4 rounded-2xl border-2 border-border bg-card font-body resize-none focus:border-primary outline-none"
              rows={3}
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Escribe tu interpretación…"
            />
            <Button disabled={!guess.trim()} onClick={reveal} className="rounded-2xl font-display">Revelar respuesta 👁️</Button>
          </div>
        )}

        {phase === 'revealed' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 w-full">
            <div className="bg-muted rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Tu respuesta:</p>
              <p className="font-medium">{guess}</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Respuesta de referencia:</p>
              <p className="font-bold text-primary">{story.answer}</p>
            </div>
            <p className="text-center font-display font-bold">¿Fue correcta la respuesta?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={next} className="flex-1 rounded-xl">❌ No</Button>
              <Button onClick={() => score(currentPlayer)} className="flex-1 rounded-xl">✅ Sí +1</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}