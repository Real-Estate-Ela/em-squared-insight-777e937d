import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { updatePassword } from "@/lib/supabase/auth";

export const Route = createFileRoute("/sifre-yenile")({
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError("Lütfen şifre gereksinimlerini karşılayın.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
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
          <h1 className="text-2xl font-bold text-foreground">Şifreniz güncellendi</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Yeni şifreniz başarıyla kaydedildi. Şimdi giriş yapabilirsiniz.
          </p>
          <Link
            to="/giris"
            search={{ redirect: undefined }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Yeni Şifre</h1>
          <p className="mt-2 text-sm text-muted-foreground">Yeni şifrenizi belirleyin.</p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {[
                    { key: "length" as const, label: "En az 8 karakter" },
                    { key: "uppercase" as const, label: "En az 1 büyük harf" },
                    { key: "number" as const, label: "En az 1 rakam" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className={`flex items-center gap-1.5 text-xs ${passwordChecks[key] ? "text-positive" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`h-1 w-1 rounded-full ${passwordChecks[key] ? "bg-positive" : "bg-muted-foreground/40"}`}
                      />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="mt-1.5 text-xs text-destructive">Şifreler eşleşmiyor</p>
              )}
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
              {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
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
