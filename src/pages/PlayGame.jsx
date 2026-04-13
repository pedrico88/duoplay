import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicTacToe from './games/TicTacToe';
import Connect4 from './games/Connect4';
import RockPaperScissors from './games/RockPaperScissors';
import WordGuess from './games/WordGuess';
import TapRace from './games/TapRace';
import Trivia from './games/Trivia';
import TruthOrDare from './games/TruthOrDare';
import GuessNumber from './games/GuessNumber';
import Memory from './games/Memory';
import MathRace from './games/MathRace';

const GAME_MAP = {
  tictactoe: TicTacToe,
  connect4: Connect4,
  rps: RockPaperScissors,
  wordguess: WordGuess,
  taprace: TapRace,
  trivia: Trivia,
  truthordare: TruthOrDare,
  guessnumber: GuessNumber,
  memory: Memory,
  mathrace: MathRace,
};

export default function PlayGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const GameComponent = GAME_MAP[gameId];

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-display text-xl font-bold mb-2">Juego no encontrado</h2>
          <button onClick={() => navigate('/games')} className="text-primary underline text-sm">
            Volver a juegos
          </button>
        </div>
      </div>
    );
  }

  return <GameComponent />;
}