import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NativeHeader from '@/components/duoplay/NativeHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  { q: '¿En qué año se formó The Beatles?', opts: ['1956','1960','1963','1967'], a: '1960' },
  { q: '¿Quién canta "Bohemian Rhapsody"?', opts: ['Led Zeppelin','Queen','The Rolling Stones','Pink Floyd'], a: 'Queen' },
  { q: '¿Cuántos Grammys tiene Beyoncé?', opts: ['22','28','32','38'], a: '32' },
  { q: '¿De qué país es Shakira?', opts: ['Venezuela','Argentina','Colombia','México'], a: 'Colombia' },
  { q: '¿Cuál es el álbum más vendido de todos los tiempos?', opts: ['Thriller','Back in Black','Dark Side of the Moon','The Eagles'], a: 'Thriller' },
  { q: '¿Quién compuso "La Quinta Sinfonía"?', opts: ['Mozart','Bach','Beethoven','Chopin'], a: 'Beethoven' },
  { q: '¿Qué instrumento toca Jimi Hendrix?', opts: ['Batería','Bajo','Guitarra eléctrica','Piano'], a: 'Guitarra eléctrica' },
  { q: '¿Cuál fue el primer single de Elvis Presley?', opts: ['Blue Suede Shoes','Hound Dog','That\'s All Right','Jailhouse Rock'], a: 'That\'s All Right' },
  { q: '¿De dónde son los Red Hot Chili Peppers?', opts: ['Nueva York','Chicago','Los Ángeles','San Francisco'], a: 'Los Ángeles' },
  { q: '¿Quién es el "Rey del Pop"?', opts: ['Prince','Michael Jackson','Elvis Presley','Justin Timberlake'], a: 'Michael Jackson' },
  { q: '¿Cuántas cuerdas tiene un violín?', opts: ['4','5','6','7'], a: '4' },
  { q: '¿Qué artista tiene más seguidores en Spotify?', opts: ['Ed Sheeran','Drake','The Weeknd','Bad Bunny'], a: 'Bad Bunny' },
  { q: '¿En qué año murió Kurt Cobain?', opts: ['1991','1993','1994','1995'], a: '1994' },
  { q: '¿Cuál es el nombre real de Lady Gaga?', opts: ['Stefani Germanotta','Maria Lopez','Jennifer Adams','Sandra Carey'], a: 'Stefani Germanotta' },
  { q: '¿Quién inventó el piano?', opts: ['Bach','Bartolomeo Cristofori','Mozart','Liszt'], a: 'Bartolomeo Cristofori' },
];

const ROUNDS = 10;

export default function MusicQuiz() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setup');
  const [shuffled, setShuffled] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [player, setPlayer] = useState(1);
  const [showWinner, setShowWinner] = useState(false);

  const start = () => {
    setShuffled([...QUESTIONS].sort(() => Math.random() - 0.5));
    setQIdx(0); setScores({ p1: 0, p2: 0 }); setPlayer(1); setPicked(null);
    setPhase('playing');
  };

  const choose = (opt) => {
    if (picked) return;
    setPicked(opt);
    const q = shuffled[qIdx];
    if (opt === q.a) {
      const key = player === 1 ? 'p1' : 'p2';
      setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const next = () => {
    if (qIdx >= ROUNDS - 1) {
      if (scores.p1 > scores.p2) { recordWin('musicquiz'); setSessionScore(p => ({ ...p, player1: p.player1 + 1 })); }
      else if (scores.p2 > scores.p1) { recordLoss('musicquiz'); setSessionScore(p => ({ ...p, player2: p.player2 + 1 })); }
      setShowWinner(true); return;
    }
    setQIdx(i => i + 1);
    setPlayer(p => p === 1 ? 2 : 1);
    setPicked(null);
  };

  const q = shuffled[qIdx];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-500/10 to-purple-500/10">
      <NativeHeader title="Quiz Musical" subtitle={`Pregunta ${qIdx + 1}/${ROUNDS} · J1:${scores.p1} J2:${scores.p2}`} backTo="/games" />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center">
              <div className="text-6xl">🎵</div>
              <h2 className="font-display text-2xl font-bold">Quiz Musical</h2>
              <p className="text-muted-foreground text-sm">Preguntas sobre música, artistas y curiosidades. ¡Por turnos!</p>
              <Button onClick={start} className="rounded-2xl px-8 font-display text-lg">¡Empezar!</Button>
            </motion.div>
          )}

          {phase === 'playing' && q && (
            <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 w-full">
              <p className="text-sm text-center">Turno de <span className={`font-bold ${player === 1 ? 'text-primary' : 'text-secondary'}`}>Jugador {player}</span></p>
              <div className="bg-card rounded-3xl border-2 border-border p-6 text-center">
                <div className="text-4xl mb-3">🎵</div>
                <p className="font-display text-lg font-bold">{q.q}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {q.opts.map((opt, i) => {
                  let cls = 'bg-muted hover:bg-muted/70 border-border';
                  if (picked) {
                    if (opt === q.a) cls = 'bg-green-500 text-white border-green-500';
                    else if (opt === picked) cls = 'bg-destructive text-white border-destructive';
                    else cls = 'bg-muted opacity-50 border-border';
                  }
                  return (
                    <button key={i} onClick={() => choose(opt)} disabled={!!picked}
                      className={`p-4 rounded-xl text-left font-medium border-2 transition-all active:scale-[0.97] ${cls}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {picked && (
                <Button onClick={next} className="rounded-2xl font-display text-lg">
                  {qIdx >= ROUNDS - 1 ? 'Ver resultado' : 'Siguiente →'}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WinnerModal
        show={showWinner}
        winner={scores.p1 > scores.p2 ? 'Jugador 1' : scores.p2 > scores.p1 ? 'Jugador 2' : ''}
        isDraw={scores.p1 === scores.p2}
        onPlayAgain={() => { setShowWinner(false); start(); }}
        onExit={() => navigate('/games')}
      />
    </div>
  );
}