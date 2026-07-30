import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { MouseCard } from "@/components/MouseCard";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric, gayrimenkul yatırımlarında şeffaf, veri odaklı ve yapay zeka destekli analiz sunan bir karar terminalidir.",
      },
      { property: "og:title", content: "Hakkımızda — emlakmetric" },
      {
        property: "og:description",
        content: "Şeffaf, veri odaklı ve yapay zeka destekli gayrimenkul analizi.",
      },
    ],
  }),
  component: About,
});

const principles = [
  {
    no: "01",
    title: "Şeffaf metodoloji",
    body: "Her sayı kaynağıyla birlikte gelir. Kira getirisi, amortisman ve ROI hesaplarının formülü kullanıcıya açıktır.",
  },
  {
    no: "02",
    title: "Veri odaklı karar",
    body: "İlan fiyatı tek başına anlam taşımaz. Mahalle medyanı, 24 aylık fiyat serisi ve çevre arzı birlikte değerlendirilir.",
  },
  {
    no: "03",
    title: "Tüm mülk tipleri",
    body: "Konut, arsa, dükkan ve ticari mülk aynı finansal çerçevede modellenir; her tip için ayrı risk katsayısı uygulanır.",
  },
  {
    no: "04",
    title: "Yapay zeka desteği",
    body: "İlan metni, konum ve piyasa verisi birlikte yorumlanır; çıktı tek bir net karar cümlesine indirgenir.",
  },
];

const stats = [
  { k: "analiz edilen ilan", v: "1.2M+" },
  { k: "kapsanan mahalle", v: "18.400" },
  { k: "ortalama analiz süresi", v: "20 sn" },
  { k: "veri kaynağı", v: "3 platform" },
];

function About() {
  return (
    <div style={{ background: "linear-gradient(180deg, var(--page-about) 0%, var(--background) 40%)" }}>
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-warm) 0%, transparent 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal variant="blur">
            <p className="label-mono flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--amber)" }} />
              Hakkımızda
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] md:text-5xl">
              Gayrimenkul kararı sezgiyle değil,{" "}
              <span className="bg-gradient-to-r from-amber to-positive bg-clip-text text-transparent">
                veriyle
              </span>{" "}
              verilir.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              emlakmetric bir emlak sitesi değil; bir analiz terminalidir. İlan
              linkini alır, mülkü finansal bir varlık gibi modeller ve tek bir
              karar üretir: al, bekle ya da geç.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.k} delay={i * 80} variant="scale">
                <MouseCard
                  className="rounded-xl border border-border bg-card p-5 text-center shadow-sm"
                  glowColor="var(--amber)"
                  tiltMax={8}
                  glowOpacity={0.06}
                >
                  <p className="font-display text-3xl font-bold tracking-tight" style={{ color: "var(--amber)" }}>
                    {s.v}
                  </p>
                  <p className="label-mono mt-2">{s.k}</p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-left">
            <p className="label-mono">İlkelerimiz</p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.no} delay={i * 100} variant="scale">
                <MouseCard
                  className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
                  glowColor={i % 2 === 0 ? "var(--primary)" : "var(--positive)"}
                  tiltMax={6}
                  glowOpacity={0.06}
                >
                  <p className="label-mono text-primary">{p.no}</p>
                  <h2 className="mt-3 text-xl">{p.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
