import { useState, useEffect } from "react";

interface ReverseResult {
  address?: {
    province?: string;
    state?: string;
    city?: string;
    county?: string;
    country_code?: string;
  };
}

export function useUserCity(): string | null {
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`,
          );
          if (!res.ok) return;
          const data: ReverseResult = await res.json();
          const province =
            data.address?.province ??
            data.address?.state ??
            data.address?.city ??
            null;
          if (province) setCity(province);
        } catch {
          // silently fall back to defaults
        }
      },
      () => {
        // permission denied or error — silently fall back to defaults
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  return city;
}
