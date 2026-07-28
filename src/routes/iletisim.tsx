import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric ekibine ulaşın: veri entegrasyonu, kurumsal erişim ve API talepleri için iletişim formu.",
      },
      { property: "og:title", content: "İletişim — emlakmetric" },
      {
        property: "og:description",
        content: "Veri entegrasyonu ve kurumsal erişim talepleri için bize yazın.",
      },
    ],
  }),
  component: Contact,
});

const notices = [
  { no: "01", t: "sahibinden.com entegrasyonu", d: "İlan linki desteği", s: "Aktif", tone: "text-positive", soft: "bg-positive-soft" },
  { no: "02", t: "hepsiemlak entegrasyonu", d: "Fiyat serisi eşleşmesi", s: "Aktif", tone: "text-positive", soft: "bg-positive-soft" },
  { no: "03", t: "emlakjet entegrasyonu", d: "Mahalle medyanı", s: "Aktif", tone: "text-positive", soft: "bg-positive-soft" },
  { no: "04", t: "TKGM parsel verisi", d: "Arsa analizi genişletmesi", s: "Kesintili", tone: "text-risk", soft: "bg-risk-soft" },
];

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="label-mono">İletişim</p>
          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] md:text-5xl">
            Bize yazın.
          </h1>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-6"
          >
            {[
              { id: "ad", label: "ad soyad", type: "text" },
              { id: "eposta", label: "e-posta", type: "email" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="label-mono block">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  required
                  className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            ))}
            <div>
              <label htmlFor="mesaj" className="label-mono block">
                mesaj
              </label>
              <textarea
                id="mesaj"
                rows={5}
                required
                className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Gönder
            </button>
            {sent && (
              <p className="status-pill bg-positive-soft text-positive">
                <span className="status-dot" />
                Mesajınız alındı. 1 iş günü içinde dönüş yapılır.
              </p>
            )}
          </form>

          <div>
            <p className="label-mono">Veri Entegrasyon Duyuruları</p>
            <div className="mt-6">
              {notices.map((n) => (
                <div
                  key={n.no}
                  className="flex items-center justify-between gap-6 border-t border-border py-4 last:border-b"
                >
                  <div className="min-w-0">
                    <p className="text-sm">{n.t}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.d}</p>
                  </div>
                  <span className={`status-pill shrink-0 ${n.soft} ${n.tone}`}>
                    <span className="status-dot" />
                    {n.s}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              destek@emlakmetric.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
