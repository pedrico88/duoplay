import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '@/lib/gameData';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ChevronDown } from 'lucide-react';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

export default function CategoryPicker({ activeCategory, onChange }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const active = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  // ── Desktop: pill row ──────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div role="tablist" aria-label="Categorías de juegos" className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            <span aria-hidden="true">{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>
    );
  }

  // ── Mobile: bottom-sheet Drawer ────────────────────────────────────────────
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          aria-haspopup="listbox"
          aria-label={`Categoría: ${active.name}. Toca para cambiar`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border-2 border-border text-sm font-semibold min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">{active.emoji}</span>
          <span className="text-foreground">{active.name}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" aria-hidden="true" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="font-display">Categoría</DrawerTitle>
        </DrawerHeader>
        <div role="listbox" aria-label="Categorías de juegos" className="px-4 pb-8 grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="option"
              aria-selected={activeCategory === cat.id}
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={`flex items-center gap-2 px-4 py-4 rounded-2xl text-sm font-semibold transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-foreground hover:bg-muted/70 active:bg-muted'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}