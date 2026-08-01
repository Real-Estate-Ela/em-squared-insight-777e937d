import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "tr" | "en";

const tr = {
  "nav.home": "Ana Sayfa",
  "nav.about": "Hakkımızda",
  "nav.contact": "İletişim",
  "nav.analyze": "Analiz Et",
  "nav.register": "Kayıt Ol",

  "hero.line1": "Emlak verilerini",
  "hero.highlight": "tek ekranda",
  "hero.line2": "analiz edin.",
  "hero.sub": "Konut, arsa ve ticari mülk için kapsamlı piyasa analizi, çevre değerlendirmesi ve risk skoru.",
  "hero.cta": "Hemen Başla",

  "stats.analyzed": "Analiz edilen mülk",
  "stats.districts": "İlçe kapsama",
  "stats.accuracy": "Ortalama doğruluk",
  "stats.users": "Aktif kullanıcı",

  "analysis.label": "Analiz",
  "analysis.title": "İlan linkini yapıştır",
  "analysis.sub": "Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan linki.",
  "analysis.placeholder": "sahibinden.com / hepsiemlak / emlakjet ilan linki",
  "analysis.button": "Analiz Et",
  "analysis.running": "Analiz ediliyor",
  "analysis.step1": "İlan verisi çekiliyor",
  "analysis.step2": "Mahalle medyanı hesaplanıyor",
  "analysis.step3": "Kira çarpanı & amortisman",
  "analysis.step4": "Çevre analizi ve karar",
  "analysis.done": "Tamam",
  "analysis.active": "Çalışıyor...",
  "analysis.waiting": "Bekliyor",

  "decision.label": "Karar Raporu",
  "decision.title": "Analiz sonucu",
  "decision.positive": "Olumlu Karar",
  "decision.buy": "Al —",
  "decision.hold": "5 yıl tut",
  "decision.desc": "Bölge fiyat artışı son 24 ayda %38. İlan, mahalle medyanının %9 altında listelenmiş. Tek risk kalemi: yüksek arz yoğunluğu.",
  "decision.download": "Raporu indir",
  "decision.risks": "Riskleri gör",
  "decision.positive.short": "Olumlu Karar — Al, 5 yıl tut",
  "decision.risk.low": "Risk: Düşük",

  "metric.rent": "Kira getirisi",
  "metric.amort": "Amortisman",
  "metric.roi": "5 yıl ROI",
  "metric.supply": "Arz riski",

  "ba.label": "Öncesi / Sonrası",
  "ba.title": "Ataşehir — 24 aylık değişim",
  "ba.before": "Önce",
  "ba.after": "Şimdi",
  "ba.m2": "m² fiyat",
  "ba.rent": "Ortalama kira",
  "ba.sale": "Satış süresi",
  "ba.supply": "Arz (aktif ilan)",

  "comp.label": "Platform Karşılaştırması",
  "comp.title": "Aynı mülk, farklı platformlar",

  "slider.label": "Yakın Çevre",
  "slider.title": "Çevredeki arsa, konut ve dükkanlar",

  "bars.label": "Mahalle Kesiti",
  "bars.title": "Ataşehir — metrik dağılımı",

  "how.label": "Nasıl Çalışır?",
  "how.title": "3 adımda analiz raporu",
  "how.step1": "İlan linkini yapıştır",
  "how.step1.desc": "Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan linki.",
  "how.step2": "AI analiz etsin",
  "how.step2.desc": "Fiyat, kira getirisi, amortisman ve risk skoru saniyeler içinde.",
  "how.step3": "Analiz raporunu al",
  "how.step3.desc": "Detaylı analiz raporu ve piyasa değerlendirmesi.",

  "cta.line1": "Gayrimenkul kararlarınızı",
  "cta.highlight": "veriye",
  "cta.line2": "dayandırın.",
  "cta.sub": "İlan linkini yapıştırın, 20 saniyede piyasa analizi, çevre değerlendirmesi ve risk skorunu görün.",
  "cta.button": "Hemen Analiz Et",

  "footer.tagline": "Gayrimenkul analiz platformu.",
  "footer.disclaimer": "Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",

  "tab.konut": "Konut",
  "tab.arsa": "Arsa",
  "tab.ticari": "Dükkan/Ticari",

  "chart.m2.label": "m² fiyat trendi — 24 ay",
  "chart.sale.label": "Ortalama satış süresi (gün)",
  "chart.roi": "5 Yıl ROI",
  "chart.risk": "Risk Skoru",

  "bar.rent": "Kira getirisi",
  "bar.price": "Bölge fiyat artışı",
  "bar.liquidity": "Likidite (satış hızı)",
  "bar.supply": "Arz yoğunluğu",

  "meta.title": "emlakmetric — İlan linkiyle 20 saniyede gayrimenkul analizi",
  "meta.desc": "İlan linkini yapıştır; piyasa analizi, çevre değerlendirmesi ve risk skorunu saniyeler içinde gör. Konut, arsa ve ticari mülk için veri odaklı analiz.",
  "meta.og.title": "emlakmetric — Gayrimenkul analiz platformu",
  "meta.og.desc": "Piyasa analizi ve çevre değerlendirmesi 20 saniyede. Konut, arsa ve dükkan için kapsamlı analiz.",
} as const;

const en: Record<keyof typeof tr, string> = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.analyze": "Analyze",
  "nav.register": "Sign Up",

  "hero.line1": "Analyze property data",
  "hero.highlight": "on one screen",
  "hero.line2": "in seconds.",
  "hero.sub": "Comprehensive market analysis, neighborhood assessment and risk scoring for residential, land and commercial properties.",
  "hero.cta": "Get Started",

  "stats.analyzed": "Properties analyzed",
  "stats.districts": "District coverage",
  "stats.accuracy": "Average accuracy",
  "stats.users": "Active users",

  "analysis.label": "Analysis",
  "analysis.title": "Paste a listing link",
  "analysis.sub": "Any listing link from Sahibinden, Hepsiemlak or Emlakjet.",
  "analysis.placeholder": "sahibinden.com / hepsiemlak / emlakjet listing link",
  "analysis.button": "Analyze",
  "analysis.running": "Analyzing",
  "analysis.step1": "Fetching listing data",
  "analysis.step2": "Calculating neighborhood median",
  "analysis.step3": "Rent multiplier & amortization",
  "analysis.step4": "Environmental analysis & decision",
  "analysis.done": "Done",
  "analysis.active": "Running...",
  "analysis.waiting": "Waiting",

  "decision.label": "Decision Report",
  "decision.title": "Analysis result",
  "decision.positive": "Positive Decision",
  "decision.buy": "Buy —",
  "decision.hold": "hold 5 years",
  "decision.desc": "Regional price increase of 38% in the last 24 months. Listing is 9% below neighborhood median. Only risk: high supply density.",
  "decision.download": "Download report",
  "decision.risks": "View risks",
  "decision.positive.short": "Positive — Buy, hold 5 years",
  "decision.risk.low": "Risk: Low",

  "metric.rent": "Rent yield",
  "metric.amort": "Amortization",
  "metric.roi": "5yr ROI",
  "metric.supply": "Supply risk",

  "ba.label": "Before / After",
  "ba.title": "Atasehir — 24 month change",
  "ba.before": "Before",
  "ba.after": "Now",
  "ba.m2": "Price/m²",
  "ba.rent": "Average rent",
  "ba.sale": "Sale time",
  "ba.supply": "Supply (active listings)",

  "comp.label": "Platform Comparison",
  "comp.title": "Same property, different platforms",

  "slider.label": "Nearby",
  "slider.title": "Nearby land, housing and commercial",

  "bars.label": "Neighborhood",
  "bars.title": "Atasehir — metric distribution",

  "how.label": "How It Works",
  "how.title": "Analysis report in 3 steps",
  "how.step1": "Paste the listing link",
  "how.step1.desc": "Any listing link from Sahibinden, Hepsiemlak or Emlakjet.",
  "how.step2": "Let AI analyze",
  "how.step2.desc": "Price, rent yield, amortization and risk score in seconds.",
  "how.step3": "Get the analysis report",
  "how.step3.desc": "Detailed analysis report and market assessment.",

  "cta.line1": "Base your real estate decisions",
  "cta.highlight": "on data",
  "cta.line2": "not assumptions.",
  "cta.sub": "Paste a listing link and see market analysis, neighborhood assessment and risk score in 20 seconds.",
  "cta.button": "Analyze Now",

  "footer.tagline": "Real estate analytics platform.",
  "footer.disclaimer": "Data is for informational purposes only, not investment advice.",

  "tab.konut": "Residential",
  "tab.arsa": "Land",
  "tab.ticari": "Commercial",

  "chart.m2.label": "Price/m² trend — 24 months",
  "chart.sale.label": "Average sale time (days)",
  "chart.roi": "5yr ROI",
  "chart.risk": "Risk Score",

  "bar.rent": "Rent yield",
  "bar.price": "Regional price growth",
  "bar.liquidity": "Liquidity (sale speed)",
  "bar.supply": "Supply density",

  "meta.title": "emlakmetric — Real estate analysis in 20 seconds",
  "meta.desc": "Paste a listing link; see market analysis, neighborhood assessment and risk score in seconds. Data-driven analytics for residential, land and commercial properties.",
  "meta.og.title": "emlakmetric — Real estate analytics platform",
  "meta.og.desc": "Market analysis and neighborhood assessment in 20 seconds. Comprehensive analytics for all property types.",
};

export type TranslationKey = keyof typeof tr;

const dicts: Record<Locale, Record<TranslationKey, string>> = { tr, en };

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
};

const Ctx = createContext<I18nCtx>({
  locale: "tr",
  setLocale: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "tr";
    const stored = localStorage.getItem("emlakmetric-locale");
    if (stored === "en" || stored === "tr") return stored;
    return navigator.language.startsWith("en") ? "en" : "tr";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("emlakmetric-locale", l);
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => dicts[locale][key] ?? key,
    [locale],
  );

  return <Ctx value={{ locale, setLocale, t }}>{children}</Ctx>;
}

export function useI18n() {
  return useContext(Ctx);
}

export function useT() {
  return useContext(Ctx).t;
}
