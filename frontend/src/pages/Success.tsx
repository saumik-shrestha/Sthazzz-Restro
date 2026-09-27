import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, LoaderCircle, ArrowLeft } from "lucide-react";
import { api, npr } from "../lib/api";
import { Header } from "../components/Header";
export default function Success() {
  const [params] = useSearchParams();
  const pidx = params.get("pidx");
  const orderId = params.get("order_id") || localStorage.getItem("lastOrder");
  const demo = params.get("demo") === "1";
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!orderId) return;
    if (demo) {
      api
        .get(`/orders/${orderId}`)
        .then((r) => setData(r.data.data))
        .catch(() => setErr("Order not found"));
      return;
    }
    if (pidx) {
      api
        .get(`/payment/khalti/verify?pidx=${encodeURIComponent(pidx)}`)
        .then(() => api.get(`/orders/${orderId}`))
        .then((r) => setData(r.data.data))
        .catch(() =>
          setErr(
            "We could not verify the payment yet. Please retry in a moment.",
          ),
        );
    } else
      api
        .get(`/orders/${orderId}`)
        .then((r) => setData(r.data.data))
        .catch(() => setErr("Order not found"));
  }, [pidx, orderId, demo]);
  return (
    <div className="min-h-screen bg-cream">
      <Header onCart={() => {}} />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-stone-600"
        >
          <ArrowLeft size={16} /> Back to Nepal Bhoj
        </Link>
        {!data && !err ? (
          <div>
            <LoaderCircle
              className="mx-auto animate-spin text-saffron"
              size={42}
            />
            <p className="mt-4 text-stone-600">Confirming your order…</p>
          </div>
        ) : err ? (
          <div className="rounded-3xl bg-white p-8">
            <h1 className="font-serif text-3xl font-black text-earth">
              Payment status unavailable
            </h1>
            <p className="mt-3 text-stone-600">{err}</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <CheckCircle2 className="mx-auto text-green-600" size={64} />
            <div className="mt-5 text-xs font-black uppercase tracking-[.25em] text-saffron">
              Order confirmed
            </div>
            <h1 className="mt-2 font-serif text-4xl font-black text-earth">
              Dhanyabad, {data.customer.name.split(" ")[0]}!
            </h1>
            <p className="mt-3 text-stone-600">
              Your {data.status === "paid" ? "paid" : "demo"} order is in our
              kitchen queue.
            </p>
            <div className="mt-7 rounded-2xl bg-cream p-5 text-left">
              <div className="flex justify-between">
                <span className="text-stone-500">Order ID</span>
                <b className="font-mono text-xs text-earth">{data.id}</b>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-stone-500">Deliver to</span>
                <b>{data.customer.city}</b>
              </div>
              <div className="mt-3 flex justify-between text-lg">
                <span className="text-stone-500">Total</span>
                <b className="text-saffron">{npr(data.total)}</b>
              </div>
            </div>
            <Link
              to="/"
              className="mt-7 inline-block rounded-full bg-earth px-6 py-3 font-bold text-white"
            >
              Order something else
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
