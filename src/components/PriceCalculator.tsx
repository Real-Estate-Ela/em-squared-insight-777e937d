import { useState, useCallback } from "react";
import { MouseCard } from "./MouseCard";

function fmt(n: number) {
  return n.toLocaleString("tr-TR");
}

export function PriceCalculator() {
  const [price, setPrice] = useState(4_000_000);
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(2.5);
  const [years, setYears] = useState(10);
  const [rent, setRent] = useState(22_000);

  const down = price * (downPct / 100);
  const loan = price - down;
  const monthlyRate = rate / 100;
  const months = years * 12;
  const monthly =
    loan > 0 && monthlyRate > 0
      ? (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
      : 0;
  const totalPaid = monthly * months + down;
  const rentalYield = price > 0 ? ((rent * 12) / price) * 100 : 0;
  const payback = rent > 0 ? price / (rent * 12) : 0;

  const Slider = useCallback(
    ({
      label,
      value,
      min,
      max,
      step,
      unit,
      onChange,
      formatValue,
    }: {
      label: string;
      value: number;
      min: number;
      max: number;
      step: number;
      unit: string;
      onChange: (v: number) => void;
      formatValue?: (v: number) => string;
    }) => (
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold tabular-nums">
            {formatValue ? formatValue(value) : value}
            {unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="calc-slider mt-2 w-full"
        />
      </div>
    ),
    [],
  );

  return (
    <MouseCard
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      glowColor="var(--primary)"
      tiltMax={2}
      glowOpacity={0.05}
    >
      <div className="grid gap-0 md:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-6 p-6 md:p-8">
          <Slider label="Mülk fiyatı" value={price} min={500_000} max={20_000_000} step={100_000} unit=" ₺" onChange={setPrice} formatValue={fmt} />
          <Slider label="Peşinat" value={downPct} min={0} max={80} step={5} unit="%" onChange={setDownPct} />
          <Slider label="Aylık faiz oranı" value={rate} min={0.5} max={5} step={0.1} unit="%" onChange={setRate} />
          <Slider label="Vade" value={years} min={1} max={20} step={1} unit=" yıl" onChange={setYears} />
          <Slider label="Aylık kira geliri" value={rent} min={5_000} max={100_000} step={1_000} unit=" ₺" onChange={setRent} formatValue={fmt} />
        </div>

        <div className="hidden w-px bg-border md:block" />

        <div className="border-t border-border bg-muted/20 p-6 md:border-t-0 md:p-8">
          <p className="label-mono">Hesaplama Sonuçları</p>
          <dl className="mt-5 space-y-4">
            <ResultRow label="Peşinat" value={`${fmt(Math.round(down))} ₺`} />
            <ResultRow label="Kredi tutarı" value={`${fmt(Math.round(loan))} ₺`} />
            <ResultRow label="Aylık taksit" value={`${fmt(Math.round(monthly))} ₺`} highlight />
            <ResultRow label="Toplam ödeme" value={`${fmt(Math.round(totalPaid))} ₺`} />
            <ResultRow label="Kira getirisi" value={`%${rentalYield.toFixed(1)}`} tone={rentalYield > 5 ? "positive" : "risk"} />
            <ResultRow label="Amortisman" value={`${payback.toFixed(1)} yıl`} tone={payback < 20 ? "positive" : "risk"} />
          </dl>
          <div className="mt-6 rounded-lg bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">
              {rentalYield > 5
                ? "Kira getirisi bölge ortalamasının üzerinde. Yatırıma uygun."
                : "Kira getirisi bölge ortalamasının altında. Detaylı analiz önerilir."}
            </p>
          </div>
        </div>
      </div>
    </MouseCard>
  );
}

function ResultRow({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "positive" | "risk";
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={`text-sm font-semibold tabular-nums ${
          tone === "positive"
            ? "text-positive"
            : tone === "risk"
              ? "text-risk"
              : highlight
                ? "text-lg text-foreground"
                : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
