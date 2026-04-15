/**
 * ExitGameDrawer — bottom-sheet confirmation shown when the user
 * tries to leave an active game via the back button.
 */
import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

export default function ExitGameDrawer({ open, onOpenChange, onConfirm }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="font-display text-center text-lg">¿Salir del juego?</DrawerTitle>
        </DrawerHeader>
        <p className="px-6 pb-2 text-center text-muted-foreground text-sm">
          Se perderá el progreso de la partida actual.
        </p>
        <div className="flex gap-3 px-6 pb-10 pt-4">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl h-12 text-base"
            onClick={() => onOpenChange(false)}
          >
            Seguir jugando
          </Button>
          <Button
            className="flex-1 rounded-2xl h-12 text-base bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={onConfirm}
          >
            Salir
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}