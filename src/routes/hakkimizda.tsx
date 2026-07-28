import { createFileRoute } from "@tanstack/react-router";

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
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="label-mono">Hakkımızda</p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] md:text-5xl">
            Gayrimenkul kararı sezgiyle değil, veriyle verilir.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            emlakmetric bir emlak sitesi değil; bir analiz terminalidir. İlan
            linkini alır, mülkü finansal bir varlık gibi modeller ve tek bir
            karar üretir: al, bekle ya da geç.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="bg-background px-5 py-8 md:px-8">
              <p className="font-display text-3xl font-bold tracking-tight">
                {s.v}
              </p>
              <p className="label-mono mt-2">{s.k}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="label-mono">İlkelerimiz</p>
          <div className="mt-8 grid gap-px bg-border md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.no} className="bg-background p-6 md:p-8">
                <p className="label-mono text-primary">{p.no}</p>
                <h2 className="mt-3 text-xl">{p.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
