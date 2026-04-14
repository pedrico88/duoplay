import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Trash2, Moon, Sun, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGame } from '@/lib/gameContext.jsx';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const { isDark, setIsDark, updateProfile } = useGame();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const handleDeleteData = async () => {
    localStorage.removeItem('duoplay_profile');
    updateProfile({ nickname: '', avatar: '😎', wins: 0, losses: 0, gamesPlayed: 0, gameStats: {} });
    setShowDeleteDialog(false);
    try {
      await base44.auth.deleteAccount();
    } catch (e) {
      base44.auth.logout('/');
    }
  };

  const sections = [
    {
      title: 'Preferencias',
      items: [
        {
          icon: isDark ? Sun : Moon,
          label: isDark ? 'Modo claro' : 'Modo oscuro',
          description: 'Cambiar apariencia',
          action: () => setIsDark(!isDark),
          color: 'text-accent',
          bg: 'bg-accent/10',
        },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        {
          icon: LogOut,
          label: 'Cerrar sesión',
          description: 'Salir de tu cuenta',
          action: () => setShowLogoutDialog(true),
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          icon: Trash2,
          label: 'Eliminar cuenta',
          description: 'Borra cuenta y todos los datos',
          action: () => setShowDeleteDialog(true),
          color: 'text-destructive',
          bg: 'bg-destructive/10',
        },
      ],
    },
    {
      title: 'Información',
      items: [
        {
          icon: Info,
          label: 'Versión',
          description: 'DúoPlay v1.0',
          action: null,
          color: 'text-muted-foreground',
          bg: 'bg-muted',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold"
        >
          ⚙️ Ajustes
        </motion.h1>
        <p className="text-muted-foreground text-sm mt-1">Configura tu experiencia</p>
      </div>

      {/* Sections */}
      <div className="px-4 space-y-6">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {section.items.map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <div className="h-px bg-border mx-4" />}
                  <button
                    onClick={item.action || undefined}
                    disabled={!item.action}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors disabled:opacity-100 disabled:cursor-default"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {item.action && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-center">¿Cerrar sesión?</DialogTitle>
          </DialogHeader>
          <div className="text-center text-muted-foreground text-sm mb-4">
            Tendrás que volver a iniciar sesión para acceder a DúoPlay.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleLogout} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90">
              Cerrar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Data Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Eliminar datos
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-muted-foreground text-sm mb-4">
            Se eliminará tu cuenta y todos los datos permanentemente. Esta acción <strong>no se puede deshacer</strong>.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleDeleteData} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90">
              Eliminar todo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}