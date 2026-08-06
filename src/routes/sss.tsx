import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/sss")({
  head: () => ({
    meta: [
      { title: "Sıkça Sorulan Sorular — emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric hakkında merak edilenler: değerleme farkı, ücretsiz paket kapsamı, veri güncelleme sıklığı ve konuma göre sorgulama.",
      },
      { property: "og:title", content: "Sıkça Sorulan Sorular — emlakmetric" },
      {
        property: "og:description",
        content:
          "emlakmetric hakkında merak edilenler: değerleme farkı, ücretsiz paket kapsamı, veri güncelleme sıklığı ve konuma göre sorgulama.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Emlakmetric gayrimenkul değerlemesi yapıyor mu?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Hayır. Emlakmetric değerleme yapmaz; sahibinden.com üzerindeki canlı ilan verisini ve konum verisini okur, m² fiyatı, mahalle medyanı sapması, kira getirisi ve amortisman süresi gibi ölçülebilir sayılara çevirir.",
              },
            },
            {
              "@type": "Question",
              name: "İlan linki olmadan konuma göre sorgulama yapabilir miyim?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Evet. Adres, mahalle veya harita konumu girerek o noktadaki m² fiyat aralığını, kira getirisi bandını ve son 12 aylık değişimi görebilirsiniz.",
              },
            },
            {
              "@type": "Question",
              name: "Ücretsiz paket neleri kapsıyor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Başlangıç paketi ücretsizdir: ayda 5 ilan analizi, mahalle medyanı karşılaştırması ve 12 aylık m² trendi içerir.",
              },
            },
            {
              "@type": "Question",
              name: "Kira getirisi ve amortisman süresi nasıl hesaplanıyor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Aynı mahalledeki aktif kiralık ilanların m² medyanı, ilanın net alanıyla çarpılır; yıllık kira toplam fiyata bölünerek brüt kira getirisi, tersi alınarak amortisman süresi bulunur.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: SSS,
});

const faqs = [
  {
    q: "Emlakmetric değerleme yapıyor mu?",
    a: "Hayır. Ekspertiz veya resmî değerleme raporu üretmiyoruz. İlan ve konum verisini okuyup metrekare bazında karşılaştırıyoruz; çıktı bir ölçüm raporudur.",
  },
  {
    q: "İlan linki olmadan sorgulayabilir miyim?",
    a: "Evet. KONUM sekmesine adres, mahalle veya harita noktası gir; o bölgedeki m² aralığı, kira getirisi bandı ve 12 aylık değişim gelir.",
  },
  {
    q: "Ücretsiz paket neleri kapsıyor?",
    a: "Başlangıç paketi ücretsizdir: ayda 5 ilan analizi, mahalle medyanı karşılaştırması ve 12 aylık m² trendi. Kart bilgisi istemiyoruz.",
  },
  {
    q: "Veriler ne sıklıkla güncelleniyor?",
    a: "Kaynaklar gün içinde taranır. Her raporun üstünde okunan ilan sayısı ve tarama zamanı yazar.",
  },
];

function SSS() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(120px, 14vw, 190px) clamp(16px, 4vw, 44px) clamp(80px, 10vw, 160px)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 20,
            }}
          >
            SSS
          </div>
          <h1
            style={{
              margin: "0 0 clamp(30px, 4vw, 56px)",
              font: "700 clamp(32px, 6vw, 72px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.92,
            }}
          >
            Sıkça sorulan
            <br />
            sorular<span style={{ color: "#E23D28" }}>.</span>
          </h1>

          <div
            style={{
              borderTop: "1px solid rgba(14,17,22,.16)",
            }}
          >
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    borderBottom: "1px solid rgba(14,17,22,.16)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: 0,
                      padding: "22px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        font: "500 clamp(16px, 2vw, 22px) 'Space Grotesk', sans-serif",
                        letterSpacing: "-0.03em",
                        color: "#0E1116",
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        font: "400 18px 'Space Mono', monospace",
                        color: "rgba(14,17,22,.4)",
                        flexShrink: 0,
                        transition: "transform 200ms ease",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: "0 0 22px",
                        font: "400 13px 'Space Mono', monospace",
                        lineHeight: 1.85,
                        color: "rgba(14,17,22,.62)",
                        maxWidth: 620,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
