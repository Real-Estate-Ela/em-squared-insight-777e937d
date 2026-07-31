import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Shield, Crown, Star, AlertCircle, CheckCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/profil")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const roleConfig = {
    admin: { label: "Yönetici", icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
    premium: { label: "Premium", icon: Crown, color: "text-chart-4", bg: "bg-chart-4/10" },
    user: { label: "Kullanıcı", icon: Star, color: "text-muted-foreground", bg: "bg-muted" },
  };

  const role = profile?.role ?? "user";
  const rc = roleConfig[role];
  const RoleIcon = rc.icon;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user!.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    await refreshProfile();
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Profilim</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hesap bilgilerinizi görüntüleyin ve düzenleyin.
      </p>

      <div className="mt-8 space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                (profile?.full_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {profile?.full_name ?? "Kullanıcı"}
              </h2>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              <div
                className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${rc.bg} ${rc.color}`}
              >
                <RoleIcon className="h-3 w-3" />
                {rc.label}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground">Bilgilerimi Düzenle</h3>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="profileName"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="profileName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profileEmail"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="profileEmail"
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-xl border border-input bg-muted/50 py-3 pl-10 pr-4 text-sm text-muted-foreground"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                E-posta adresi değiştirilemez.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-lg bg-positive/10 px-3 py-2.5 text-sm text-positive">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                Bilgileriniz güncellendi.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground">Hesap Bilgileri</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hesap Oluşturulma</dt>
              <dd className="font-medium text-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Giriş Yöntemi</dt>
              <dd className="font-medium text-foreground">
                {user?.app_metadata?.provider === "google" ? "Google" : "E-posta"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">E-posta Doğrulama</dt>
              <dd className="font-medium text-positive">Doğrulandı</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
