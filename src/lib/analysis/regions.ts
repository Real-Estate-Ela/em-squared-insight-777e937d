export interface RegionMetric {
  city: string;
  district: string;
  medianM2: number;
  change12m: number;
  yieldPct: number;
}

const ALL_REGIONS: RegionMetric[] = [
  // İstanbul
  { city: "İstanbul", district: "Kadıköy", medianM2: 96400, change12m: 4.2, yieldPct: 4.8 },
  { city: "İstanbul", district: "Beşiktaş", medianM2: 112500, change12m: 3.9, yieldPct: 4.3 },
  { city: "İstanbul", district: "Beylikdüzü", medianM2: 62700, change12m: 3.4, yieldPct: 5.6 },
  { city: "İstanbul", district: "Esenyurt", medianM2: 38900, change12m: -2.3, yieldPct: 6.1 },
  { city: "İstanbul", district: "Üsküdar", medianM2: 89200, change12m: 5.1, yieldPct: 4.5 },
  { city: "İstanbul", district: "Bakırköy", medianM2: 104300, change12m: 2.7, yieldPct: 4.2 },
  { city: "İstanbul", district: "Ataşehir", medianM2: 78600, change12m: 6.3, yieldPct: 5.1 },
  { city: "İstanbul", district: "Maltepe", medianM2: 71400, change12m: 4.8, yieldPct: 5.3 },
  { city: "İstanbul", district: "Sarıyer", medianM2: 98700, change12m: 5.5, yieldPct: 3.9 },
  { city: "İstanbul", district: "Pendik", medianM2: 52300, change12m: 3.1, yieldPct: 5.8 },
  { city: "İstanbul", district: "Kartal", medianM2: 64100, change12m: 4.4, yieldPct: 5.4 },
  { city: "İstanbul", district: "Başakşehir", medianM2: 58900, change12m: 7.2, yieldPct: 5.2 },

  // Ankara
  { city: "Ankara", district: "Çankaya", medianM2: 54900, change12m: 2.8, yieldPct: 5.4 },
  { city: "Ankara", district: "Etimesgut", medianM2: 33400, change12m: 1.9, yieldPct: 6.2 },
  { city: "Ankara", district: "Keçiören", medianM2: 28700, change12m: 3.1, yieldPct: 6.5 },
  { city: "Ankara", district: "Yenimahalle", medianM2: 42100, change12m: 4.5, yieldPct: 5.7 },
  { city: "Ankara", district: "Mamak", medianM2: 24300, change12m: -0.8, yieldPct: 7.1 },
  { city: "Ankara", district: "Çayyolu", medianM2: 48600, change12m: 5.3, yieldPct: 5.1 },

  // İzmir
  { city: "İzmir", district: "Bornova", medianM2: 47150, change12m: -1.1, yieldPct: 5.9 },
  { city: "İzmir", district: "Karşıyaka", medianM2: 68300, change12m: 5.1, yieldPct: 4.7 },
  { city: "İzmir", district: "Konak", medianM2: 55200, change12m: 2.4, yieldPct: 5.3 },
  { city: "İzmir", district: "Bayraklı", medianM2: 49800, change12m: 6.8, yieldPct: 5.5 },
  { city: "İzmir", district: "Buca", medianM2: 39600, change12m: 3.7, yieldPct: 6.0 },
  { city: "İzmir", district: "Çeşme", medianM2: 118400, change12m: 8.9, yieldPct: 3.2 },

  // Antalya
  { city: "Antalya", district: "Muratpaşa", medianM2: 71800, change12m: 7.9, yieldPct: 4.6 },
  { city: "Antalya", district: "Konyaaltı", medianM2: 79500, change12m: 6.4, yieldPct: 4.1 },
  { city: "Antalya", district: "Kepez", medianM2: 38200, change12m: 4.2, yieldPct: 5.8 },
  { city: "Antalya", district: "Lara", medianM2: 85300, change12m: 9.1, yieldPct: 3.8 },

  // Bursa
  { city: "Bursa", district: "Nilüfer", medianM2: 44300, change12m: 5.6, yieldPct: 5.4 },
  { city: "Bursa", district: "Osmangazi", medianM2: 36200, change12m: 3.8, yieldPct: 5.9 },
  { city: "Bursa", district: "Mudanya", medianM2: 52100, change12m: 7.3, yieldPct: 4.5 },
  { city: "Bursa", district: "Yıldırım", medianM2: 27400, change12m: 1.2, yieldPct: 6.8 },

  // Kocaeli
  { city: "Kocaeli", district: "İzmit", medianM2: 41600, change12m: 2.2, yieldPct: 5.7 },
  { city: "Kocaeli", district: "Gebze", medianM2: 38900, change12m: 3.5, yieldPct: 5.9 },
  { city: "Kocaeli", district: "Başiskele", medianM2: 45200, change12m: 4.8, yieldPct: 5.2 },

  // Eskişehir
  { city: "Eskişehir", district: "Tepebaşı", medianM2: 36750, change12m: -0.7, yieldPct: 6.3 },
  { city: "Eskişehir", district: "Odunpazarı", medianM2: 32100, change12m: 1.4, yieldPct: 6.6 },

  // Mersin
  { city: "Mersin", district: "Mezitli", medianM2: 46800, change12m: 8.4, yieldPct: 5.0 },
  { city: "Mersin", district: "Yenişehir", medianM2: 41200, change12m: 6.1, yieldPct: 5.5 },
  { city: "Mersin", district: "Toroslar", medianM2: 29800, change12m: 3.2, yieldPct: 6.4 },

  // Gaziantep
  { city: "Gaziantep", district: "Şahinbey", medianM2: 27500, change12m: 2.9, yieldPct: 6.7 },
  { city: "Gaziantep", district: "Şehitkâmil", medianM2: 31200, change12m: 4.1, yieldPct: 6.2 },

  // Trabzon
  { city: "Trabzon", district: "Ortahisar", medianM2: 35400, change12m: 5.7, yieldPct: 5.4 },
  { city: "Trabzon", district: "Yomra", medianM2: 28900, change12m: 3.3, yieldPct: 6.1 },

  // Konya
  { city: "Konya", district: "Selçuklu", medianM2: 29600, change12m: 2.1, yieldPct: 6.5 },
  { city: "Konya", district: "Meram", medianM2: 26800, change12m: 1.8, yieldPct: 6.9 },

  // Adana
  { city: "Adana", district: "Çukurova", medianM2: 32400, change12m: 3.6, yieldPct: 6.0 },
  { city: "Adana", district: "Seyhan", medianM2: 28100, change12m: 2.4, yieldPct: 6.4 },

  // Sakarya
  { city: "Sakarya", district: "Serdivan", medianM2: 37800, change12m: 4.9, yieldPct: 5.6 },
  { city: "Sakarya", district: "Adapazarı", medianM2: 31500, change12m: 2.7, yieldPct: 6.1 },

  // Muğla
  { city: "Muğla", district: "Bodrum", medianM2: 142000, change12m: 11.2, yieldPct: 2.8 },
  { city: "Muğla", district: "Fethiye", medianM2: 89500, change12m: 9.4, yieldPct: 3.5 },
  { city: "Muğla", district: "Marmaris", medianM2: 95200, change12m: 8.7, yieldPct: 3.3 },

  // Denizli
  { city: "Denizli", district: "Pamukkale", medianM2: 27300, change12m: 1.6, yieldPct: 6.8 },
  { city: "Denizli", district: "Merkezefendi", medianM2: 30100, change12m: 2.9, yieldPct: 6.3 },

  // Kayseri
  { city: "Kayseri", district: "Melikgazi", medianM2: 25400, change12m: 3.4, yieldPct: 7.0 },
  { city: "Kayseri", district: "Kocasinan", medianM2: 22800, change12m: 2.1, yieldPct: 7.3 },

  // Tekirdağ
  { city: "Tekirdağ", district: "Süleymanpaşa", medianM2: 39400, change12m: 5.2, yieldPct: 5.5 },
  { city: "Tekirdağ", district: "Çorlu", medianM2: 35600, change12m: 4.3, yieldPct: 5.8 },

  // Balıkesir
  { city: "Balıkesir", district: "Altıeylül", medianM2: 28600, change12m: 2.5, yieldPct: 6.4 },
  { city: "Balıkesir", district: "Ayvalık", medianM2: 52300, change12m: 7.8, yieldPct: 4.1 },

  // Samsun
  { city: "Samsun", district: "Atakum", medianM2: 31200, change12m: 3.9, yieldPct: 6.0 },
  { city: "Samsun", district: "İlkadım", medianM2: 26700, change12m: 2.3, yieldPct: 6.6 },
];

const DEFAULT_CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya",
  "Kocaeli", "Eskişehir", "Mersin", "Muğla", "Trabzon",
];

const GRID_SIZE = 12;

function pickFromCity(city: string, count: number): RegionMetric[] {
  const pool = ALL_REGIONS.filter(
    (r) => r.city.toLocaleLowerCase("tr") === city.toLocaleLowerCase("tr"),
  );
  return pool.slice(0, count);
}

export function getDefaultRegions(): RegionMetric[] {
  const result: RegionMetric[] = [];
  for (const city of DEFAULT_CITIES) {
    const fromCity = pickFromCity(city, 2);
    result.push(...fromCity);
    if (result.length >= GRID_SIZE) break;
  }
  return result.slice(0, GRID_SIZE);
}

export function getRegionsForCity(city: string): RegionMetric[] {
  const local = pickFromCity(city, GRID_SIZE);
  if (local.length >= GRID_SIZE) return local;

  const neighbours = ALL_REGIONS.filter(
    (r) => r.city.toLocaleLowerCase("tr") !== city.toLocaleLowerCase("tr"),
  );
  return [...local, ...neighbours].slice(0, GRID_SIZE);
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺/m²";
}

export function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "−";
  return `${sign}${Math.abs(pct).toFixed(1).replace(".", ",")}%`;
}

export function formatYield(pct: number): string {
  return `%${pct.toFixed(1).replace(".", ",")}`;
}
