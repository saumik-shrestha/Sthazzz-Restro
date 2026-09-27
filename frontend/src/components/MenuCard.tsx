import { motion } from "framer-motion";
import { Plus, Flame, Leaf } from "lucide-react";
import { MenuItem, npr } from "../lib/api";
import { useCart } from "../context/CartContext";
export function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {item.dietary_tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-700"
            >
              {t}
            </span>
          ))}
        </div>
        {item.spicy_level >= 3 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-earth/80 px-2.5 py-1 text-[10px] font-bold text-amber-200">
            <Flame size={12} /> spicy
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-[.15em] text-saffron">
          {item.category_name}
        </div>
        <h3 className="font-serif text-xl font-bold text-earth">{item.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-stone-600">
          {item.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-black text-earth">
            {npr(item.price)}
          </span>
          <button
            onClick={() => add(item)}
            className="inline-flex items-center gap-2 rounded-full bg-earth px-4 py-2.5 text-sm font-bold text-white transition hover:bg-nepalRed"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
