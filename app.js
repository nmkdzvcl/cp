/* ===============================================
   CP TRAINING HUB — Application Logic v2
   + Theme Toggle + Solved Tracker + Templates
   =============================================== */

// ============== CONSTANTS ==============
const CF_API_URL = 'https://codeforces.com/api/problemset.problems';
const CF_PROBLEM_URL = 'https://codeforces.com/problemset/problem';
const STORAGE_KEYS = {
  bookmarks: 'cpHub_bookmarks',
  solved: 'cpHub_solved',
  schedule: 'cpHub_schedule',
  problemsCache: 'cpHub_problemsCache',
  problemsCacheTime: 'cpHub_problemsCacheTime',
  theme: 'cpHub_theme',
  customTemplates: 'cpHub_customTemplates',
};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const PROBLEMS_PER_PAGE = 24;
const SCHEDULE_START_HOUR = 5;
const SCHEDULE_END_HOUR = 24;

const CF_TAGS = [
  'implementation', 'dp', 'math', 'greedy', 'brute force',
  'data structures', 'constructive algorithms', 'graphs', 'sortings',
  'binary search', 'dfs and similar', 'trees', 'strings',
  'number theory', 'combinatorics', 'geometry', 'bitmasks',
  'two pointers', 'dsu', 'shortest paths', 'probabilities',
  'divide and conquer', 'hashing', 'games', 'flows',
  'interactive', 'matrices', 'fft', 'ternary search',
  'expression parsing', 'meet-in-the-middle', '2-sat',
  'chinese remainder theorem'
];

const CATEGORIES = {
  cp: { label: 'CP', color: '#00d4ff' },
  ielts: { label: 'IELTS', color: '#f59e0b' },
  school: { label: 'Học văn hóa', color: '#10b981' },
  exercise: { label: 'Thể dục', color: '#8b5cf6' },
  rest: { label: 'Nghỉ ngơi', color: '#ec4899' },
  other: { label: 'Khác', color: '#6b7280' },
};

const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ============== BUILT-IN TEMPLATES ==============
const BUILTIN_TEMPLATES = [
  {
    id: '__weekday',
    name: 'Ngày thường',
    icon: '📚',
    builtin: true,
    events: [
      { title: 'Thể dục buổi sáng', startTime: '06:00', endTime: '06:30', category: 'exercise', notes: 'Chạy bộ / thể dục nhẹ' },
      { title: 'Học tại trường (sáng)', startTime: '07:00', endTime: '11:30', category: 'school', notes: '' },
      { title: 'Học tại trường (chiều)', startTime: '13:00', endTime: '16:30', category: 'school', notes: '' },
      { title: 'Thể dục / Thư giãn', startTime: '17:00', endTime: '17:45', category: 'exercise', notes: 'Bơi / gym / đi bộ' },
      { title: 'Luyện CP', startTime: '19:00', endTime: '21:30', category: 'cp', notes: 'Giải 2-3 bài, tăng dần độ khó' },
      { title: 'IELTS - Vocab & Listening', startTime: '21:30', endTime: '22:15', category: 'ielts', notes: 'Anki flashcards + 1 bài listening' },
    ]
  },
  {
    id: '__weekend',
    name: 'Cuối tuần',
    icon: '🏆',
    builtin: true,
    events: [
      { title: 'Thể dục buổi sáng', startTime: '06:30', endTime: '07:15', category: 'exercise', notes: 'Chạy bộ hoặc gym' },
      { title: 'Virtual Contest + Upsolve', startTime: '08:00', endTime: '12:00', category: 'cp', notes: 'Codeforces Div2 virtual (2h) + upsolve (2h)' },
      { title: 'IELTS - Reading & Writing', startTime: '13:30', endTime: '15:30', category: 'ielts', notes: '1 bài Reading + 1 bài Writing Task 2' },
      { title: 'Nghỉ ngơi / Giải trí', startTime: '16:00', endTime: '17:30', category: 'rest', notes: 'Game, phim, đi chơi với bạn bè' },
      { title: 'Ôn thuật toán / Giải bài mới', startTime: '19:00', endTime: '21:00', category: 'cp', notes: 'Ôn lại bài khó trong tuần, viết editorial' },
      { title: 'Đọc editorial + Ghi chú', startTime: '21:00', endTime: '22:00', category: 'cp', notes: 'Cập nhật notebook thuật toán cá nhân' },
    ]
  },
  {
    id: '__light',
    name: 'Ngày nhẹ',
    icon: '🌿',
    builtin: true,
    events: [
      { title: 'Thể dục', startTime: '07:00', endTime: '07:45', category: 'exercise', notes: '' },
      { title: 'Ôn bài nhẹ', startTime: '09:00', endTime: '11:00', category: 'cp', notes: 'Giải bài dễ, ôn lại concept cũ' },
      { title: 'IELTS - Speaking practice', startTime: '14:00', endTime: '15:00', category: 'ielts', notes: 'Luyện speaking với AI hoặc bạn' },
      { title: 'Nghỉ ngơi / Sở thích', startTime: '15:30', endTime: '17:30', category: 'rest', notes: 'Đọc sách, xem phim, đi chơi' },
      { title: 'Review tuần + Lên kế hoạch', startTime: '20:00', endTime: '21:00', category: 'other', notes: 'Đánh giá tiến độ, điều chỉnh mục tiêu' },
    ]
  }
];

// ============== STATE ==============
const state = {
  allProblems: [],
  filteredProblems: [],
  currentPage: 1,
  currentSort: 'rating-asc',
  selectedTags: new Set(),
  bookmarks: new Set(),
  solved: new Set(),
  isLoading: false,

  events: {},
  selectedDate: null,
  weekStart: null,

  currentPageName: 'problems',
  theme: 'dark',
  customTemplates: [],
  selectedTemplateId: null,
};

// ============== UTILITIES ==============
function $(id) { return document.getElementById(id); }
function $$(selector) { return document.querySelectorAll(selector); }

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateVi(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isToday(date) {
  const t = new Date();
  return date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate();
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getRatingColor(rating) {
  if (!rating) return '#808080';
  if (rating < 1200) return '#808080';
  if (rating < 1400) return '#00c853';
  if (rating < 1600) return '#03a89e';
  if (rating < 1800) return '#2962ff';
  if (rating < 2000) return '#aa00ff';
  if (rating < 2200) return '#ffab00';
  if (rating < 2400) return '#ff6d00';
  return '#d50000';
}

// ============== TOAST ==============
function showToast(message, type = 'info') {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============== THEME ==============
function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  state.theme = saved || 'dark';
  applyTheme();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  applyTheme();
}

function applyTheme() {
  if (state.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    $('theme-toggle').textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    $('theme-toggle').textContent = '🌙';
  }
}

// ============== STORAGE ==============
function loadBookmarks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.bookmarks);
    state.bookmarks = new Set(data ? JSON.parse(data) : []);
  } catch { state.bookmarks = new Set(); }
}

function saveBookmarks() {
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify([...state.bookmarks]));
  updateStatsBar();
}

function loadSolved() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.solved);
    state.solved = new Set(data ? JSON.parse(data) : []);
  } catch { state.solved = new Set(); }
}

function saveSolved() {
  localStorage.setItem(STORAGE_KEYS.solved, JSON.stringify([...state.solved]));
  updateStatsBar();
  renderSolvedStats();
}

function loadSchedule() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.schedule);
    state.events = data ? JSON.parse(data) : {};
  } catch { state.events = {}; }
}

function saveSchedule() {
  localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(state.events));
  updateStatsBar();
}

function loadCustomTemplates() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.customTemplates);
    state.customTemplates = data ? JSON.parse(data) : [];
  } catch { state.customTemplates = []; }
}

function saveCustomTemplates() {
  localStorage.setItem(STORAGE_KEYS.customTemplates, JSON.stringify(state.customTemplates));
}

function getCachedProblems() {
  try {
    const cacheTime = localStorage.getItem(STORAGE_KEYS.problemsCacheTime);
    if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
      const data = localStorage.getItem(STORAGE_KEYS.problemsCache);
      if (data) return JSON.parse(data);
    }
  } catch {}
  return null;
}

function setCachedProblems(problems) {
  try {
    localStorage.setItem(STORAGE_KEYS.problemsCache, JSON.stringify(problems));
    localStorage.setItem(STORAGE_KEYS.problemsCacheTime, String(Date.now()));
  } catch {}
}

// ============== NAVIGATION ==============
function navigateTo(pageName) {
  state.currentPageName = pageName;
  $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageName));
  $$('.page').forEach(page => page.classList.toggle('active', page.id === `${pageName}-page`));
  $('sidebar').classList.remove('open');
}

// ============== STATS BAR ==============
function updateStatsBar() {
  $('total-solved').textContent = state.bookmarks.size;
  const todayKey = formatDate(new Date());
  const todayEvents = state.events[todayKey] || [];
  $('today-tasks').textContent = todayEvents.length;
}

// ============== SOLVED STATS ==============
function renderSolvedStats() {
  let total = 0, easy = 0, medium = 0, hard = 0;

  state.solved.forEach(id => {
    const p = state.allProblems.find(pr => pr.id === id);
    if (p) {
      total++;
      if (p.rating <= 1400) easy++;
      else if (p.rating <= 1900) medium++;
      else hard++;
    } else {
      total++; // Count even if not in current cache
    }
  });

  $('solved-total').textContent = total;
  $('solved-easy').textContent = easy;
  $('solved-medium').textContent = medium;
  $('solved-hard').textContent = hard;
}

function clearSolved() {
  if (!confirm('Bạn có chắc muốn reset bộ đếm bài đã giải?')) return;
  state.solved.clear();
  saveSolved();
  renderProblems();
  renderBookmarks();
  showToast('Đã reset bộ đếm', 'info');
}

// ============================================================
//  PROBLEM FINDER
// ============================================================

async function fetchProblems() {
  const cached = getCachedProblems();
  if (cached) {
    state.allProblems = cached;
    return;
  }

  state.isLoading = true;
  $('problems-loading').classList.add('active');
  $('problems-grid').innerHTML = '';

  try {
    const response = await fetch(CF_API_URL);
    if (!response.ok) throw new Error('Codeforces API error');
    const data = await response.json();
    if (data.status !== 'OK') throw new Error(data.comment || 'API Error');

    const problemStats = {};
    if (data.result.problemStatistics) {
      data.result.problemStatistics.forEach(ps => {
        const key = `${ps.contestId}-${ps.index}`;
        problemStats[key] = ps.solvedCount;
      });
    }

    state.allProblems = data.result.problems
      .filter(p => p.rating)
      .map(p => ({
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        tags: p.tags || [],
        solvedCount: problemStats[`${p.contestId}-${p.index}`] || 0,
        id: `${p.contestId}${p.index}`,
        url: `${CF_PROBLEM_URL}/${p.contestId}/${p.index}`,
      }));

    setCachedProblems(state.allProblems);
  } catch (error) {
    showToast('Không thể tải dữ liệu từ Codeforces. Thử lại sau.', 'error');
    console.error('Fetch error:', error);
  } finally {
    state.isLoading = false;
    $('problems-loading').classList.remove('active');
  }
}

function initTagsUI() {
  const container = $('tags-container');
  container.innerHTML = '';
  CF_TAGS.forEach(tag => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tag-chip';
    chip.textContent = tag;
    chip.dataset.tag = tag;
    chip.addEventListener('click', () => {
      if (state.selectedTags.has(tag)) {
        state.selectedTags.delete(tag);
        chip.classList.remove('selected');
      } else {
        state.selectedTags.add(tag);
        chip.classList.add('selected');
      }
    });
    container.appendChild(chip);
  });
}

function filterProblems() {
  const minRating = parseInt($('rating-min').value) || 0;
  const maxRating = parseInt($('rating-max').value) || 9999;
  const tags = state.selectedTags;

  state.filteredProblems = state.allProblems.filter(p => {
    if (p.rating < minRating || p.rating > maxRating) return false;
    if (tags.size > 0 && ![...tags].some(t => p.tags.includes(t))) return false;
    return true;
  });

  sortProblems();
  state.currentPage = 1;
  renderProblems();
}

function sortProblems() {
  const sort = state.currentSort;
  state.filteredProblems.sort((a, b) => {
    switch (sort) {
      case 'rating-asc': return a.rating - b.rating;
      case 'rating-desc': return b.rating - a.rating;
      case 'solved-desc': return b.solvedCount - a.solvedCount;
      case 'id-desc': return b.contestId - a.contestId;
      default: return 0;
    }
  });
}

function renderProblems() {
  const grid = $('problems-grid');
  const start = (state.currentPage - 1) * PROBLEMS_PER_PAGE;
  const end = start + PROBLEMS_PER_PAGE;
  const page = state.filteredProblems.slice(start, end);
  const totalPages = Math.ceil(state.filteredProblems.length / PROBLEMS_PER_PAGE);

  grid.innerHTML = '';

  if (page.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔍</div>
        <p class="empty-state-text">Không tìm thấy bài tập nào</p>
        <p class="empty-state-sub">Thử điều chỉnh filter hoặc xóa bộ lọc</p>
      </div>`;
    $('sort-bar').style.display = 'none';
    $('pagination').style.display = 'none';
    $('results-count').textContent = '';
    return;
  }

  $('sort-bar').style.display = 'flex';
  $('results-count').textContent = `${state.filteredProblems.length} bài`;

  page.forEach(problem => grid.appendChild(createProblemCard(problem)));

  if (totalPages > 1) {
    $('pagination').style.display = 'flex';
    $('page-info').textContent = `${state.currentPage} / ${totalPages}`;
    $('prev-page-btn').disabled = state.currentPage <= 1;
    $('next-page-btn').disabled = state.currentPage >= totalPages;
  } else {
    $('pagination').style.display = 'none';
  }
}

function createProblemCard(problem) {
  const card = document.createElement('div');
  const isSolved = state.solved.has(problem.id);
  card.className = `problem-card${isSolved ? ' is-solved' : ''}`;
  card.style.setProperty('--card-accent', getRatingColor(problem.rating));

  const isBookmarked = state.bookmarks.has(problem.id);
  const ratingColor = getRatingColor(problem.rating);

  card.innerHTML = `
    <div class="problem-header">
      <div>
        <div class="problem-id">${problem.contestId}${problem.index}</div>
        <div class="problem-name">
          <a href="${problem.url}" target="_blank" rel="noopener">${problem.name}</a>
        </div>
      </div>
      <span class="problem-rating-badge" style="color:${ratingColor};border-color:${ratingColor}30;background:${ratingColor}10">
        ${problem.rating}
      </span>
    </div>
    <div class="problem-tags">
      ${problem.tags.map(t => `<span class="problem-tag">${t}</span>`).join('')}
    </div>
    <div class="problem-footer">
      <span class="problem-solved">Solved: <span>${problem.solvedCount.toLocaleString()}</span></span>
      <div class="problem-actions">
        <button class="solved-btn ${isSolved ? 'solved' : ''}" data-problem-id="${problem.id}" title="${isSolved ? 'Bỏ đánh dấu đã giải' : 'Đánh dấu đã giải'}">
          ${isSolved ? '✔' : '○'}
        </button>
        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-problem-id="${problem.id}" title="Bookmark">
          ${isBookmarked ? '⭐' : '☆'}
        </button>
      </div>
    </div>`;

  // Solved click
  card.querySelector('.solved-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSolvedProblem(problem.id, e.currentTarget, card);
  });

  // Bookmark click
  card.querySelector('.bookmark-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBookmark(problem.id, e.currentTarget);
  });

  return card;
}

function toggleSolvedProblem(problemId, btnEl, cardEl) {
  if (state.solved.has(problemId)) {
    state.solved.delete(problemId);
    btnEl.classList.remove('solved');
    btnEl.textContent = '○';
    btnEl.title = 'Đánh dấu đã giải';
    cardEl.classList.remove('is-solved');
    const nameLink = cardEl.querySelector('.problem-name a');
    if (nameLink) nameLink.style.textDecoration = '';
    showToast('Đã bỏ đánh dấu', 'info');
  } else {
    state.solved.add(problemId);
    btnEl.classList.add('solved');
    btnEl.textContent = '✔';
    btnEl.title = 'Bỏ đánh dấu đã giải';
    cardEl.classList.add('is-solved');
    showToast('✅ Đã giải! Tuyệt vời!', 'success');
  }
  saveSolved();
}

function toggleBookmark(problemId, btnEl) {
  if (state.bookmarks.has(problemId)) {
    state.bookmarks.delete(problemId);
    btnEl.classList.remove('bookmarked');
    btnEl.textContent = '☆';
    showToast('Đã bỏ bookmark', 'info');
  } else {
    state.bookmarks.add(problemId);
    btnEl.classList.add('bookmarked');
    btnEl.textContent = '⭐';
    showToast('Đã bookmark bài tập!', 'success');
  }
  saveBookmarks();
  renderBookmarks();
}

function randomProblem() {
  if (state.filteredProblems.length === 0) {
    filterProblems();
    if (state.filteredProblems.length === 0) {
      showToast('Không có bài tập nào phù hợp filter', 'error');
      return;
    }
  }
  const idx = Math.floor(Math.random() * state.filteredProblems.length);
  const problem = state.filteredProblems[idx];
  window.open(problem.url, '_blank');
  showToast(`🎲 Random: ${problem.contestId}${problem.index} - ${problem.name} (${problem.rating})`, 'success');
}

function clearFilters() {
  $('rating-min').value = '';
  $('rating-max').value = '';
  state.selectedTags.clear();
  $$('.tag-chip').forEach(c => c.classList.remove('selected'));
  state.filteredProblems = [...state.allProblems];
  sortProblems();
  state.currentPage = 1;
  renderProblems();
}

function renderBookmarks() {
  const list = $('bookmarks-list');
  if (state.bookmarks.size === 0) {
    list.innerHTML = '<p class="bookmarks-empty">Chưa có bài tập nào được bookmark. Nhấn ☆ trên thẻ bài tập để thêm.</p>';
    return;
  }
  list.innerHTML = '';
  state.allProblems
    .filter(p => state.bookmarks.has(p.id))
    .forEach(p => list.appendChild(createProblemCard(p)));
}

// ============================================================
//  SCHEDULE PLANNER
// ============================================================

function initSchedule() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  state.selectedDate = today;
  state.weekStart = getMonday(today);
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

function renderWeekHeader() {
  const container = $('week-header');
  container.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = addDays(state.weekStart, i);
    const dateKey = formatDate(date);
    const events = state.events[dateKey] || [];
    const isActive = isSameDay(date, state.selectedDate);
    const isTodayDate = isToday(date);

    const tab = document.createElement('div');
    tab.className = `day-tab${isActive ? ' active' : ''}${isTodayDate ? ' today' : ''}`;
    tab.dataset.date = dateKey;
    tab.innerHTML = `
      <span class="day-tab-name">${DAY_NAMES_VI[date.getDay()]}</span>
      <span class="day-tab-date">${date.getDate()}</span>
      <span class="day-tab-count">${events.length > 0 ? events.length + ' sự kiện' : '—'}</span>`;

    tab.addEventListener('click', () => {
      state.selectedDate = parseDate(dateKey);
      renderWeekHeader();
      renderDayView();
    });
    container.appendChild(tab);
  }
}

function renderDayView() {
  const timeCol = $('time-column');
  const eventsCol = $('events-column');
  timeCol.innerHTML = '';
  eventsCol.innerHTML = '';

  for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = `${String(h).padStart(2, '0')}:00`;
    timeCol.appendChild(label);
  }

  for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.dataset.hour = h;
    const halfLine = document.createElement('div');
    halfLine.className = 'time-slot-half';
    slot.appendChild(halfLine);
    slot.addEventListener('click', () => openEventModal(null, h));
    eventsCol.appendChild(slot);
  }

  const dateKey = formatDate(state.selectedDate);
  const dayEvents = state.events[dateKey] || [];

  dayEvents.forEach(event => {
    const startMin = timeToMinutes(event.startTime);
    const endMin = timeToMinutes(event.endTime);
    const scheduleStartMin = SCHEDULE_START_HOUR * 60;
    const top = ((startMin - scheduleStartMin) / 60) * 60;
    const height = Math.max(((endMin - startMin) / 60) * 60, 28);

    const block = document.createElement('div');
    block.className = `event-block cat-${event.category}`;
    block.style.top = `${top}px`;
    block.style.height = `${height}px`;
    block.innerHTML = `
      <div class="event-title">${event.title}</div>
      ${height >= 40 ? `<div class="event-time">${event.startTime} - ${event.endTime}</div>` : ''}
      ${height >= 56 && event.notes ? `<div class="event-notes-preview">${event.notes}</div>` : ''}`;

    block.addEventListener('click', (e) => { e.stopPropagation(); openEventModal(event); });
    eventsCol.appendChild(block);
  });

  if (isToday(state.selectedDate)) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const scheduleStartMin = SCHEDULE_START_HOUR * 60;
    const scheduleEndMin = SCHEDULE_END_HOUR * 60;
    if (nowMin >= scheduleStartMin && nowMin < scheduleEndMin) {
      const line = document.createElement('div');
      line.className = 'current-time-line';
      line.style.top = `${((nowMin - scheduleStartMin) / 60) * 60}px`;
      eventsCol.appendChild(line);
    }
  }
}

function renderWeekOverview() {
  const container = $('week-stats');
  container.innerHTML = '';
  const categoryHours = {};
  Object.keys(CATEGORIES).forEach(cat => { categoryHours[cat] = 0; });

  for (let i = 0; i < 7; i++) {
    const date = addDays(state.weekStart, i);
    const dateKey = formatDate(date);
    (state.events[dateKey] || []).forEach(event => {
      const hours = (timeToMinutes(event.endTime) - timeToMinutes(event.startTime)) / 60;
      if (categoryHours[event.category] !== undefined) categoryHours[event.category] += hours;
    });
  }

  let totalHours = 0;
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const hours = categoryHours[key] || 0;
    totalHours += hours;
    const card = document.createElement('div');
    card.className = 'week-stat-card';
    card.innerHTML = `
      <div class="cat-label"><span class="cat-dot ${key}"></span>${cat.label}</div>
      <div class="hours" style="color:${cat.color}">${hours.toFixed(1)}</div>
      <div class="hours-label">giờ</div>`;
    container.appendChild(card);
  });

  const totalCard = document.createElement('div');
  totalCard.className = 'week-stat-card';
  totalCard.innerHTML = `
    <div class="cat-label">📊 Tổng</div>
    <div class="hours" style="color:var(--text-primary)">${totalHours.toFixed(1)}</div>
    <div class="hours-label">giờ</div>`;
  container.appendChild(totalCard);
}

// ============== EVENT MODAL ==============
let editingEventId = null;

function openEventModal(event = null, defaultHour = null) {
  $('event-modal').style.display = 'flex';

  if (event) {
    editingEventId = event.id;
    $('modal-title').textContent = 'Chỉnh sửa sự kiện';
    $('event-id').value = event.id;
    $('event-title').value = event.title;
    $('event-date').value = formatDate(state.selectedDate);
    $('event-start').value = event.startTime;
    $('event-end').value = event.endTime;
    $('event-notes').value = event.notes || '';
    $('modal-delete-btn').style.display = 'inline-flex';
    $$('#event-form .cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === event.category));
  } else {
    editingEventId = null;
    $('modal-title').textContent = 'Thêm sự kiện';
    $('event-form').reset();
    $('event-date').value = formatDate(state.selectedDate);
    $('modal-delete-btn').style.display = 'none';
    if (defaultHour !== null) {
      $('event-start').value = `${String(defaultHour).padStart(2, '0')}:00`;
      $('event-end').value = `${String(Math.min(defaultHour + 2, 23)).padStart(2, '0')}:00`;
    } else {
      $('event-start').value = '19:00';
      $('event-end').value = '21:00';
    }
    $$('#event-form .cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === 'cp'));
  }
  setTimeout(() => $('event-title').focus(), 100);
}

function closeEventModal() {
  $('event-modal').style.display = 'none';
  editingEventId = null;
}

function getSelectedCategory() {
  const active = document.querySelector('#event-form .cat-btn.active');
  return active ? active.dataset.cat : 'other';
}

function saveEvent() {
  const title = $('event-title').value.trim();
  const dateStr = $('event-date').value;
  const startTime = $('event-start').value;
  const endTime = $('event-end').value;
  const notes = $('event-notes').value.trim();
  const category = getSelectedCategory();

  if (!title || !dateStr || !startTime || !endTime) {
    showToast('Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    showToast('Thời gian kết thúc phải sau thời gian bắt đầu', 'error');
    return;
  }

  if (!state.events[dateStr]) state.events[dateStr] = [];

  if (editingEventId) {
    const oldDateStr = formatDate(state.selectedDate);
    if (state.events[oldDateStr]) {
      state.events[oldDateStr] = state.events[oldDateStr].filter(e => e.id !== editingEventId);
      if (state.events[oldDateStr].length === 0) delete state.events[oldDateStr];
    }
    if (!state.events[dateStr]) state.events[dateStr] = [];
    state.events[dateStr].push({ id: editingEventId, title, startTime, endTime, category, notes });
    showToast('Đã cập nhật sự kiện!', 'success');
  } else {
    state.events[dateStr].push({ id: generateId(), title, startTime, endTime, category, notes });
    showToast('Đã thêm sự kiện mới!', 'success');
  }

  state.events[dateStr].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  saveSchedule();
  closeEventModal();
  state.selectedDate = parseDate(dateStr);
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

function deleteEvent() {
  if (!editingEventId) return;
  const dateStr = formatDate(state.selectedDate);
  if (state.events[dateStr]) {
    state.events[dateStr] = state.events[dateStr].filter(e => e.id !== editingEventId);
    if (state.events[dateStr].length === 0) delete state.events[dateStr];
  }
  saveSchedule();
  closeEventModal();
  showToast('Đã xóa sự kiện', 'info');
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

// ============== COPY DAY ==============
function openCopyModal() {
  $('copy-modal').style.display = 'flex';
  $('copy-source').value = formatDate(state.selectedDate);
  $('copy-target').value = '';
}

function closeCopyModal() { $('copy-modal').style.display = 'none'; }

function copyDay() {
  const source = $('copy-source').value;
  const target = $('copy-target').value;
  if (!source || !target) { showToast('Vui lòng chọn cả ngày nguồn và ngày đích', 'error'); return; }
  if (source === target) { showToast('Ngày nguồn và ngày đích phải khác nhau', 'error'); return; }
  const sourceEvents = state.events[source] || [];
  if (sourceEvents.length === 0) { showToast('Ngày nguồn không có sự kiện nào', 'error'); return; }
  state.events[target] = sourceEvents.map(e => ({ ...e, id: generateId() }));
  saveSchedule();
  closeCopyModal();
  showToast(`Đã sao chép ${sourceEvents.length} sự kiện!`, 'success');
  state.selectedDate = parseDate(target);
  state.weekStart = getMonday(state.selectedDate);
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

function clearDay() {
  const dateKey = formatDate(state.selectedDate);
  const events = state.events[dateKey] || [];
  if (events.length === 0) { showToast('Ngày này không có sự kiện nào', 'info'); return; }
  if (!confirm(`Xóa tất cả ${events.length} sự kiện trong ngày ${formatDateVi(dateKey)}?`)) return;
  delete state.events[dateKey];
  saveSchedule();
  showToast('Đã xóa tất cả sự kiện trong ngày', 'info');
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

// ============== WEEK NAVIGATION ==============
function prevWeek() {
  state.weekStart = addDays(state.weekStart, -7);
  state.selectedDate = state.weekStart;
  renderWeekHeader(); renderDayView(); renderWeekOverview();
}
function nextWeek() {
  state.weekStart = addDays(state.weekStart, 7);
  state.selectedDate = state.weekStart;
  renderWeekHeader(); renderDayView(); renderWeekOverview();
}
function goToToday() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  state.selectedDate = today;
  state.weekStart = getMonday(today);
  renderWeekHeader(); renderDayView(); renderWeekOverview();
}

// ============================================================
//  TEMPLATE SYSTEM
// ============================================================

function getAllTemplates() {
  return [...BUILTIN_TEMPLATES, ...state.customTemplates];
}

function openTemplateModal() {
  state.selectedTemplateId = null;
  $('template-modal').style.display = 'flex';
  $('template-target-date').textContent = formatDateVi(formatDate(state.selectedDate));
  $('template-apply-btn').disabled = true;
  $('template-preview').style.display = 'none';
  renderTemplateGrid();
}

function closeTemplateModal() {
  $('template-modal').style.display = 'none';
  state.selectedTemplateId = null;
}

function renderTemplateGrid() {
  const container = $('template-grid');
  container.innerHTML = '';
  const templates = getAllTemplates();

  templates.forEach(tmpl => {
    const card = document.createElement('div');
    card.className = `template-card${state.selectedTemplateId === tmpl.id ? ' selected' : ''}`;
    card.innerHTML = `
      <span class="template-card-icon">${tmpl.icon || '📄'}</span>
      <div class="template-card-name">${tmpl.name}</div>
      <div class="template-card-count">${tmpl.events.length} sự kiện</div>
      ${!tmpl.builtin ? `<button class="template-delete-btn" data-tmpl-id="${tmpl.id}">Xóa template</button>` : ''}`;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('template-delete-btn')) return;
      selectTemplate(tmpl.id);
    });

    // Delete button for custom templates
    const delBtn = card.querySelector('.template-delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCustomTemplate(tmpl.id);
      });
    }

    container.appendChild(card);
  });
}

function selectTemplate(templateId) {
  state.selectedTemplateId = templateId;
  $('template-apply-btn').disabled = false;

  // Highlight selected
  $$('.template-card').forEach(c => c.classList.remove('selected'));
  const allTemplates = getAllTemplates();
  const idx = allTemplates.findIndex(t => t.id === templateId);
  if (idx >= 0) {
    $('template-grid').children[idx]?.classList.add('selected');
  }

  // Show preview
  const template = allTemplates.find(t => t.id === templateId);
  if (template) {
    $('template-preview').style.display = 'block';
    const list = $('template-events-list');
    list.innerHTML = '';
    template.events.forEach(ev => {
      const catInfo = CATEGORIES[ev.category] || CATEGORIES.other;
      const item = document.createElement('div');
      item.className = 'template-event-item';
      item.style.borderLeftColor = catInfo.color;
      item.innerHTML = `
        <span class="te-time">${ev.startTime} – ${ev.endTime}</span>
        <span class="te-title">${ev.title}</span>`;
      list.appendChild(item);
    });
  }
}

function applyTemplate() {
  const template = getAllTemplates().find(t => t.id === state.selectedTemplateId);
  if (!template) return;

  const dateKey = formatDate(state.selectedDate);
  const existing = state.events[dateKey] || [];

  if (existing.length > 0) {
    if (!confirm(`Ngày ${formatDateVi(dateKey)} đã có ${existing.length} sự kiện. Thay thế toàn bộ?`)) return;
  }

  state.events[dateKey] = template.events.map(ev => ({
    id: generateId(),
    title: ev.title,
    startTime: ev.startTime,
    endTime: ev.endTime,
    category: ev.category,
    notes: ev.notes || '',
  }));

  saveSchedule();
  closeTemplateModal();
  showToast(`Đã áp dụng template "${template.name}"!`, 'success');
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

function saveCurrentDayAsTemplate() {
  const dateKey = formatDate(state.selectedDate);
  const dayEvents = state.events[dateKey] || [];

  if (dayEvents.length === 0) {
    showToast('Ngày hiện tại không có sự kiện nào để lưu', 'error');
    return;
  }

  const name = prompt('Đặt tên cho template:', `Custom - ${formatDateVi(dateKey)}`);
  if (!name) return;

  const icon = prompt('Chọn emoji icon (VD: 📚, 🏋️, 🎯):', '📌') || '📌';

  const template = {
    id: 'custom_' + generateId(),
    name: name,
    icon: icon,
    builtin: false,
    events: dayEvents.map(ev => ({
      title: ev.title,
      startTime: ev.startTime,
      endTime: ev.endTime,
      category: ev.category,
      notes: ev.notes || '',
    })),
  };

  state.customTemplates.push(template);
  saveCustomTemplates();
  renderTemplateGrid();
  showToast(`Đã lưu template "${name}"!`, 'success');
}

function deleteCustomTemplate(templateId) {
  if (!confirm('Xóa template này?')) return;
  state.customTemplates = state.customTemplates.filter(t => t.id !== templateId);
  saveCustomTemplates();

  if (state.selectedTemplateId === templateId) {
    state.selectedTemplateId = null;
    $('template-apply-btn').disabled = true;
    $('template-preview').style.display = 'none';
  }

  renderTemplateGrid();
  showToast('Đã xóa template', 'info');
}

// ============== UPDATE CURRENT TIME LINE ==============
function updateTimeLine() {
  if (state.currentPageName !== 'schedule') return;
  if (!isToday(state.selectedDate)) return;
  const existingLine = document.querySelector('.current-time-line');
  if (existingLine) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const scheduleStartMin = SCHEDULE_START_HOUR * 60;
    existingLine.style.top = `${((nowMin - scheduleStartMin) / 60) * 60}px`;
  }
}

// ============== EVENT LISTENERS ==============
function initEventListeners() {
  // Navigation
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => navigateTo(btn.dataset.page)));

  // Mobile menu
  $('menu-toggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  document.addEventListener('click', (e) => {
    const sidebar = $('sidebar');
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== $('menu-toggle')) {
      sidebar.classList.remove('open');
    }
  });

  // Theme toggle
  $('theme-toggle').addEventListener('click', toggleTheme);

  // Problem Finder
  $('search-btn').addEventListener('click', filterProblems);
  $('random-btn').addEventListener('click', randomProblem);
  $('clear-filters-btn').addEventListener('click', clearFilters);
  $('clear-solved-btn').addEventListener('click', clearSolved);

  $('prev-page-btn').addEventListener('click', () => {
    if (state.currentPage > 1) { state.currentPage--; renderProblems(); $('problems-grid').scrollIntoView({ behavior: 'smooth' }); }
  });
  $('next-page-btn').addEventListener('click', () => {
    const totalPages = Math.ceil(state.filteredProblems.length / PROBLEMS_PER_PAGE);
    if (state.currentPage < totalPages) { state.currentPage++; renderProblems(); $('problems-grid').scrollIntoView({ behavior: 'smooth' }); }
  });

  // Sort buttons
  $$('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentSort = btn.dataset.sort;
      $$('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sortProblems();
      state.currentPage = 1;
      renderProblems();
    });
  });

  // Bookmarks toggle
  $('toggle-bookmarks-btn').addEventListener('click', () => {
    const list = $('bookmarks-list');
    const isHidden = list.style.display === 'none';
    list.style.display = isHidden ? 'grid' : 'none';
    $('toggle-bookmarks-btn').textContent = isHidden ? 'Ẩn' : 'Hiện';
  });

  // Enter key on rating inputs
  $('rating-min').addEventListener('keydown', (e) => { if (e.key === 'Enter') filterProblems(); });
  $('rating-max').addEventListener('keydown', (e) => { if (e.key === 'Enter') filterProblems(); });

  // Schedule
  $('add-event-btn').addEventListener('click', () => openEventModal());
  $('prev-week-btn').addEventListener('click', prevWeek);
  $('next-week-btn').addEventListener('click', nextWeek);
  $('today-btn').addEventListener('click', goToToday);
  $('copy-day-btn').addEventListener('click', openCopyModal);
  $('clear-day-btn').addEventListener('click', clearDay);

  // Templates
  $('template-btn').addEventListener('click', openTemplateModal);
  $('template-modal-close').addEventListener('click', closeTemplateModal);
  $('template-cancel-btn').addEventListener('click', closeTemplateModal);
  $('template-apply-btn').addEventListener('click', applyTemplate);
  $('save-as-template-btn').addEventListener('click', saveCurrentDayAsTemplate);
  $('template-modal').addEventListener('click', (e) => { if (e.target === $('template-modal')) closeTemplateModal(); });

  // Event Modal
  $('modal-close-btn').addEventListener('click', closeEventModal);
  $('modal-cancel-btn').addEventListener('click', closeEventModal);
  $('modal-delete-btn').addEventListener('click', deleteEvent);
  $('event-form').addEventListener('submit', (e) => { e.preventDefault(); saveEvent(); });

  // Category buttons in modal
  $$('#event-form .cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#event-form .cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Close modals on overlay click
  $('event-modal').addEventListener('click', (e) => { if (e.target === $('event-modal')) closeEventModal(); });

  // Copy modal
  $('copy-modal-close').addEventListener('click', closeCopyModal);
  $('copy-cancel-btn').addEventListener('click', closeCopyModal);
  $('copy-confirm-btn').addEventListener('click', copyDay);
  $('copy-modal').addEventListener('click', (e) => { if (e.target === $('copy-modal')) closeCopyModal(); });

  // Keyboard: Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeEventModal(); closeCopyModal(); closeTemplateModal(); }
  });
}

// ============== INIT ==============
async function init() {
  loadTheme();
  loadBookmarks();
  loadSolved();
  loadSchedule();
  loadCustomTemplates();
  initEventListeners();
  initTagsUI();
  updateStatsBar();

  initSchedule();

  await fetchProblems();

  if (state.allProblems.length > 0) {
    state.filteredProblems = [...state.allProblems];
    sortProblems();
    renderProblems();
    renderBookmarks();
    renderSolvedStats();
    showToast(`Đã tải ${state.allProblems.length} bài tập từ Codeforces`, 'success');
  }

  setInterval(updateTimeLine, 60000);
}

document.addEventListener('DOMContentLoaded', init);
