// ============================================
// 1. ДАННЫЕ СЕКЦИЙ
// ============================================
const SECTIONS = {
  services: 'services.html',
  masters: 'masters.html',
  subscriptions: 'subscriptions.html',
  promos: 'promos.html',
  reviews: 'reviews.html',
  contacts: 'contacts.html'
};

// ============================================
// 2. ЗАГРУЗКА СЕКЦИЙ
// ============================================
let currentSection = 'services';

function loadSection(sectionName) {
  const url = SECTIONS[sectionName];
  if (!url) return;

  currentSection = sectionName;
  const container = document.getElementById('app');
  
  fetch(url)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;
      // Анимируем элементы после загрузки
      setTimeout(() => {
        document.querySelectorAll('.fade-up').forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('visible');
          }
        });
      }, 100);
      // Обновляем навигацию
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('text-mint-500', link.dataset.section === sectionName);
      });
    })
    .catch(err => console.error('Ошибка загрузки:', err));
}

// ============================================
// 3. НАВИГАЦИЯ
// ============================================
document.addEventListener('click', function(e) {
  const link = e.target.closest('.nav-link');
  if (link) {
    e.preventDefault();
    const section = link.dataset.section;
    if (section && SECTIONS[section]) {
      loadSection(section);
      // Плавно скроллим к контенту
      const app = document.getElementById('app');
      if (app) {
        setTimeout(() => app.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      }
    }
  }
});

// ============================================
// 4. SCROLL АНИМАЦИИ (Intersection Observer)
// ============================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

function observeFadeElements() {
  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
}

// Запускаем после загрузки секций
const app = document.getElementById('app');
const appObserver = new MutationObserver(() => {
  observeFadeElements();
});
appObserver.observe(app, { childList: true, subtree: true });

// ============================================
// 5. КВИЗ
// ============================================
const quizState = {
  concerns: [],
  duration: 60,
  goal: null
};

const priceMap = {
  60:  { price: 2300, old: 2300 },
  90:  { price: 3350, old: 3350 },
  120: { price: 4500, old: 4500 }
};

const programMap = {
  health: {
    title: 'Перезагрузка тела',
    description: 'Глубокая проработка мышц и суставов. Снятие болей в спине и шее, восстановление подвижности, улучшение общего самочувствия. Идеально для тех, кто заботится о здоровье.'
  },
  relax: {
    title: 'Релаксирующий массаж',
    description: 'Мягкие плавные движения, ароматерапия и полная атмосфера покоя. Снимает стресс, нормализует сон, возвращает ощущение лёгкости и гармонии. Ваша личная перезагрузка.'
  },
  beauty: {
    title: 'Антицеллюлитный массаж',
    description: 'Интенсивная проработка проблемных зон. Улучшает состояние кожи, запускает процессы жиросжигания, моделирует силуэт. Видимый результат уже после курса.'
  }
};

function determineProgram() {
  if (quizState.goal) return programMap[quizState.goal];
  if (quizState.concerns.includes('spine')) return programMap.health;
  if (quizState.concerns.includes('stress') || quizState.concerns.includes('tired')) return programMap.relax;
  if (quizState.concerns.includes('beauty')) return programMap.beauty;
  if (quizState.concerns.includes('sport')) return programMap.health;
  return programMap.relax;
}

// Обработчики для чекбоксов (делегирование)
document.addEventListener('change', function(e) {
  if (e.target.closest('#step1Options') && e.target.type === 'checkbox') {
    const label = e.target.closest('label');
    if (e.target.checked) {
      label.classList.add('selected');
      if (!quizState.concerns.includes(e.target.value)) {
        quizState.concerns.push(e.target.value);
      }
    } else {
      label.classList.remove('selected');
      quizState.concerns = quizState.concerns.filter(v => v !== e.target.value);
    }
  }
  
  if (e.target.closest('#resultOptions') && e.target.type === 'radio') {
    document.querySelectorAll('#resultOptions label').forEach(l => l.classList.remove('selected'));
    e.target.closest('label').classList.add('selected');
    quizState.goal = e.target.value;
  }
});

function selectTime(el, minutes) {
  document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
  el.classList.add('selected');
  quizState.duration = minutes;
}

function nextQuizStep(n) {
  if (n === 3 && !quizState.duration) {
    alert('Пожалуйста, выберите длительность сеанса');
    return;
  }
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('hidden'));
  document.getElementById('quizStep' + n).classList.remove('hidden');
  document.querySelectorAll('.step-dot').forEach((d, i) => {
    d.classList.remove('active', 'done');
    if (i + 1 < n) d.classList.add('done');
    if (i + 1 === n) d.classList.add('active');
  });
}

function showQuizResult() {
  if (!quizState.goal && quizState.concerns.length === 0) {
    quizState.goal = 'relax';
  }
  const program = determineProgram();
  const duration = quizState.duration || 60;
  const priceInfo = priceMap[duration];
  const discountedPrice = Math.round(priceInfo.price * 0.8);
  
  document.getElementById('resultTitle').textContent = program.title;
  document.getElementById('resultDescription').textContent = program.description;
  document.getElementById('resultDuration').textContent = duration + ' мин';
  document.getElementById('resultOldPrice').textContent = priceInfo.old.toLocaleString('ru-RU') + '₽';
  document.getElementById('resultPrice').textContent = discountedPrice.toLocaleString('ru-RU') + '₽';
  
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('hidden'));
  document.getElementById('quizResult').classList.remove('hidden');
  document.querySelectorAll('.step-dot').forEach(d => d.classList.add('done'));
}

function openQuiz() {
  quizState.concerns = [];
  quizState.duration = 60;
  quizState.goal = null;
  document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => i.checked = false);
  document.getElementById('quizModal').classList.remove('hidden');
  document.getElementById('quizModal').classList.add('flex');
  document.body.style.overflow = 'hidden';
  nextQuizStep(1);
}

function closeQuiz() {
  document.getElementById('quizModal').classList.add('hidden');
  document.getElementById('quizModal').classList.remove('flex');
  document.body.style.overflow = '';
}

function toggleMenu() { 
  alert('Мобильное меню будет добавлено позже'); 
}

// Закрытие модалки по клику на фон
document.getElementById('quizModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'quizModal') {
    e.target.classList.add('hidden');
    e.target.classList.remove('flex');
    document.body.style.overflow = '';
  }
});

// ============================================
// 6. ЗАГРУЗКА ПЕРВОЙ СЕКЦИИ (по умолчанию services)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем hash в URL для загрузки нужной секции
  const hash = window.location.hash.replace('#', '');
  const section = SECTIONS[hash] ? hash : 'services';
  loadSection(section);
  
  // Подсвечиваем активную ссылку в навигации
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.section === section) {
      link.classList.add('text-mint-500');
    }
  });
});