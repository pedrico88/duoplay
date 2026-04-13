import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '@/components/duoplay/GameHeader';
import WinnerModal from '@/components/duoplay/WinnerModal';
import { useGame } from '@/lib/gameContext.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SPANISH_WORDS } from '@/lib/spanishWords';

const MAX_ATTEMPTS = 6;

function evaluateGuess(secret, guess) {
  const result = Array(secret.length).fill('gray');
  const secretArr = secret.split('');
  const guessArr = guess.split('');
  // Greens first
  for (let i = 0; i < secretArr.length; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = 'green';
      secretArr[i] = null;
      guessArr[i] = null;
    }
  }
  // Yellows
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] && secretArr.includes(guessArr[i])) {
      result[i] = 'yellow';
      secretArr[secretArr.indexOf(guessArr[i])] = null;
    }
  }
  return result;
}

export default function WordGuess() {
  const navigate = useNavigate();
  const { recordWin, recordLoss, setSessionScore } = useGame();
  const [phase, setPhase] = useState('setword'); // setword, guessing, result, swap
  const [secretWord, setSecretWord] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentSetter, setCurrentSetter] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const [roundResult, setRoundResult] = useState(null);

  const wordLen = secretWord.length || 5;

  const handleSetWord = () => {
    const w = wordInput.toLowerCase().trim();
    if (w.length >= 4 && w.length <= 6) {
      setSecretWord(w);
      setWordInput('');
      setPhase('guessing');
    }
  };

  const handleGuess = () => {
    const g = guessInput.toLowerCase().trim();
    if (g.length !== secretWord.length) return;
    const result = evaluateGuess(secretWord, g);
    const newAttempts = [...attempts, { word: g, result }];
    setAttempts(newAttempts);
    setGuessInput('');

    if (g === secretWord) {
      // Guesser wins this round
      const guesser = currentSetter === 1 ? 'p2' : 'p1';
      const newScores = { ...scores, [guesser]: scores[guesser] + 1 };
      setScores(newScores);
      setRoundResult(`¡Jugador ${guesser === 'p1' ? '1' : '2'} adivinó la palabra!`);
      setPhase('result');
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      // Setter wins
      const setter = currentSetter === 1 ? 'p1' : 'p2';
      const newScores = { ...scores, [setter]: scores[setter] + 1 };
      setScores(newScores);
      setRoundResult(`¡No se adivinó! La palabra era "${secretWord}"`);
      setPhase('result');
    }
  };

  const nextRound = () => {
    setCurrentSetter(currentSetter === 1 ? 2 : 1);
    setSecretWord('');
    setAttempts([]);
    setRoundResult(null);
    setPhase('setword');
  };

  const colorMap = { green: 'bg-green-500 text-white', yellow: 'bg-yellow-400 text-black', gray: 'bg-muted text-muted-foreground' };

  return (
    <div className="min-h-screen flex flex-col no-select">
      <GameHeader
        emoji="🔤✨"
        onReset={() => { setScores({ p1: 0, p2: 0 }); nextRound(); }}
        player1Score={scores.p1}
        player2Score={scores.p2}
        player1Name="J1"
        player2Name="J2"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {phase === 'setword' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center w-full max-w-xs space-y-4">
            <div className={`text-lg font-display font-bold ${currentSetter === 1 ? 'text-primary' : 'text-secondary'}`}>
              Jugador {currentSetter}
            </div>
            <p className="text-sm text-muted-foreground">Escribe la palabra secreta (4-6 letras)</p>
            <p className="text-xs text-muted-foreground">¡Que el otro jugador no mire!</p>
            <Input
              type="password"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value.slice(0, 6))}
              placeholder="Palabra secreta..."
              className="text-center text-lg rounded-xl h-12"
              maxLength={6}
            />
            <Button onClick={handleSetWord} disabled={wordInput.length < 4} className="w-full rounded-xl">
              Confirmar
            </Button>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">O usa una palabra aleatoria:</p>
              <Button variant="outline" className="rounded-xl text-sm" onClick={() => {
                const w = SPANISH_WORDS[Math.floor(Math.random() * SPANISH_WORDS.length)];
                setSecretWord(w);
                setPhase('guessing');
              }}>
                🎲 Palabra aleatoria
              </Button>
            </div>
          </motion.div>
        )}

        {phase === 'guessing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xs space-y-3">
            <div className={`text-center text-lg font-display font-bold ${currentSetter === 1 ? 'text-secondary' : 'text-primary'}`}>
              Jugador {currentSetter === 1 ? 2 : 1} adivina
            </div>
            <p className="text-center text-sm text-muted-foreground">{secretWord.length} letras · {MAX_ATTEMPTS - attempts.length} intentos restantes</p>

            {/* Attempts grid */}
            <div className="space-y-2">
              {attempts.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex gap-1.5 justify-center"
                >
                  {a.word.split('').map((letter, j) => (
                    <div key={j} className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold uppercase ${colorMap[a.result[j]]}`}>
                      {letter}
                    </div>
                  ))}
                </motion.div>
              ))}
              {/* Empty rows */}
              {Array(MAX_ATTEMPTS - attempts.length).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="flex gap-1.5 justify-center">
                  {Array(secretWord.length).fill(null).map((_, j) => (
                    <div key={j} className="w-12 h-12 rounded-xl border-2 border-border flex items-center justify-center" />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value.slice(0, secretWord.length))}
                placeholder={`${secretWord.length} letras...`}
                className="text-center text-lg uppercase rounded-xl h-12 flex-1"
                maxLength={secretWord.length}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              />
              <Button onClick={handleGuess} disabled={guessInput.length !== secretWord.length} className="rounded-xl h-12 px-6">
                ✓
              </Button>
            </div>

            <div className="flex gap-1 flex-wrap justify-center">
              <span className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded bg-green-500" /> Correcta</span>
              <span className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded bg-yellow-400" /> Mal posición</span>
              <span className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded bg-muted" /> No existe</span>
            </div>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
            <div className="text-4xl">🔤</div>
            <p className="font-display font-bold text-lg">{roundResult}</p>
            <Button onClick={nextRound} className="rounded-xl">Siguiente ronda</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}