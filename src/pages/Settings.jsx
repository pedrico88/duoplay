import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Trash2, Moon, Sun, Info, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useGame } from '@/lib/gameContext.jsx';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const { isDark, setIsDark, updateProfile } = useGame();
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showLogoutDrawer, setShowLogoutDrawer] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    // Small delay so the spinner renders before the redirect
    await new Promise(r => setTimeout(r, 200));
    base44.auth.logout('/');
  };

  const handleDeleteData = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      localStorage.removeItem('duoplay_profile');
      updateProfile({ nickname: '', avatar: '😎', wins: 0, losses: 0, gamesPlayed: 0, gameStats: {} });
      await base44.auth.deleteAccount();
    } catch (e) {
      try {
        base44.auth.logout('/');
      } catch {
        setDeleteError('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
        setDeleting(false);
        return;
      }
    }
    setShowDeleteDrawer(false);
    setDeleting(false);
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
          action: () => setShowLogoutDrawer(true),
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          icon: Trash2,
          label: 'Eliminar cuenta',
          description: 'Borra cuenta y todos los datos',
          action: () => setShowDeleteDrawer(true),
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
                    aria-label={item.label}
                    className="w-full flex items-center gap-4 px-4 py-4 min-h-[56px] hover:bg-muted/50 transition-colors disabled:opacity-100 disabled:cursor-default"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {item.action && <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Logout Drawer ── */}
      <Drawer open={showLogoutDrawer} onOpenChange={setShowLogoutDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-display text-center">¿Cerrar sesión?</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 text-center text-muted-foreground text-sm">
            Tendrás que volver a iniciar sesión para acceder a DúoPlay.
          </div>
          <div className="flex gap-3 px-4 pb-8 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDrawer(false)}
              disabled={loggingOut}
              className="flex-1 rounded-xl h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-1 rounded-xl h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Delete Account Drawer ── */}
      <Drawer open={showDeleteDrawer} onOpenChange={setShowDeleteDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-display text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
              Eliminar datos
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 text-center text-muted-foreground text-sm">
            Se eliminará tu cuenta y todos los datos permanentemente.{' '}
            <strong>Esta acción no se puede deshacer.</strong>
          </div>
          {deleteError && (
            <p className="px-4 text-center text-sm text-destructive font-medium" role="alert">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3 px-4 pb-8 pt-4">
            <Button
              variant="outline"
              onClick={() => { setShowDeleteDrawer(false); setDeleteError(null); }}
              disabled={deleting}
              className="flex-1 rounded-xl h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteData}
              disabled={deleting}
              className="flex-1 rounded-xl h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              {deleting ? 'Eliminando…' : 'Eliminar todo'}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}