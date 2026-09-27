import { motion } from "framer-motion";
import { ArrowRight, UtensilsCrossed, Clock3 } from "lucide-react";
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-earth">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(217,119,6,.24),transparent_35%),linear-gradient(110deg,#211711_20%,rgba(33,23,17,.66)),url('https://res.cloudinary.com/images-swotahtravel-com/image/upload/f_auto,q_auto,w_900/v1695272285/blog%20images/sasa_restaurant.jpg')] bg-cover bg-center" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-earth/50 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-amber-300 backdrop-blur">
            <span>✦</span> घरको स्वाद · Crafted daily
          </div>
          <h1 className="font-serif text-5xl font-black leading-[.95] text-cream md:text-7xl">
            Heritage on <span className="text-amber-300">every plate.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-200">
            From soulful Thakali dal-bhat to fiery choila and jhol momos,
            discover Nepal's comfort food — prepared with local ingredients and
            old-school care.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full bg-nepalRed px-6 py-3.5 font-bold text-white shadow-lg shadow-red-950/30 hover:bg-red-500"
            >
              Order Thakali Set <ArrowRight size={18} />
            </a>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-bold text-cream backdrop-blur hover:bg-white/15"
            >
              Explore Newari Feast
            </a>
          </div>
          <div className="mt-10 flex gap-6 text-sm text-stone-300">
            <span className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-saffron" /> Fresh to
              order
            </span>
            <span className="flex items-center gap-2">
              <Clock3 size={16} className="text-saffron" /> 30–45 min
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
