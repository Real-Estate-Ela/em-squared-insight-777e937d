import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/supabase/auth";

export const Route = createFileRoute("/sifre-sifirla")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-positive/10">
            <CheckCircle className="h-8 w-8 text-positive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bağlantı gönderildi</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong className="text-foreground">{email}</strong> adresine şifre sıfırlama bağlantısı
            gönderdik. Lütfen gelen kutunuzu kontrol edin.
          </p>
          <Link
            to="/giris"
            search={{ redirect: undefined }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Şifre Sıfırla</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/giris"
            search={{ redirect: undefined }}
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
