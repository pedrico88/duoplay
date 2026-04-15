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
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            <span>{cat.emoji}</span>
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border text-sm font-medium min-h-[44px]"
          style={{ minWidth: 44 }}
        >
          <span>{active.emoji}</span>
          <span className="text-foreground">{active.name}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="font-display">Categoría</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all min-h-[48px] ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}