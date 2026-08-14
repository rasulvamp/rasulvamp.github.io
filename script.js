let currentMonth = new Date();
currentMonth.setDate(1);
let checkIn = null;
let checkOut = null;

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const months = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];

function formatDate(d) {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function isPast(d) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return d < today;
}

function unavailable(d) {
  return SITE.unavailableDates.includes(dateKey(d));
}

function waUrl(phone, message) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

const defaultMessage = 'Здравствуйте! Хочу узнать о даче в СНТ «Золотой берег».';

$('heroPrice').textContent = SITE.pricePerNight.toLocaleString('ru-RU');
$('bookingPrice').textContent = SITE.pricePerNight.toLocaleString('ru-RU');
$('guests').textContent = SITE.guests;
$('seaDistance').textContent = SITE.seaDistance;
$('beds').textContent = SITE.beds;
$('parking').textContent = SITE.parking;
$('locationName').textContent = SITE.locationName;
$('coordinates').textContent = SITE.coordinates;
$('phone1').textContent = SITE.phone1Display;
$('phone2').textContent = SITE.phone2Display;

['headerWhatsApp','heroWhatsApp','bottomWhatsApp'].forEach((id) => {
  $(id).href = waUrl(SITE.whatsapp1, defaultMessage);
});
$('secondWhatsApp').href = waUrl(SITE.whatsapp2, defaultMessage);

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  $('monthTitle').textContent = `${months[month]} ${year}`;

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const start = (first.getDay() + 6) % 7;

  let html = '';
  for (let i = 0; i < start; i++) html += '<div class="day empty"></div>';

  for (let n = 1; n <= daysInMonth; n++) {
    const d = new Date(year, month, n);
    let cls = 'day';
    if (isPast(d)) cls += ' past';
    if (unavailable(d)) cls += ' disabled';
    if (checkIn && dateKey(d) === dateKey(checkIn)) cls += ' selected';
    if (checkOut && dateKey(d) === dateKey(checkOut)) cls += ' selected';
    if (checkIn && checkOut && d > checkIn && d < checkOut) cls += ' in-range';

    const disabled = isPast(d) || unavailable(d);
    html += `<button class="${cls}" data-date="${dateKey(d)}" ${disabled ? 'disabled' : ''}>${n}</button>`;
  }

  $('days').innerHTML = html;
  document.querySelectorAll('.day[data-date]').forEach((button) => {
    button.addEventListener('click', () => chooseDate(button.dataset.date));
  });
  updateSelection();
}

function chooseDate(key) {
  const d = new Date(key + 'T00:00:00');

  if (!checkIn || checkOut) {
    checkIn = d;
    checkOut = null;
  } else if (d <= checkIn) {
    checkIn = d;
    checkOut = null;
  } else {
    for (let x = new Date(checkIn); x < d; x.setDate(x.getDate() + 1)) {
      if (unavailable(x)) {
        alert('В выбранном периоде есть занятая дата. Выберите другой период.');
        return;
      }
    }
    checkOut = d;
  }
  renderCalendar();
}

function updateSelection() {
  const box = $('selectedDates');
  const button = $('requestBtn');

  if (!checkIn) {
    box.textContent = 'Выберите дату заезда';
    button.disabled = true;
    return;
  }

  if (!checkOut) {
    box.textContent = `Заезд: ${formatDate(checkIn)} — выберите выезд`;
    button.disabled = true;
    return;
  }

  const nights = Math.round((checkOut - checkIn) / 86400000);
  const total = nights * SITE.pricePerNight;
  box.innerHTML = `${formatDate(checkIn)} → ${formatDate(checkOut)} · <b>${nights} ночей</b> · ${total.toLocaleString('ru-RU')} ₽`;
  button.disabled = false;
}

$('prevMonth').onclick = () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
};

$('nextMonth').onclick = () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
};

$('requestBtn').onclick = () => {
  const nights = Math.round((checkOut - checkIn) / 86400000);
  const total = nights * SITE.pricePerNight;
  const message =
`Здравствуйте! Хочу узнать о возможности аренды дачи в СНТ «Золотой берег».

Заезд: ${formatDate(checkIn)}
Выезд: ${formatDate(checkOut)}
Ночей: ${nights}
Ориентировочная стоимость: ${total.toLocaleString('ru-RU')} ₽

Прошу подтвердить, свободны ли эти даты.`;

  // Пользователь указал, что бронирование подтверждается по телефону.
  window.open(`tel:${SITE.phone1}`, '_self');

  // Сообщение оставляем подготовленным для WhatsApp через кнопку ниже.
  $('bookingNote').textContent = 'Запрос сформирован. Для подтверждения позвоните по одному из указанных номеров.';
  $('bookingWhatsApp').href = waUrl(SITE.whatsapp1, message);
  $('bookingWhatsApp').classList.remove('hidden');
};

renderCalendar();
