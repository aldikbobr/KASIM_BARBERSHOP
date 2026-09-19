import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/data';

interface HeaderProps {
  onBooking: () => void;
}

export default function Header({ onBooking }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="hdr fixed inset-x-0 top-0 z-50 backdrop-blur-[14px]">
      <div className="wrap flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-[0.28em] uppercase">
          <img src="/crest.png" alt="" className="h-8 w-8 shrink-0 object-contain" />
          Kasym
        </a>

        <nav className="hidden gap-9 text-[13px] tracking-[0.09em] uppercase text-[var(--muted)] md:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="nav-link hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onBooking} className="btn btn-gold">
            Записаться
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full flex flex-col bg-[rgba(7,7,7,0.97)] border-t border-b border-[var(--border)] px-6 md:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-[var(--border)] py-[18px] text-[15px] tracking-[0.12em] uppercase text-[var(--muted)] last:border-b-0 active:text-[var(--gold-soft)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
