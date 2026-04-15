import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useGame } from '@/lib/gameContext.jsx';
import { GAMES } from '@/lib/gameData';
import confetti from 'canvas-confetti';

export default function TournamentResults() {
  const navigate = useNavigate();
  const { tournament, endTournament, startTournament } = useGame();

  useEffect(() => {
    if (!tournament) return;
    const { scores } = tournament;
    if (scores.player1 !== scores.player2) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  }, []);

  if (!tournament) {
    navigate('/games');
    return null;
  }

  const { scores, games } = tournament;
  const isDraw = scores.player1 === scores.player2;
  const winner = !isDraw ? (scores.player1 > scores.player2 ? 'Jugador 1' : 'Jugador 2') : null;

  const handlePlayAgain = () => {
    const gameIds = games;
    endTournament();
    startTournament(gameIds);
    navigate(`/play/${gameIds[0]}`);
  };

  const handleExit = () => {
    endTournament();
    navigate('/games');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-full max-w-sm"
      >
        {/* Trophy */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-7xl mb-3"
          >
            {isDraw ? '🤝' : '🏆'}
          </motion.div>
          <h1 className="font-display text-3xl font-bold">
            {isDraw ? '¡Empate total!' : '¡Campeón del torneo!'}
          </h1>
          {winner && (
            <p className="text-xl font-bold text-primary mt-1">{winner}</p>
          )}
          <p className="text-muted-foreground text-sm mt-2">
            {games.length} juego{games.length > 1 ? 's' : ''} completado{games.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Score board */}
        <div className="flex gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex-1 rounded-3xl p-5 text-center border-2 ${
              scores.player1 > scores.player2
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
          >
            {scores.player1 > scores.player2 && (
              <div className="text-lg mb-1">🥇</div>
            )}
            <p className="font-display text-4xl font-bold text-primary">{scores.player1}</p>
            <p className="text-sm font-semibold mt-1">Jugador 1</p>
            <p className="text-xs text-muted-foreground">victorias</p>
          </motion.div>

          <div className="flex items-center text-muted-foreground font-bold text-lg">VS</div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex-1 rounded-3xl p-5 text-center border-2 ${
              scores.player2 > scores.player1
                ? 'border-secondary bg-secondary/10'
                : 'border-border bg-card'
            }`}
          >
            {scores.player2 > scores.player1 && (
              <div className="text-lg mb-1">🥇</div>
            )}
            <p className="font-display text-4xl font-bold text-secondary">{scores.player2}</p>
            <p className="text-sm font-semibold mt-1">Jugador 2</p>
            <p className="text-xs text-muted-foreground">victorias</p>
          </motion.div>
        </div>

        {/* Games played */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Juegos del torneo</p>
          <div className="flex flex-wrap gap-1.5">
            {games.map(id => {
              const g = GAMES.find(x => x.id === id);
              if (!g) return null;
              return (
                <span key={id} className={`text-xs px-2.5 py-1 rounded-full bg-gradient-to-r ${g.color} text-white font-medium`}>
                  {g.emoji.slice(0,2)} {g.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExit} className="flex-1 rounded-2xl h-12 gap-2" aria-label="Salir al menú de juegos">
            <Home className="w-4 h-4" aria-hidden="true" /> Salir
          </Button>
          <Button onClick={handlePlayAgain} className="flex-1 rounded-2xl h-12 bg-primary gap-2 font-display font-bold" aria-label="Repetir el torneo">
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Repetir
          </Button>
        </div>
      </motion.div>
    </div>
  );
}