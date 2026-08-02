import { Link } from "@tanstack/react-router";
import { EmSquareMark, Wordmark } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-[1fr_auto] md:items-end md:px-8">
        <div className="flex items-center gap-3">
          <EmSquareMark className="h-7 w-7 text-[1.1rem]" />
          <Wordmark className="text-lg" />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/" hash="paketler" className="transition-colors hover:text-foreground">Paketler</Link>
          <Link to="/hakkimizda" className="transition-colors hover:text-foreground">Hakkımızda</Link>
          <Link to="/iletisim" className="transition-colors hover:text-foreground">İletişim</Link>
          <Link to="/gorseller" className="transition-colors hover:text-foreground">Görseller</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-border px-5 py-4 text-xs text-muted-foreground md:px-8">
        © {new Date().getFullYear()} emlakmetric — Gayrimenkul analiz platformu.
        Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
      </div>
    </footer>
  );
}
