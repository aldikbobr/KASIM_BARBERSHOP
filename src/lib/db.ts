// База заявок — Supabase-проект «Kasym Barbershop».
// Ключ publishable публичный по замыслу Supabase: что можно читать и писать,
// решают правила RLS в самой базе (посетитель может только добавить заявку).
export const SUPABASE_URL = 'https://dpgvemgpfkzidftaqmqk.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Odo1AIZuH7EY-80bg_6w4w_1QZVmxId';

const headers = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' };

export interface NewBooking {
  location: string;
  barber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  phone: string;
}

// Сайт работает без библиотеки Supabase: два простых запроса к REST API.

/** 'ok' | 'taken' — время уже заняли | 'error' — база недоступна */
export async function saveBooking(b: NewBooking): Promise<'ok' | 'taken' | 'error'> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(b),
    });
    if (r.ok) return 'ok';
    return r.status === 409 ? 'taken' : 'error';
  } catch {
    return 'error';
  }
}

/** Занятое время по мастерам на дату: { 'Данияр': ['10:00', '10:30'] } */
export async function busySlots(location: string, date: string): Promise<Record<string, string[]>> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/busy_slots`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_location: location, p_date: date }),
    });
    if (!r.ok) return {};
    const rows: { barber: string; time: string }[] = await r.json();
    const out: Record<string, string[]> = {};
    for (const { barber, time } of rows) (out[barber] ??= []).push(time);
    return out;
  } catch {
    return {};
  }
}
