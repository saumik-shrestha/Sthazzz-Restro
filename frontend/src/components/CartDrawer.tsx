import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { npr } from "../lib/api";
import { useNavigate } from "react-router-dom";
export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const c = useCart();
  const nav = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-200 p-5">
              <div>
                <div className="font-serif text-2xl font-bold text-earth">
                  Your Bhoj
                </div>
                <div className="text-xs text-stone-500">
                  {c.count} item{c.count !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-stone-100"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {c.items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <ShoppingBag
                      className="mx-auto mb-3 text-stone-300"
                      size={48}
                    />
                    <h3 className="font-serif text-xl font-bold text-earth">
                      Your plate is empty
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      Add a few Nepali favorites to get started.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {c.items.map((i) => (
                    <div
                      key={i.id}
                      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm"
                    >
                      <img
                        src={i.image_url}
                        alt=""
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-earth">{i.name}</div>
                        <div className="text-sm font-semibold text-saffron">
                          {npr(i.price)}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => c.change(i.id, i.quantity - 1)}
                            className="rounded-full bg-stone-100 p-1"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center text-sm font-bold">
                            {i.quantity}
                          </span>
                          <button
                            onClick={() => c.change(i.id, i.quantity + 1)}
                            className="rounded-full bg-stone-100 p-1"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => c.remove(i.id)}
                            className="ml-auto text-stone-400 hover:text-nepalRed"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {c.items.length > 0 && (
              <div className="border-t border-stone-200 bg-white p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <b>{npr(c.subtotal)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <b>{c.delivery === 0 ? "Free" : npr(c.delivery)}</b>
                  </div>
                  <div className="mt-3 flex justify-between text-xl font-black text-earth">
                    <span>Total</span>
                    <span>{npr(c.total)}</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Free delivery on orders above Rs. 2,000.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    nav("/checkout");
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-nepalRed px-5 py-3.5 font-bold text-white hover:bg-red-500"
                >
                  Go to Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
