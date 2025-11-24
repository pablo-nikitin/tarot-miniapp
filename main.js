// Telegram Mini App для выбора карт Таро

// --------- НАСТРОЙКИ ---------

// Сколько всего карт в "руке"
const TOTAL_CARDS = 7;

// Сколько карт можно выбрать
const MAX_SELECTED = 3;

// Картинка рубашки карты
const CARD_BACK_IMAGE = 'assets/cardback-CjgvbdyL.png';

// Картинки лиц карт (все 78 карт Таро)
const CARD_FRONT_IMAGES = [
  // Major Arcana (22 карты)
  'assets/cards/m00.jpg', 'assets/cards/m01.jpg', 'assets/cards/m02.jpg', 
  'assets/cards/m03.jpg', 'assets/cards/m04.jpg', 'assets/cards/m05.jpg',
  'assets/cards/m06.jpg', 'assets/cards/m07.jpg', 'assets/cards/m08.jpg',
  'assets/cards/m09.jpg', 'assets/cards/m10.jpg', 'assets/cards/m11.jpg',
  'assets/cards/m12.jpg', 'assets/cards/m13.jpg', 'assets/cards/m14.jpg',
  'assets/cards/m15.jpg', 'assets/cards/m16.jpg', 'assets/cards/m17.jpg',
  'assets/cards/m18.jpg', 'assets/cards/m19.jpg', 'assets/cards/m20.jpg',
  'assets/cards/m21.jpg',
  // Cups (14 карт)
  'assets/cards/c01.jpg', 'assets/cards/c02.jpg', 'assets/cards/c03.jpg',
  'assets/cards/c04.jpg', 'assets/cards/c05.jpg', 'assets/cards/c06.jpg',
  'assets/cards/c07.jpg', 'assets/cards/c08.jpg', 'assets/cards/c09.jpg',
  'assets/cards/c10.jpg', 'assets/cards/c11.jpg', 'assets/cards/c12.jpg',
  'assets/cards/c13.jpg', 'assets/cards/c14.jpg',
  // Swords (14 карт)
  'assets/cards/s01.jpg', 'assets/cards/s02.jpg', 'assets/cards/s03.jpg',
  'assets/cards/s04.jpg', 'assets/cards/s05.jpg', 'assets/cards/s06.jpg',
  'assets/cards/s07.jpg', 'assets/cards/s08.jpg', 'assets/cards/s09.jpg',
  'assets/cards/s10.jpg', 'assets/cards/s11.jpg', 'assets/cards/s12.jpg',
  'assets/cards/s13.jpg', 'assets/cards/s14.jpg',
  // Wands (14 карт)
  'assets/cards/w01.jpg', 'assets/cards/w02.jpg', 'assets/cards/w03.jpg',
  'assets/cards/w04.jpg', 'assets/cards/w05.jpg', 'assets/cards/w06.jpg',
  'assets/cards/w07.jpg', 'assets/cards/w08.jpg', 'assets/cards/w09.jpg',
  'assets/cards/w10.jpg', 'assets/cards/w11.jpg', 'assets/cards/w12.jpg',
  'assets/cards/w13.jpg', 'assets/cards/w14.jpg',
  // Pentacles (14 карт)
  'assets/cards/p01.jpg', 'assets/cards/p02.jpg', 'assets/cards/p03.jpg',
  'assets/cards/p04.jpg', 'assets/cards/p05.jpg', 'assets/cards/p06.jpg',
  'assets/cards/p07.jpg', 'assets/cards/p08.jpg', 'assets/cards/p09.jpg',
  'assets/cards/p10.jpg', 'assets/cards/p11.jpg', 'assets/cards/p12.jpg',
  'assets/cards/p13.jpg', 'assets/cards/p14.jpg'
];

// id контейнера с картами и кнопки "Продолжить" в HTML
const CARDS_CONTAINER_ID = 'cards-container';
const PROCEED_BUTTON_ID  = 'proceed-btn';

// --------- СОСТОЯНИЕ ---------

let selectedIndexes = [];          // какие позиции (0..6) выбраны
let selectedFaces   = [];          // какие именно картинки лиц попали
const usedFaceIndexes = new Set(); // чтобы не повторялись картинки

// --------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---------

function getRandomFaceImage() {
  // возвращаем случайную картинку лица без повторов
  if (usedFaceIndexes.size >= CARD_FRONT_IMAGES.length) {
    // если картинок меньше, чем нужно — начнём заново
    usedFaceIndexes.clear();
  }

  let idx;
  do {
    idx = Math.floor(Math.random() * CARD_FRONT_IMAGES.length);
  } while (usedFaceIndexes.has(idx) && usedFaceIndexes.size < CARD_FRONT_IMAGES.length);

  usedFaceIndexes.add(idx);
  return {
    index: idx,
    url: CARD_FRONT_IMAGES[idx]
  };
}

function sendResultToTelegram() {
  const payload = {
    selectedPositions: selectedIndexes, // какие места из 7 были выбраны
    selectedFaces: selectedFaces       // какие конкретно картинки
  };

  // если мини-аппа запущена внутри Telegram
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.sendData(JSON.stringify(payload));
    tg.close(); // закрываем веб-аппу
  } else {
    // для локальной отладки в браузере
    console.log('Selected cards:', payload);
    alert('Выбранные карты:\n' + JSON.stringify(payload, null, 2));
  }
}

// --------- ЛОГИКА КАРТ ---------

function createCardElement(index) {
  // Корневая обёртка одной карты
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = String(index);

  // Внутренняя часть для 3D-переворота
  const inner = document.createElement('div');
  inner.className = 'card-inner';

  // Задняя сторона
  const back = document.createElement('div');
  back.className = 'card-face card-back';
  back.style.backgroundImage = `url("${CARD_BACK_IMAGE}")`;
  back.style.backgroundSize = 'cover';
  back.style.backgroundPosition = 'center';

  // Передняя сторона
  const front = document.createElement('div');
  front.className = 'card-face card-front';
  front.style.backgroundSize = 'cover';
  front.style.backgroundPosition = 'center';

  inner.appendChild(back);
  inner.appendChild(front);
  card.appendChild(inner);

  // Обработчик клика
  card.addEventListener('click', () => {
    handleCardClick(card, inner, front);
  });

  return card;
}

function handleCardClick(cardElement, innerElement, frontElement) {
  const index = Number(cardElement.dataset.index);

  // уже выбрана — игнорируем
  if (selectedIndexes.includes(index)) return;

  // уже выбрано 3 карты — больше нельзя
  if (selectedIndexes.length >= MAX_SELECTED) return;

  // случайная картинка лица
  const face = getRandomFaceImage();
  frontElement.style.backgroundImage = `url("${face.url}")`;

  // добавляем классы для переворота
  innerElement.classList.add('card-inner--flipped');

  // сохраняем выбор
  selectedIndexes.push(index);
  selectedFaces.push(face);

  // если набрали максимум — показываем кнопку
  if (selectedIndexes.length >= MAX_SELECTED) {
    const btn = document.getElementById(PROCEED_BUTTON_ID);
    if (btn) {
      btn.disabled = false;
      btn.classList.add('proceed-btn--visible');
    }
  }
}

// --------- ИНИЦИАЛИЗАЦИЯ ---------

function initMiniApp() {
  const container = document.getElementById(CARDS_CONTAINER_ID);
  const proceedBtn = document.getElementById(PROCEED_BUTTON_ID);

  if (!container) {
    console.error(`Не найден элемент с id="${CARDS_CONTAINER_ID}"`);
    return;
  }
  if (!proceedBtn) {
    console.error(`Не найдена кнопка с id="${PROCEED_BUTTON_ID}"`);
    return;
  }

  // Телеграм-инициализация (опционально)
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Применяем тему Telegram
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#1a1a1a';
  }

  // создаём 7 карт
  for (let i = 0; i < TOTAL_CARDS; i++) {
    const cardEl = createCardElement(i);
    container.appendChild(cardEl);
  }

  // кнопка "Продолжить"
  proceedBtn.disabled = true;
  proceedBtn.addEventListener('click', sendResultToTelegram);
}

// Запуск, когда DOM готов
document.addEventListener('DOMContentLoaded', initMiniApp);
