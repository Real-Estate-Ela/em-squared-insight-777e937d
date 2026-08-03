export const tr = {
  nav: {
    home: "Ana Sayfa",
    packages: "Paketler",
    about: "Hakkımızda",
    contact: "İletişim",
    analyse: "Analiz Et",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    menu: "Menü",
  },
  pricing: {
    title: "Paketler",
    subtitle: "İhtiyacınıza uygun planı seçin",
    metaTitle: "Paketler — emlakmetric",
    metaDescription:
      "emlakmetric paketlerini karşılaştırın. Ücretsiz, Pro ve Enterprise planları ile gayrimenkul analiz ihtiyaçlarınızı karşılayın.",
    badge: "En çok tercih edilen",
    analysisQuota: "Aylık analiz",
    reportQuota: "Aylık rapor indirme",
    currentPlan: "Mevcut planınız",
    upgrade: "Yükselt",
    getStarted: "Başla",
    contactSales: "İletişime geç",
    free: "Ücretsiz",
    perMonth: "/ ay",
  },
  usage: {
    heading: "Kullanım",
    analysis: "Analiz",
    report: "Rapor indirme",
    used: "kullanıldı",
    of: "/",
    unlimited: "Sınırsız",
    periodEnds: "Dönem bitiş",
    viewPlans: "Paketleri gör",
  },
  quota: {
    analysisExhausted: "Bu dönemki analiz hakkınız doldu.",
    reportExhausted: "Bu dönemki rapor indirme hakkınız doldu.",
    viewPlans: "Paketleri incele",
  },
} as const;

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

export type Dictionary = DeepStringify<typeof tr>;
