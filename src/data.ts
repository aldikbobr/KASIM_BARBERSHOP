export const BOOKING_URL = 'https://zapis.kz/barbershop-kasym';
export const INSTAGRAM_URL = 'https://instagram.com/kasym_barbershop';
export const TWOGIS_URL = 'https://2gis.kz/petropavlovsk/firm/70000001041837300';

export const RATING = { score: '4.9', votes: 550, reviews: 318 };

export const NAV_ITEMS = [
  { href: '#uslugi', label: 'Услуги' },
  { href: '#raboty', label: 'Работы' },
  { href: '#osnovatel', label: 'Основатель' },
  { href: '#barbery', label: 'Барберы' },
  { href: '#otzyvy', label: 'Отзывы' },
  { href: '#filialy', label: 'Филиалы' },
  { href: '#franshiza', label: 'Франшиза' },
  { href: '#kontakty', label: 'Контакты' },
];

// masters — свои мастера у каждого филиала. В записи сначала выбирают филиал,
// потом мастера из его списка. Порядок в массиве = порядок кнопок в модалке.
export const LOCATIONS = [
  { name: 'ДСР', address: 'ул. Жабаева, 106', phone: '+7 747 977 70 80', wa: 'https://wa.me/77479777080', masters: ['Индира', 'Алькарим', 'Есим', 'Нуни', 'Дания', 'Балгат', 'Ляйсан'] },
  { name: 'Тайга', address: 'ул. Жабаева, 161', phone: '+7 778 839 45 84', wa: 'https://wa.me/77788394584', masters: ['Темирхан', 'Алексей', 'Зангар', 'Нурсеит'] },
  { name: 'Шажимбаева', address: 'ул. Шажимбаева, 101', phone: '+7 707 927 77 80', wa: 'https://wa.me/77079277780', masters: ['Сапар', 'Аян', 'Данияр', 'Касым'] },
];

// Фото мастеров (квадрат по лицу, 192px). Нет фото — в карточке кружок с буквой.
export const MASTER_PHOTOS: Record<string, string> = {
  Сапар: '/barbers/sapar.jpg',
  Аян: '/barbers/ayan.jpg',
  Данияр: '/barbers/daniyar.jpg',
  Касым: '/barbers/kasym.jpg',
  Темирхан: '/barbers/temirkhan.jpg',
  Алексей: '/barbers/aleksey.jpg',
  Зангар: '/barbers/zangar.jpg',
  Нурсеит: '/barbers/nurseit.jpg',
  Индира: '/barbers/indira.jpg',
  Алькарим: '/barbers/alkarim.jpg',
  Есим: '/barbers/esim.jpg',
  Нуни: '/barbers/nuni.jpg',
  Дания: '/barbers/daniya.jpg',
  Балгат: '/barbers/balgat.jpg',
};

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

// Видео из филиалов (02.10.2026): /works/<name>.mp4 + кадр-обложка /works/<name>.jpg.
export const WORKS = [
  { name: 'fade-beard', alt: 'Фейд и оформленная борода' },
  { name: 'side-part', alt: 'Укладка с пробором и фейд на висках' },
  { name: 'razor-lines', alt: 'Рисунок бритвой на текстурной стрижке' },
  { name: 'razor-shave', alt: 'Оформление бороды опасной бритвой' },
  { name: 'curly', alt: 'Кудрявая текстура с мягким переходом' },
  { name: 'low-fade-beard', alt: 'Низкий фейд и густая борода' },
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

// Из биографии Касыма (docx от 02.10.2026).
export const FOUNDER_PATH = [
  { when: '13+ лет', text: 'В профессии. Начинал в Шымкенте — по 30–40 клиентов в день: скорость, дисциплина, фейд и опасная бритва до автоматизма.' },
  { when: '2018', text: 'Переезд в Петропавловск по программе «Юг — Север». Работал ведущим мастером и изучал, как стригутся на севере.' },
  { when: '2020', text: 'Открыл первый Kasym Barbershop — сам выбирал интерьер, косметику и поставщиков.' },
  { when: 'Сегодня', text: 'Три филиала, флагман в мкр. Жас Оркен (ЖК «8 квартал»), своя школа барберинга и франшиза.' },
];

export const FRANCHISE = [
  { title: 'Бизнес-модель под ключ', text: 'Пошаговые инструкции по открытию, управлению и продвижению барбершопа.' },
  { title: 'Обучение и стандарты', text: 'Фирменная школа барберинга: готовим мастеров и администраторов с нуля.' },
  { title: 'Маркетинг и брендбук', text: 'Готовые рекламные стратегии, айдентика и оформление пространства.' },
  { title: 'Поставки', text: 'Каналы закупки премиальной мужской косметики и профессионального оборудования.' },
];

// Филиал Шажимбаева — там работает сам Касым. Будет отдельный номер для франшизы — заменить.
export const FRANCHISE_WA = `https://wa.me/77079277780?text=${encodeURIComponent('Здравствуйте! Интересует франшиза Kasym Barbershop.')}`;

export const STATS = [
  { n: RATING.score, label: 'рейтинг в 2ГИС', gold: true },
  { n: String(RATING.votes), label: 'оценок' },
  { n: '3', label: 'филиала' },
  { n: '2020', label: 'год основания' },
];
