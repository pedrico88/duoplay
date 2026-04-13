import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/lib/gameContext.jsx';
import { GAMES } from '@/lib/gameData';
import { Copy, Check, Loader2 } from 'lucide-react';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function OnlineRoom() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const { profile } = useGame();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (urlCode) {
          // Try to join existing room
          const rooms = await base44.entities.GameRoom.filter({ code: urlCode.toUpperCase() });
          if (rooms.length > 0) {
            const r = rooms[0];
            if (r.status === 'waiting' && !r.guest_email) {
              const user = await base44.auth.me();
              await base44.entities.GameRoom.update(r.id, {
                guest_email: user.email,
                guest_nickname: profile.nickname || 'Jugador 2',
                guest_avatar: profile.avatar || '🤖',
                status: 'playing'
              });
              setRoom({ ...r, guest_email: user.email, status: 'playing' });
            } else {
              setRoom(r);
            }
          } else {
            setError('Sala no encontrada');
          }
        }
      } catch (err) {
        setError('Error al conectar');
      }
      setLoading(false);
    };
    init();
  }, [urlCode]);

  const createRoom = async () => {
    const code = generateCode();
    const user = await base44.auth.me();
    const newRoom = await base44.entities.GameRoom.create({
      code,
      host_email: user.email,
      host_nickname: profile.nickname || 'Jugador 1',
      host_avatar: profile.avatar || '😎',
      game: selectedGame,
      status: 'waiting',
      game_state: {},
      host_score: 0,
      guest_score: 0,
      chat_messages: []
    });
    setRoom(newRoom);
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;
    const unsub = base44.entities.GameRoom.subscribe((event) => {
      if (event.id === room.id) {
        setRoom(event.data);
      }
    });
    return unsub;
  }, [room?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-4xl">😕</div>
        <p className="font-display font-bold text-lg">{error}</p>
        <Button onClick={() => navigate('/')} variant="outline" className="rounded-xl">
          Volver al inicio
        </Button>
      </div>
    );
  }

  // Room selection / creation
  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <h2 className="font-display text-xl font-bold">Crear Sala Online</h2>
        <p className="text-sm text-muted-foreground text-center">Elige un juego para la sala</p>
        <div className="grid grid-cols-2 gap-3 max-w-xs w-full">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`p-3 rounded-2xl border-2 text-center transition-all ${
                selectedGame === game.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="text-2xl">{game.emoji}</span>
              <p className="text-xs font-medium mt-1">{game.name}</p>
            </button>
          ))}
        </div>
        <Button
          onClick={createRoom}
          disabled={!selectedGame}
          className="w-full max-w-xs rounded-xl h-12 font-display"
        >
          Crear Sala
        </Button>
      </div>
    );
  }

  // Waiting room
  if (room.status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
        <h2 className="font-display text-xl font-bold">Esperando jugador...</h2>
        <p className="text-sm text-muted-foreground text-center">Comparte este código con tu amigo</p>
        
        <div className="bg-card rounded-2xl border-2 border-dashed border-primary p-6 text-center">
          <p className="font-mono text-4xl font-bold tracking-[0.3em] text-primary">
            {room.code}
          </p>
        </div>

        <Button onClick={copyCode} variant="outline" className="rounded-xl gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar código'}
        </Button>

        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Game in progress - navigate to game
  if (room.status === 'playing' && room.game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-5xl">🎮</div>
        <h2 className="font-display text-xl font-bold">¡Sala conectada!</h2>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{room.host_avatar}</span>
          <span className="font-bold">{room.host_nickname}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-bold">{room.guest_nickname}</span>
          <span className="text-2xl">{room.guest_avatar}</span>
        </div>
        <Button
          onClick={() => navigate(`/play/${room.game}?mode=online&roomId=${room.id}`)}
          className="rounded-xl h-12 px-8 font-display"
        >
          🚀 Jugar {GAMES.find(g => g.id === room.game)?.name}
        </Button>

        {/* Quick Chat */}
        <div className="flex gap-2 mt-4">
          {['👍', '😂', '😤', '🔥', 'gg'].map(emoji => (
            <button
              key={emoji}
              className="text-2xl p-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors"
              onClick={async () => {
                const user = await base44.auth.me();
                const msgs = [...(room.chat_messages || []), { from: user.email, emoji, timestamp: Date.now() }].slice(-20);
                await base44.entities.GameRoom.update(room.id, { chat_messages: msgs });
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat messages */}
        {room.chat_messages?.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {room.chat_messages.slice(-5).map((msg, i) => (
              <span key={i} className="text-lg bg-card rounded-full px-2 py-0.5 border border-border">
                {msg.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}