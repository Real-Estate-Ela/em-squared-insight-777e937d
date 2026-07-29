import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Mail, User, MessageCircle, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/Reveal";

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

const subjects = [
  "Genel bilgi",
  "Veri entegrasyonu",
  "Kurumsal erişim",
  "API talebi",
  "Hata bildirimi",
] as const;

function Contact() {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState(subjects[0]);

  if (sent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <Reveal>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-positive/10">
              <CheckCircle2 className="h-8 w-8 text-positive" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Mesajınız alındı</h2>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              En kısa sürede size dönüş yapacağız. Genellikle 1 iş günü
              içinde yanıtlıyoruz.
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div>
      <section
        style={{
          background:
            "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <p className="label-mono">İletişim</p>
            <h1 className="mt-5 max-w-2xl text-4xl leading-[1.08] md:text-5xl">
              Bize ulaşın
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Sorularınız, önerileriniz veya iş birliği talepleriniz için
              formu doldurun.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_320px] md:px-8 md:py-20">
          <Reveal>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ad"
                    className="mb-2 block text-sm font-medium"
                  >
                    Ad Soyad
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      id="ad"
                      type="text"
                      required
                      placeholder="Adınız Soyadınız"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="eposta"
                    className="mb-2 block text-sm font-medium"
                  >
                    E-posta
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      id="eposta"
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">Konu</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`rounded-lg px-3.5 py-2 text-sm transition-all duration-200 ${
                        subject === s
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="mesaj"
                  className="mb-2 block text-sm font-medium"
                >
                  Mesaj
                </label>
                <div className="rounded-lg border border-border bg-background px-4 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <div className="flex gap-3">
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <textarea
                      id="mesaj"
                      rows={5}
                      required
                      placeholder="Mesajınızı buraya yazın..."
                      className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                Gönder
              </button>
            </form>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold">E-posta</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  destek@emlakmetric.com
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold">Entegrasyon Durumu</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { name: "sahibinden.com", active: true },
                    { name: "hepsiemlak.com", active: true },
                    { name: "emlakjet.com", active: true },
                    { name: "TKGM parsel verisi", active: false },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {s.name}
                      </span>
                      <span
                        className={`status-pill text-xs ${
                          s.active
                            ? "bg-positive/10 text-positive"
                            : "bg-risk/10 text-risk"
                        }`}
                      >
                        <span className="status-dot" />
                        {s.active ? "Aktif" : "Kesintili"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
