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
    monthlyAnalysisCount: "adet aylık analiz",
    monthlyReportCount: "adet aylık rapor indirme",
    planDescriptions: {
      free: "Platformu keşfedin. Gayrimenkul yatırım kararlarınızı veriye dayandırmaya bugün başlayın.",
      pro: "Aktif yatırımcılar için tasarlandı. Geniş analiz kapasitesi ve detaylı raporlarla hiçbir fırsatı kaçırmayın.",
      enterprise: "Gayrimenkul ofisleri ve portföy yöneticileri için. Ekip genelinde sınırsız analiz kapasitesi ve özel destek.",
    },
    planFeatures: {
      free: ["Temel yatırım analizi", "Kira getirisi hesaplama", "Çevre analizi raporu", "3 platformdan fiyat karşılaştırma"],
      pro: ["Tüm ücretsiz özellikler", "Detaylı PDF ve Excel raporları", "Bölge bazlı karşılaştırma", "Öncelikli e-posta desteği", "Gelişmiş risk analizi"],
      enterprise: ["Tüm Pro özellikler", "API erişimi", "Ekip hesapları ve yönetim paneli", "Dedike hesap yöneticisi", "Özel entegrasyonlar"],
    },
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
  auth: {
    loginRequired: "Analiz başlatmak için giriş yapın",
    loginToAnalyze: "Giriş Yap",
  },
  hero: {
    badge: "VERİ ODAKLI GAYRİMENKUL ANALİZİ",
    titleBefore: "Fiyat tek başına",
    titleHighlight: "bir şey söylemez.",
    subtitle: "Bir ilanın rakamları, ancak mahallesinin rakamlarıyla yan yana konduğunda anlam kazanır. Biz o karşılaştırmayı yapıyoruz.",
    ctaPrimary: "Analize Başla",
    ctaSecondary: "Nasıl Çalışır",
  },
  analysis: {
    scoreBreakdown: "Skor Kırılımı",
    partBase: "Taban",
    partPrice: "Fiyat konumu",
    partYield: "Kira getirisi",
    partMarket: "Piyasa & likidite",
    totalScore: "Toplam skor",
    mortgageVsRent: "Kredi Kirayı Karşılıyor mu?",
    downPayment: "Peşinat",
    term: "Vade",
    monthlyInterest: "Aylık faiz",
    monthlyPayment: "Aylık taksit",
    monthlyRent: "Aylık kira",
    rentCoverage: "Kira karşılama",
    totalPayment: "Toplam ödeme",
    timesPrice: "bedelin {x} katı",
    years: "yıl",
  },
} as const satisfies Dictionary;

export interface Dictionary {
  nav: {
    home: string;
    packages: string;
    about: string;
    contact: string;
    analyse: string;
    signIn: string;
    signUp: string;
    menu: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    metaTitle: string;
    metaDescription: string;
    badge: string;
    analysisQuota: string;
    reportQuota: string;
    currentPlan: string;
    upgrade: string;
    getStarted: string;
    contactSales: string;
    free: string;
    perMonth: string;
    monthlyAnalysisCount: string;
    monthlyReportCount: string;
    planDescriptions: Record<"free" | "pro" | "enterprise", string>;
    planFeatures: Record<"free" | "pro" | "enterprise", readonly string[]>;
  };
  usage: {
    heading: string;
    analysis: string;
    report: string;
    used: string;
    of: string;
    unlimited: string;
    periodEnds: string;
    viewPlans: string;
  };
  quota: {
    analysisExhausted: string;
    reportExhausted: string;
    viewPlans: string;
  };
  auth: {
    loginRequired: string;
    loginToAnalyze: string;
  };
  hero: {
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  analysis: {
    scoreBreakdown: string;
    partBase: string;
    partPrice: string;
    partYield: string;
    partMarket: string;
    totalScore: string;
    mortgageVsRent: string;
    downPayment: string;
    term: string;
    monthlyInterest: string;
    monthlyPayment: string;
    monthlyRent: string;
    rentCoverage: string;
    totalPayment: string;
    timesPrice: string;
    years: string;
  };
}
