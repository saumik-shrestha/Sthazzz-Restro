import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, LoaderCircle } from "lucide-react";
import { api, npr } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Header } from "../components/Header";
export default function Checkout() {
  const c = useCart();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Kathmandu",
    email: "",
  });
  if (c.items.length === 0)
    return (
      <>
        <Header onCart={() => {}} />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-black text-earth">
            Your Bhoj is empty
          </h1>
          <Link to="/" className="mt-4 inline-block text-nepalRed font-bold">
            Back to menu
          </Link>
        </main>
      </>
    );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const o = await api.post("/orders", {
        customer: form,
        payment_method: "khalti",
        items: c.items.map((i) => ({
          menu_item_id: i.id,
          quantity: i.quantity,
        })),
      });
      const orderId = o.data.data.id;
      if (demo) {
        await api.post("/demo/pay", { order_id: orderId }).catch(() => {});
        localStorage.setItem("lastOrder", orderId);
        c.clear();
        nav(`/payment/success?order_id=${orderId}&demo=1`);
        return;
      }
      const p = await api.post("/payment/khalti/initiate", {
        order_id: orderId,
      });
      localStorage.setItem("lastOrder", orderId);
      c.clear();
      window.location.href = p.data.data.payment_url;
    } catch (x: any) {
      setErr(
        x?.response?.data?.error ||
          "Unable to place order. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-cream">
      <Header onCart={() => {}} />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-earth"
        >
          <ArrowLeft size={16} /> Back to menu
        </Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
          <form
            onSubmit={submit}
            className="rounded-3xl bg-white p-6 shadow-sm md:p-8"
          >
            <div className="text-xs font-black uppercase tracking-[.25em] text-saffron">
              Checkout
            </div>
            <h1 className="mt-2 font-serif text-4xl font-black text-earth">
              Bring the feast home.
            </h1>
            <p className="mt-2 text-stone-600">
              We currently deliver to Kathmandu and Pokhara.
            </p>
            {err && (
              <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                {err}
              </div>
            )}
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
              <Field
                label="Phone number"
                placeholder="98XXXXXXXX"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                required
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-bold text-earth">
                  City
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3 outline-none focus:border-saffron"
                  >
                    <option>Kathmandu</option>
                    <option>Pokhara</option>
                  </select>
                </label>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Delivery address"
                  placeholder="Ward, tole, street / landmark"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
              </div>
            </div>
            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={demo}
                  onChange={(e) => setDemo(e.target.checked)}
                  className="mt-1 accent-red-600"
                />
                <span>
                  <b className="text-earth">Local demo payment</b>
                  <span className="block text-sm text-stone-600">
                    Use this to test the full order flow without a Khalti key.
                    Turn it off for real sandbox checkout.
                  </span>
                </span>
              </label>
            </div>
            <button
              disabled={busy}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-nepalRed px-5 py-4 font-bold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <LoaderCircle className="animate-spin" size={19} />{" "}
                  Processing…
                </>
              ) : demo ? (
                "Place demo order"
              ) : (
                "Continue to Khalti"
              )}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck size={14} /> Secure server-side order total
            </div>
          </form>
          <aside className="h-fit rounded-3xl bg-earth p-6 text-cream shadow-xl">
            <div className="text-xs font-black uppercase tracking-[.25em] text-amber-300">
              Your order
            </div>
            <div className="mt-5 space-y-4">
              {c.items.map((i) => (
                <div key={i.id} className="flex justify-between gap-4 text-sm">
                  <span>
                    {i.quantity} × {i.name}
                  </span>
                  <b>{npr(i.price * i.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="my-6 border-t border-white/10" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-300">Subtotal</span>
                <span>{npr(c.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-300">Delivery</span>
                <span>{c.delivery ? npr(c.delivery) : "Free"}</span>
              </div>
              <div className="mt-3 flex justify-between text-2xl font-black">
                <span>Total</span>
                <span className="text-amber-300">{npr(c.total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-earth">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-stone-200 p-3 outline-none placeholder:text-stone-400 focus:border-saffron"
      />
    </label>
  );
}
