import { ShoppingBag, MapPin, Phone, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
export function Header({ onCart }: { onCart: () => void }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-earth/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <a href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-saffron text-xl font-bold text-earth">
            S
          </div>
          <div>
            <div className="font-serif text-xl font-bold text-cream">
              Sthazzz Restro
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300">
              Taste the authentic food
            </div>
          </div>
        </a>
        <div className="hidden items-center gap-5 text-sm text-stone-200 md:flex">
          <span className="flex items-center gap-1">
            <MapPin size={15} />
            Kathmandu · Pokhara
          </span>
          <span className="flex items-center gap-1">
            <Phone size={15} />
            01-1234567
          </span>
        </div>
        <button
          onClick={onCart}
          className="relative rounded-full border border-white/15 bg-white/5 p-3 text-cream hover:bg-white/10"
        >
          <ShoppingBag size={20} />
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-nepalRed text-[11px] font-bold text-white"
            >
              {count}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
}
export function CTA() {
  return (
    <a
      href="#menu"
      className="inline-flex items-center gap-2 font-semibold text-saffron hover:text-amber-300"
    >
      Explore menu <ChevronRight size={18} />
    </a>
  );
}
