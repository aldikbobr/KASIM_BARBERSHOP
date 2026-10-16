// Услуги для записи: клиент выбирает одну, от её длительности зависит, сколько времени занято.
// Общий для сайта и CRM. Цены — как в прайсе для записи.
export interface BookingService {
  name: string;
  minutes: number;
  price: number;
}

export const BOOKING_SERVICES: BookingService[] = [
  { name: 'Биозавивка волос', minutes: 120, price: 10000 },
  { name: 'Оформление бороды', minutes: 30, price: 3500 },
  { name: 'Стрижка + борода', minutes: 60, price: 8500 },
  { name: 'Стрижка детская', minutes: 30, price: 3500 },
  { name: 'Стрижка мужская', minutes: 30, price: 5000 },
];

// Последний момент, до которого услуга должна закончиться (предположение, уточнить у Касыма).
export const DAY_END = '20:00';

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

// Получасовые слоты, которые займёт услуга, начиная с time
export const coveredSlots = (time: string, minutes: number) => {
  const out: string[] = [];
  for (let m = toMin(time); m < toMin(time) + minutes; m += 30) out.push(fromMin(m));
  return out;
};

// Услуга помещается, если все её слоты свободны и она заканчивается до закрытия
export const fitsAt = (time: string, minutes: number, isFree: (slot: string) => boolean) =>
  toMin(time) + minutes <= toMin(DAY_END) && coveredSlots(time, minutes).every(isFree);
