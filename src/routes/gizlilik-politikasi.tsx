import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gizlilik-politikasi")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası | emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric gizlilik politikası: kişisel verilerin işlenmesi, konum verisi kullanımı, KVKK hakları ve veri saklama süreleri hakkında bilgilendirme.",
      },
      { property: "og:title", content: "Gizlilik Politikası | emlakmetric" },
      {
        property: "og:description",
        content: "emlakmetric kişisel verilerin korunması ve gizlilik politikası.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://emlakmetric.com/gizlilik-politikasi" },
      { rel: "alternate", hrefLang: "tr", href: "https://emlakmetric.com/gizlilik-politikasi" },
      { rel: "alternate", hrefLang: "en", href: "https://emlakmetric.com/gizlilik-politikasi?lang=en" },
    ],
  }),
  component: GizlilikPolitikasi,
});

const SECTIONS_TR = [
  { id: "veri-sorumlusu", title: "Veri sorumlusu kimliği" },
  { id: "islenen-veriler", title: "İşlenen kişisel veriler" },
  { id: "isleme-amaclari", title: "İşleme amaçları ve hukuki sebepler" },
  { id: "konum-verisi", title: "Konum verisi kullanımı" },
  { id: "yurt-disi-aktarim", title: "Yurt dışına veri aktarımı" },
  { id: "saklama-sureleri", title: "Saklama süreleri" },
  { id: "kvkk-haklari", title: "KVKK madde 11 kapsamındaki haklar" },
  { id: "basvuru-yontemi", title: "Başvuru yöntemi" },
  { id: "iletisim", title: "İletişim" },
];

const SECTIONS_EN = [
  { id: "veri-sorumlusu", title: "Data controller identity" },
  { id: "islenen-veriler", title: "Personal data processed" },
  { id: "isleme-amaclari", title: "Processing purposes and legal bases" },
  { id: "konum-verisi", title: "Location data usage" },
  { id: "yurt-disi-aktarim", title: "International data transfers" },
  { id: "saklama-sureleri", title: "Retention periods" },
  { id: "kvkk-haklari", title: "Rights under KVKK article 11" },
  { id: "basvuru-yontemi", title: "Application method" },
  { id: "iletisim", title: "Contact" },
];

function GizlilikPolitikasi() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <LegalPage
      breadcrumb={isEn ? "PRIVACY POLICY" : "GİZLİLİK POLİTİKASI"}
      title={isEn ? "Privacy Policy" : "Gizlilik Politikası"}
      sections={isEn ? SECTIONS_EN : SECTIONS_TR}
      placeholder={isEn ? "This section will be filled in" : "Bu bölüm doldurulacak"}
    />
  );
}
