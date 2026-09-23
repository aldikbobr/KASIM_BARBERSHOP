export const BOOKING_URL = 'https://zapis.kz/barbershop-kasym';
export const INSTAGRAM_URL = 'https://instagram.com/kasym_barbershop';
export const TWOGIS_URL = 'https://2gis.kz/petropavlovsk/firm/70000001041837300';

export const RATING = { score: '4.9', votes: 550, reviews: 318 };

export const NAV_ITEMS = [
  { href: '#uslugi', label: 'Услуги' },
  { href: '#raboty', label: 'Работы' },
  { href: '#barbery', label: 'Барберы' },
  { href: '#otzyvy', label: 'Отзывы' },
  { href: '#filialy', label: 'Филиалы' },
  { href: '#kontakty', label: 'Контакты' },
];

// masters — свои мастера у каждого филиала. В записи сначала выбирают филиал,
// потом мастера из его списка. Порядок в массиве = порядок кнопок в модалке.
export const LOCATIONS = [
  { name: 'ДСР', address: 'ул. Жабаева, 106', phone: '+7 747 977 70 80', wa: 'https://wa.me/77479777080', masters: ['Есим', 'Ляйсан', 'Индира', 'Алькарим', 'Балгат', 'Дания', 'Нуни'] },
  { name: 'Тайга', address: 'ул. Жабаева, 161', phone: '+7 778 839 45 84', wa: 'https://wa.me/77788394584', masters: ['Темирхан', 'Нурсеит', 'Зангар'] },
  { name: 'Шажимбаева', address: 'ул. Шажимбаева, 101', phone: '+7 707 927 77 80', wa: 'https://wa.me/77079277780', masters: ['Сапар', 'Касым', 'Данияр', 'Аян'] },
];

export const PRICE_TIERS = ['Мастер', 'Топ-мастер', 'Касым'];

export const SERVICES = [
  {
    name: 'Стрижка',
    img: 'https://images.pexels.com/photos/5970246/pexels-photo-5970246.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Стрижка машинкой с точным переходом',
    desc: 'Мужская стрижка под форму головы и тип волос',
    prices: ['5 000', '6 000', '8 000'],
  },
  {
    name: 'Борода',
    img: 'https://images.pexels.com/photos/9153970/pexels-photo-9153970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Моделирование бороды опасной бритвой',
    desc: 'Коррекция формы, окантовка, оформление контура',
    prices: ['3 500', '4 000', '5 000'],
  },
  {
    name: 'Стрижка + борода',
    img: 'https://images.pexels.com/photos/4969874/pexels-photo-4969874.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Комплекс: стрижка и оформление бороды',
    desc: 'Полный образ за один визит — стрижка и борода вместе',
    prices: ['—', '—', '13 000'],
  },
  {
    name: 'Тонировка',
    img: 'https://images.pexels.com/photos/8468142/pexels-photo-8468142.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Тонирование волос под тон кожи',
    desc: 'Закрашивание седины, выравнивание оттенка',
    prices: ['4 000', '5 000', '5 000'],
  },
  {
    name: 'Камуфляж бороды',
    img: 'https://images.pexels.com/photos/7447145/pexels-photo-7447145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Камуфляж седины в бороде',
    desc: 'Маскировка седых волос в бороде',
    prices: ['3 000', '3 500', '4 000'],
  },
  {
    name: 'Маска',
    img: 'https://images.pexels.com/photos/18704463/pexels-photo-18704463.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Нанесение уходовой маски для лица',
    desc: 'Очищающая или питательная маска для кожи',
    prices: ['1 000', '1 500', '2 000'],
  },
  {
    name: 'Ваксинг',
    img: 'https://images.pexels.com/photos/15577126/pexels-photo-15577126.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Удаление нежелательных волос воском',
    desc: 'Удаление волос горячим воском, одна зона',
    prices: ['1 000', '1 000', '1 500'],
  },
  {
    name: 'Hair Tattoo',
    img: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    alt: 'Геометрический узор на волосах',
    desc: 'Рисунок машинкой — узоры, линии, орнамент',
    prices: ['1 000 / 2 000', '—', '—'],
  },
];

export const PRICES_KIDS = [
  { service: 'Детская стрижка до 12 лет', value: '3 500' },
  { service: 'Подростки', value: '4 000' },
  { service: 'Студенты — скидка 10%', value: '4 500' },
  { service: 'Детская стрижка у Касыма', value: '5 000' },
];

export const PRICES_BUNDLES = [
  { title: 'Комплекс 1', text: 'Стрижка + борода + тонировка', value: '16 000', was: '20 000' },
  { title: 'Комплекс 2', text: 'Стрижка + маска + ваксинг', value: '10 000' },
  { title: 'Уход', text: 'Чистка лица, ваксинг, массаж головы, маска', value: '10 000' },
];

export const WORKS = [
  { src: 'https://images.pexels.com/photos/4625632/pexels-photo-4625632.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Скин-фейд со спины, чёткая линия перехода' },
  { src: 'https://images.pexels.com/photos/12464841/pexels-photo-12464841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Подстриженная борода и чистая линия на шее' },
  { src: 'https://images.pexels.com/photos/34702982/pexels-photo-34702982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Текстурный кроп с плавным переходом к затылку' },
  { src: 'https://images.pexels.com/photos/39559268/pexels-photo-39559268.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Низкий тейпер с ровной линией шеи' },
  { src: 'https://images.pexels.com/photos/10775080/pexels-photo-10775080.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Высокий скин-фейд у виска' },
  { src: 'https://images.pexels.com/photos/39559270/pexels-photo-39559270.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Короткая стрижка с чистым переходом на затылке' },
];

export const REVIEWS = [
  {
    name: 'Saden',
    text: 'Мастер Темирхан сделал свою работу очень аккуратно и красиво — всё понравилось! Видно, что мастер знает своё дело. Вежливый, внимательно выслушает и подскажет, как лучше подстричься, если вы не знаете, какую стрижку выбрать. Однозначно рекомендую этого мастера!',
  },
  {
    name: 'Рустем Сериков',
    text: 'Все на высшем уровне! Сервис и качество твёрдая 5. Администратор Акнур вообще умница! Приветливая, а главное дело свое знает отлично. Не смог по времени прийти, предупредил… Акнур чётко соориентировалась в этом вопросе, разобралась.',
  },
  {
    name: 'Ярослав Козловский',
    text: 'Хороший сервис отличный мастер все понравилось и качество выполняемой работы и цена одыкватная стрижкой доволен сегодня был в первые теперь буду ходить на постоянной основе',
  },
  {
    name: 'near die',
    text: 'Впервые пришел, решил сменить свою прическу, Нурсеит отличный барбер, подобрал за 30 минут то что надо, для первого шага сделал всё идеально!',
  },
  {
    name: 'Григорий Журавлёв',
    text: 'Молодой Барбер Темирхан, качественно подстриг, полностью оправдал и даже больше, с каждым приходом все лучше и лучше',
  },
];

export const STATS = [
  { n: RATING.score, label: 'рейтинг в 2ГИС', gold: true },
  { n: String(RATING.votes), label: 'оценок' },
  { n: '3', label: 'филиала' },
  { n: '2020', label: 'год основания' },
];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
  social?: {
    instagram?: string;
    whatsapp?: string;
  };
}

export const BARBERS: TeamMember[] = [
  { id: '1', name: 'Фейд', role: 'классика и чёткий переход', image: 'https://images.pexels.com/photos/8552627/pexels-photo-8552627.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', social: { whatsapp: 'https://wa.me/77479777080' } },
  { id: '2', name: 'Борода', role: 'опасная бритва, горячее полотенце', image: 'https://images.pexels.com/photos/18298041/pexels-photo-18298041.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', social: { whatsapp: 'https://wa.me/77788394584' } },
  { id: '3', name: 'Детские', role: 'спокойно и без слёз', image: 'https://images.pexels.com/photos/2062463/pexels-photo-2062463.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', social: { whatsapp: 'https://wa.me/77079277780' } },
  { id: '4', name: 'Андеркат', role: 'объём и текстура', image: 'https://images.pexels.com/photos/16986979/pexels-photo-16986979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', social: { whatsapp: 'https://wa.me/77479777080' } },
  { id: '5', name: 'Камуфляж седины', role: 'естественный тон', image: 'https://images.pexels.com/photos/2174112/pexels-photo-2174112.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', social: { whatsapp: 'https://wa.me/77788394584' } },
  { id: '6', name: 'Бритьё головы', role: 'гладко, с уходом', image: 'https://images.pexels.com/photos/2174113/pexels-photo-2174113.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', social: { whatsapp: 'https://wa.me/77079277780' } },
];
