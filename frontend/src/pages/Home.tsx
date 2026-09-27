import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, Category, MenuItem } from "../lib/api";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { MenuCard } from "../components/MenuCard";
import { CartDrawer } from "../components/CartDrawer";
import { MapPin, Heart, ShieldCheck, ArrowUpRight } from "lucide-react";
export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [cat, setCat] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get("/menu"), api.get("/categories")])
      .then(([m, c]) => {
        setItems(m.data.data);
        setCats(c.data.data);
      })
      .finally(() => setLoading(false));
  }, []);
  const shown =
    cat === "all" ? items : items.filter((i) => i.category_id === cat);
  return (
    <div className="min-h-screen bg-cream">
      <Header onCart={() => setCartOpen(true)} />
      <Hero />
      <section id="menu" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[.25em] text-saffron">
              Our menu
            </div>
            <h2 className="mt-2 font-serif text-4xl font-black text-earth md:text-5xl">
              Built around the classics.
            </h2>
            <p className="mt-2 max-w-2xl text-stone-600">
              Comforting recipes, bold achar, smoky grills and the generous
              spirit of a Nepali table.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-earth p-4 text-right text-cream md:block">
            <div className="text-xs uppercase tracking-widest text-amber-300">
              Today at Nepal Bhoj
            </div>
            <div className="mt-1 font-serif text-lg">Order by 9:15 PM</div>
          </div>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", name: "All dishes" },
            ...cats.map((c) => ({ id: c.id, name: c.name })),
          ].map((x) => (
            <button
              key={x.id}
              onClick={() => setCat(x.id)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${cat === x.id ? "bg-nepalRed text-white" : "bg-white text-earth ring-1 ring-stone-200 hover:ring-saffron"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="grid place-items-center py-24 text-stone-500">
            Loading today's bhoj…
          </div>
        ) : (
          <motion.div
            layout
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {shown.map((i) => (
              <MenuCard item={i} key={i.id} />
            ))}
          </motion.div>
        )}{" "}
      </section>
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-3 md:px-6">
          <Feature
            icon={<Heart />}
            title="Made with sanskar"
            text="Recipes inspired by the kitchens of Kathmandu, Mustang and the Terai."
          />
          <Feature
            icon={<ShieldCheck />}
            title="Simple, trusted checkout"
            text="Your order totals are calculated securely by the Go backend before payment."
          />
          <Feature
            icon={<MapPin />}
            title="Kathmandu · Pokhara"
            text="Freshly packed and delivered to selected neighborhoods in both cities."
          />
        </div>
      </section>
      <footer className="bg-earth px-4 py-12 text-stone-300">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-serif text-2xl font-bold text-cream">
              Nepal Bhoj
            </div>
            <div className="mt-1 text-sm">घरको स्वाद, जहाँ भए पनि.</div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span>Instagram</span>
            <span>Contact</span>
            <span className="flex items-center gap-1">
              Kathmandu <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="rounded-2xl bg-amber-50 p-3 text-saffron">{icon}</div>
      <div>
        <h3 className="font-serif text-lg font-bold text-earth">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-stone-600">{text}</p>
      </div>
    </div>
  );
}
