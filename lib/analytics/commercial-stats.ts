import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isCommercialAccount,
  isActiveCommercialLand,
  isActiveCommercialService,
  type CommercialIdentity,
} from "@/lib/analytics/commercial-filters";

import { COUNTRY_CODES, type CountryCode } from "@/data/countries";
export { COUNTRY_CODES, type CountryCode };

type AuthIdentity = CommercialIdentity & { id: string };
type ProfileRow = { id: string; country_code: string | null; created_at: string };
type LandRow = {
  propietario_id: string; country_code: string | null;
  status: string; titulo: string | null; ambiente: string | null; created_at: string;
};
type ServiceRow = {
  propietario_id: string; country_code: string | null;
  activo: boolean; detalle: string | null; zona: string | null; created_at: string;
};

type CountryMetrics = { country: CountryCode; registrations: number; activeLands: number; activeServices: number };

function normalizeCountry(value: string | null | undefined): CountryCode {
  return COUNTRY_CODES.find((country) => country === value?.toUpperCase()) ?? "AR";
}

async function loadCommercialData() {
  const admin = createAdminClient();
  const perPage = 1000;
  const users: AuthIdentity[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...data.users.map((user) => ({
      id: user.id, email: user.email, email_confirmed_at: user.email_confirmed_at,
    })));
    if (data.users.length < perPage) break;
  }

  async function rows<T>(table: "profiles" | "campos" | "servicios_publicaciones", columns: string) {
    const result: T[] = [];
    for (let from = 0; ; from += perPage) {
      const { data, error } = await admin.from(table).select(columns)
        .order("created_at", { ascending: true }).range(from, from + perPage - 1);
      if (error) throw error;
      const page = (data ?? []) as T[];
      result.push(...page);
      if (page.length < perPage) break;
    }
    return result;
  }

  const [profiles, lands, services] = await Promise.all([
    rows<ProfileRow>("profiles", "id,country_code,created_at"),
    rows<LandRow>("campos", "propietario_id,country_code,status,titulo,ambiente,created_at"),
    rows<ServiceRow>("servicios_publicaciones", "propietario_id,country_code,activo,detalle,zona,created_at"),
  ]);
  return { users, profiles, lands, services };
}

/** Read-only server-side metrics. Never return emails, test accounts or DEMO rows. */
export async function getCommercialStats() {
  const { users, profiles, lands, services } = await loadCommercialData();
  const validUsers = new Map(users.filter(isCommercialAccount).map((u) => [u.id, u]));
  const byProfile = new Map(profiles.map((p) => [p.id, p]));
  const byCountry = new Map<CountryCode, CountryMetrics>(
    COUNTRY_CODES.map((country) => [country, { country, registrations: 0, activeLands: 0, activeServices: 0 }])
  );

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1));
    return d.toISOString().slice(0, 7);
  });
  const byMonth = new Map(months.map((month) => [month, {
    month, registrations: 0, activeLands: 0, activeServices: 0,
  }]));

  for (const user of users) {
    if (!validUsers.has(user.id)) continue;
    const profile = byProfile.get(user.id);
    if (!profile) continue;
    byCountry.get(normalizeCountry(profile.country_code))!.registrations++;
    const month = profile.created_at.slice(0, 7);
    const timeline = byMonth.get(month);
    if (timeline) timeline.registrations++;
  }

  for (const land of lands) {
    const owner = validUsers.get(land.propietario_id);
    if (!owner || !isActiveCommercialLand({ ...land, owner })) continue;
    const country = normalizeCountry(land.country_code ?? byProfile.get(land.propietario_id)?.country_code);
    byCountry.get(country)!.activeLands++;
    const timeline = byMonth.get(land.created_at.slice(0, 7));
    if (timeline) timeline.activeLands++;
  }

  for (const service of services) {
    const owner = validUsers.get(service.propietario_id);
    if (!owner || !isActiveCommercialService({
      activo: service.activo, titulo: service.detalle, ambiente: service.zona, owner,
    })) continue;
    const country = normalizeCountry(service.country_code ?? byProfile.get(service.propietario_id)?.country_code);
    byCountry.get(country)!.activeServices++;
    const timeline = byMonth.get(service.created_at.slice(0, 7));
    if (timeline) timeline.activeServices++;
  }

  const countries = [...byCountry.values()];
  return {
    countries,
    months: [...byMonth.values()],
    totals: countries.reduce((sum, row) => ({
      registrations: sum.registrations + row.registrations,
      activeLands: sum.activeLands + row.activeLands,
      activeServices: sum.activeServices + row.activeServices,
    }), { registrations: 0, activeLands: 0, activeServices: 0 }),
    updatedAt: now.toISOString(),
  };
}
