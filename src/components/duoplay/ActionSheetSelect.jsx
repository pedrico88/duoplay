/**
 * ActionSheetSelect
 * A native-style single-select that opens as a bottom sheet (Drawer).
 * Replaces any native <select> or ad-hoc button groups with a consistent,
 * accessible picker pattern.
 *
 * Props:
 *   value        — currently selected value
 *   onChange     — (value) => void
 *   options      — Array<{ value, label, description? }>
 *   trigger      — ReactNode — the element that opens the sheet
 *   title?       — sheet heading (optional)
 *   disabled?    — boolean
 */
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

export default function ActionSheetSelect({ value, onChange, options, trigger, title, disabled }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger — real <button> for correct keyboard/screen-reader semantics */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={title}
        onClick={() => setOpen(true)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl w-full text-left"
      >
        {trigger}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          {title && (
            <DrawerHeader>
              <DrawerTitle className="font-display text-center">{title}</DrawerTitle>
            </DrawerHeader>
          )}
          <div
            role="listbox"
            aria-label={title}
            className="px-4 pb-8 pt-2 flex flex-col gap-2"
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between w-full px-4 py-4 rounded-2xl border-2 transition-all min-h-[56px] text-left ${
                    selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/60 active:bg-muted'
                  }`}
                >
                  <div>
                    <p className={`font-display font-bold text-base ${selected ? 'text-primary' : ''}`}>
                      {opt.label}
                    </p>
                    {opt.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                    )}
                  </div>
                  {selected && <Check className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}