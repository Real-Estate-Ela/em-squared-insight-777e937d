import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/kullanim-kosullari")({
  head: () => ({
    meta: [
      { title: "Kullanım Koşulları | emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric kullanım koşulları: hizmet tanımı, hesap sorumlulukları, ödeme ve iptal kuralları, fikri mülkiyet ve sorumluluk sınırları.",
      },
      { property: "og:title", content: "Kullanım Koşulları | emlakmetric" },
      {
        property: "og:description",
        content: "emlakmetric platformunun kullanım koşulları ve hizmet sözleşmesi.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://emlakmetric.com/kullanim-kosullari" },
      { rel: "alternate", hrefLang: "tr", href: "https://emlakmetric.com/kullanim-kosullari" },
      { rel: "alternate", hrefLang: "en", href: "https://emlakmetric.com/kullanim-kosullari?lang=en" },
    ],
  }),
  component: KullanimKosullari,
});

const SECTIONS_TR = [
  { id: "hizmet-tanimi", title: "Hizmetin tanımı" },
  { id: "hesap-sorumluluk", title: "Hesap oluşturma ve sorumluluk" },
  { id: "paket-kota", title: "Paket ve kota kuralları" },
  { id: "odeme-iptal", title: "Ödeme, yenileme ve iptal" },
  { id: "yasak-kullanimlar", title: "Yasak kullanımlar" },
  { id: "fikri-mulkiyet", title: "Fikri mülkiyet" },
  { id: "sorumluluk-siniri", title: "Sorumluluk sınırı" },
  { id: "yatirim-tavsiyesi", title: "Yatırım tavsiyesi olmadığına dair açık beyan" },
  { id: "uyusmazlik", title: "Uyuşmazlık ve yetkili mahkeme" },
];

const SECTIONS_EN = [
  { id: "hizmet-tanimi", title: "Service description" },
  { id: "hesap-sorumluluk", title: "Account creation and responsibility" },
  { id: "paket-kota", title: "Plans and quota rules" },
  { id: "odeme-iptal", title: "Payment, renewal and cancellation" },
  { id: "yasak-kullanimlar", title: "Prohibited uses" },
  { id: "fikri-mulkiyet", title: "Intellectual property" },
  { id: "sorumluluk-siniri", title: "Limitation of liability" },
  { id: "yatirim-tavsiyesi", title: "No investment advice disclaimer" },
  { id: "uyusmazlik", title: "Disputes and jurisdiction" },
];

function KullanimKosullari() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <LegalPage
      breadcrumb={isEn ? "TERMS OF USE" : "KULLANIM KOŞULLARI"}
      title={isEn ? "Terms of Use" : "Kullanım Koşulları"}
      sections={isEn ? SECTIONS_EN : SECTIONS_TR}
      placeholder={isEn ? "This section will be filled in" : "Bu bölüm doldurulacak"}
    />
  );
}
