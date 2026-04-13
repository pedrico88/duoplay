import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GameCard({ game, index, mode = 'local' }) {
  const navigate = useNavigate();
  const [showOnlineDialog, setShowOnlineDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = (e) => {
    if (mode === 'online') {
      e.preventDefault();
      setShowOnlineDialog(true);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const user = await base44.auth.me();
    const code = generateCode();
    await base44.entities.GameRoom.create({
      code,
      host_email: user.email,
      host_nickname: user.full_name || user.email,
      game: game.id,
      status: 'waiting',
    });
    navigate(`/room/${code}`);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (joinCode.length !== 6) return;
    setLoading(true);
    setError('');
    const rooms = await base44.entities.GameRoom.filter({ code: joinCode.toUpperCase() });
    if (!rooms || rooms.length === 0) {
      setError('Sala no encontrada');
      setLoading(false);
      return;
    }
    navigate(`/room/${joinCode.toUpperCase()}`);
    setLoading(false);
    setShowOnlineDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          to={`/play/${game.id}?mode=${mode}`}
          className="block"
          onClick={handleClick}
        >
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${game.color} p-4 h-36 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow active:scale-[0.97] transform`}>
            {/* Emoji background decoration */}
            <div className="absolute bottom-2 right-2 text-5xl opacity-20 select-none">
              {game.emoji}
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">{game.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-display font-bold text-base leading-tight">
                  {game.name}
                </h3>
                <p className="text-white/70 text-xs mt-0.5 line-clamp-2">
                  {game.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/60 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                {game.players}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      <Dialog open={showOnlineDialog} onOpenChange={setShowOnlineDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-center text-xl">
              {game.emoji} {game.name} Online
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full h-14 rounded-2xl font-display text-base bg-gradient-to-r from-primary to-primary/80"
            >
              🏠 Crear sala nueva
            </Button>
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o únete con código</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Input
              placeholder="Código de sala (6 caracteres)"
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase().slice(0, 6)); setError(''); }}
              className="text-center text-xl font-mono tracking-[0.3em] h-14 rounded-xl uppercase"
              maxLength={6}
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <Button
              onClick={handleJoin}
              disabled={joinCode.length !== 6 || loading}
              variant="outline"
              className="w-full h-12 rounded-2xl font-display border-2"
            >
              🚀 Unirse a sala
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}