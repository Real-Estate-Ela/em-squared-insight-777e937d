import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cerez-politikasi")({
  head: () => ({
    meta: [
      { title: "Çerez Politikası | emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric çerez politikası: kullanılan çerez türleri, amaçları, saklama süreleri ve tarayıcı ayarlarından çerez yönetimi.",
      },
      { property: "og:title", content: "Çerez Politikası | emlakmetric" },
      {
        property: "og:description",
        content: "emlakmetric web sitesinde kullanılan çerezler ve yönetim seçenekleri.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://emlakmetric.com/cerez-politikasi" },
      { rel: "alternate", hrefLang: "tr", href: "https://emlakmetric.com/cerez-politikasi" },
      { rel: "alternate", hrefLang: "en", href: "https://emlakmetric.com/cerez-politikasi?lang=en" },
    ],
  }),
  component: CerezPolitikasi,
});

const SECTIONS_TR = [
  { id: "cerez-nedir", title: "Çerez nedir" },
  { id: "cerez-kategorileri", title: "Kullanılan çerez kategorileri" },
  { id: "kategori-amaclari", title: "Her kategorinin amacı ve süresi" },
  { id: "ucuncu-taraf", title: "Üçüncü taraf çerezleri" },
  { id: "tarayici-yonetim", title: "Tarayıcı ayarlarından yönetim" },
];

const SECTIONS_EN = [
  { id: "cerez-nedir", title: "What are cookies" },
  { id: "cerez-kategorileri", title: "Cookie categories used" },
  { id: "kategori-amaclari", title: "Purpose and duration of each category" },
  { id: "ucuncu-taraf", title: "Third-party cookies" },
  { id: "tarayici-yonetim", title: "Managing cookies via browser settings" },
];

function CerezPolitikasi() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <LegalPage
      breadcrumb={isEn ? "COOKIE POLICY" : "ÇEREZ POLİTİKASI"}
      title={isEn ? "Cookie Policy" : "Çerez Politikası"}
      sections={isEn ? SECTIONS_EN : SECTIONS_TR}
      placeholder={isEn ? "This section will be filled in" : "Bu bölüm doldurulacak"}
    />
  );
}
