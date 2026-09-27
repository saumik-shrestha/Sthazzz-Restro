import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartItem, MenuItem } from "../lib/api";
type CartCtx = {
  items: CartItem[];
  add: (i: MenuItem) => void;
  change: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
};
const C = createContext<CartCtx | null>(null);
const KEY = "nepal-bhoj-cart";
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  const add = (i: MenuItem) =>
    setItems((x) => {
      const found = x.find((a) => a.id === i.id);
      return found
        ? x.map((a) =>
            a.id === i.id
              ? { ...a, quantity: Math.min(20, a.quantity + 1) }
              : a,
          )
        : [...x, { ...i, quantity: 1 }];
    });
  const change = (id: string, q: number) =>
    setItems((x) =>
      q < 1
        ? x.filter((a) => a.id !== id)
        : x.map((a) => (a.id === id ? { ...a, quantity: Math.min(20, q) } : a)),
    );
  const remove = (id: string) => setItems((x) => x.filter((a) => a.id !== id));
  const clear = () => setItems([]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );
  const delivery = subtotal === 0 ? 0 : subtotal >= 2000 ? 0 : 120;
  const total = subtotal + delivery;
  return (
    <C.Provider
      value={{
        items,
        add,
        change,
        remove,
        clear,
        count: items.reduce((s, i) => s + i.quantity, 0),
        subtotal,
        delivery,
        total,
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useCart = () => {
  const c = useContext(C);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
