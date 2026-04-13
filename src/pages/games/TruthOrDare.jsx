import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const TRUTHS = [
  '¿Cuál es tu mayor miedo?',
  '¿A quién le tienes más cariño de los dos?',
  '¿Cuál es la mentira más grande que has dicho?',
  '¿Qué es lo más vergonzoso que te ha pasado?',
  '¿Cuál es tu peor hábito?',
  '¿Qué cosa nunca le contarías a tus padres?',
  '¿Cuál es la app que más usas en secreto?',
  '¿Qué harías con 1 millón de euros?',
  '¿Cuál ha sido tu peor metedura de pata?',
  '¿Qué es lo que más te gusta de la otra persona?',
  '¿Qué talento secreto tienes?',
  '¿Cuál es tu recuerdo más vergonzoso del colegio?',
  '¿Has roto alguna vez algo y lo has ocultado?',
  '¿Cuál es la cosa más rara que has comido?',
  '¿Qué es lo que más te arrepientes de haber hecho?',
];

const DARES = [
  'Imita a un animal durante 30 segundos',
  'Haz 10 flexiones ahora mismo',
  'Di el alfabeto al revés tan rápido como puedas',
  'Llama a alguien de tu agenda y canta "Cumpleaños feliz"',
  'Baila sin música durante 1 minuto',
  'Habla como un robot durante 2 turnos',
  'Haz tu mejor imitación de un político famoso',
  'Di 5 trabalenguas sin equivocarte',
  'Escribe tu nombre con el codo en el aire',
  'Haz una reverencia y di "a su servicio" al otro jugador',
  'Imita al otro jugador durante 1 minuto',
  'Cuenta un chiste. Si no hace gracia, haz 5 sentadillas',
  'Envía un mensaje de voz con una voz graciosa a alguien de tu contactos',
  'Haz el moonwalk por la habitación',
  'Recita un poema inventado de 4 versos sobre la persona que tienes delante',
];

const PLAYERS = ['Jugador 1', 'Jugador 2'];

export default function TruthOrDare() {
  const navigate = useNavigate();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [card, setCard] = useState(null);
  const [type, setType] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const pick = (t) => {
    const list = t === 'truth' ? TRUTHS : DARES;
    const random = list[Math.floor(Math.random() * list.length)];
    setType(t);
    setCard(random);
    setRevealed(true);
  };

  const next = () => {
    setRevealed(false);
    setCard(null);
    setType(null);
    setCurrentPlayer((p) => (p + 1) % 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯🔥</span>
          <span className="font-display font-bold">Verdad o Reto</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Current player */}
        <motion.div
          key={currentPlayer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm">Le toca a</p>
          <h2 className="font-display text-3xl font-bold text-primary">{PLAYERS[currentPlayer]}</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs flex flex-col gap-4"
            >
              <Button
                onClick={() => pick('truth')}
                className="h-20 rounded-2xl text-xl font-display font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-lg"
              >
                🤔 Verdad
              </Button>
              <Button
                onClick={() => pick('dare')}
                className="h-20 rounded-2xl text-xl font-display font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 shadow-lg"
              >
                🔥 Reto
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              className="w-full max-w-sm"
            >
              <div className={`rounded-3xl p-8 text-center shadow-2xl ${type === 'truth' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-orange-500 to-red-500'} text-white`}>
                <p className="text-4xl mb-4">{type === 'truth' ? '🤔' : '🔥'}</p>
                <p className="text-sm font-medium opacity-80 mb-3 uppercase tracking-widest">
                  {type === 'truth' ? 'Verdad' : 'Reto'}
                </p>
                <p className="text-xl font-bold leading-relaxed">{card}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => pick(type)} className="flex-1 rounded-xl gap-2">
                  <RefreshCw className="w-4 h-4" /> Otra
                </Button>
                <Button onClick={next} className="flex-1 rounded-xl bg-primary">
                  Siguiente turno →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}