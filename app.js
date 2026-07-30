/* ===============================================
   CP TRAINING HUB — Application Logic v4
   + Multiple OJ Support (LQDOJ, VNOJ, VOJ, Marisao)
   + Advanced Search & Filter
   + Performance Optimized
   + IndexedDB Storage with localStorage fallback
   =============================================== */

// ============== CONSTANTS ==============
const CF_API_URL = 'https://codeforces.com/api/problemset.problems';
const CF_PROBLEM_URL = 'https://codeforces.com/problemset/problem';

// Only Codeforces is available in this version.
const OJ_CONFIGS = {
  codeforces: {
    id: 'codeforces',
    name: 'Codeforces',
    icon: '⚡',
    color: '#00d4ff',
    searchUrl: 'https://codeforces.com/problemset/problem',
    apiType: 'codeforces',
    apiUrl: CF_API_URL,
    enabled: true
  }
};

// Sample problems for VN OJs (for demo)
const VN_SAMPLE_PROBLEMS = {
  lqdoj: [
    { contestId: 'LQDOJ', index: '001', name: 'Tổng dãy số', rating: 800, tags: ['math', 'implementation'] },
    { contestId: 'LQDOJ', index: '002', name: 'Số Fibonacci', rating: 1000, tags: ['dp', 'math'] },
    { contestId: 'LQDOJ', index: '003', name: 'Tìm kiếm nhị phân', rating: 1200, tags: ['binary search'] },
    { contestId: 'LQDOJ', index: '004', name: 'Đồ thị con', rating: 1400, tags: ['graphs', 'dfs and similar'] },
    { contestId: 'LQDOJ', index: '005', name: 'Quy hoạch động', rating: 1600, tags: ['dp'] },
    { contestId: 'LQDOJ', index: '006', name: 'Cây khung nhỏ nhất', rating: 1800, tags: ['graphs', 'dsu'] },
    { contestId: 'LQDOJ', index: '007', name: 'Luồng cực đại', rating: 2000, tags: ['flows'] },
    { contestId: 'LQDOJ', index: '008', name: 'Đường đi ngắn nhất', rating: 1500, tags: ['graphs', 'shortest paths'] },
    { contestId: 'LQDOJ', index: '009', name: 'Sắp xếp nổi bọt', rating: 900, tags: ['sortings'] },
    { contestId: 'LQDOJ', index: '010', name: 'Đệ quy', rating: 1100, tags: ['implementation'] },
    { contestId: 'LQDOJ', index: '011', name: 'Heap', rating: 1300, tags: ['data structures'] },
    { contestId: 'LQDOJ', index: '012', name: 'Trie', rating: 1700, tags: ['data structures', 'strings'] },
    { contestId: 'LQDOJ', index: '013', name: 'Tarjan SCC', rating: 1900, tags: ['graphs'] },
    { contestId: 'LQDOJ', index: '014', name: 'Dijkstra', rating: 1500, tags: ['graphs', 'shortest paths'] },
    { contestId: 'LQDOJ', index: '015', name: 'Bellman-Ford', rating: 1600, tags: ['graphs', 'shortest paths'] },
  ],
  vnoj: [
    { contestId: 'VNOJ', index: '001', name: 'Tính tổng', rating: 800, tags: ['math'] },
    { contestId: 'VNOJ', index: '002', name: 'Dãy con tăng dần', rating: 1200, tags: ['dp'] },
    { contestId: 'VNOJ', index: '003', name: 'BFS trên đồ thị', rating: 1400, tags: ['graphs', 'dfs and similar'] },
    { contestId: 'VNOJ', index: '004', name: 'Segment Tree', rating: 1800, tags: ['data structures'] },
    { contestId: 'VNOJ', index: '005', name: 'Fenwick Tree', rating: 1600, tags: ['data structures'] },
    { contestId: 'VNOJ', index: '006', name: 'String Hash', rating: 1700, tags: ['strings', 'hashing'] },
    { contestId: 'VNOJ', index: '007', name: 'Sieve Eratosthenes', rating: 1000, tags: ['number theory'] },
    { contestId: 'VNOJ', index: '008', name: 'Combinatorics', rating: 1500, tags: ['combinatorics'] },
    { contestId: 'VNOJ', index: '009', name: 'LIS', rating: 1300, tags: ['dp', 'binary search'] },
    { contestId: 'VNOJ', index: '010', name: 'Knapsack', rating: 1400, tags: ['dp'] },
    { contestId: 'VNOJ', index: '011', name: 'Topological Sort', rating: 1500, tags: ['graphs'] },
    { contestId: 'VNOJ', index: '012', name: 'Floyd Warshall', rating: 1600, tags: ['graphs', 'shortest paths'] },
  ],
  voj: [
    { contestId: 'VOJ', index: '001', name: 'Bài toán A + B', rating: 800, tags: ['math'] },
    { contestId: 'VOJ', index: '002', name: 'Dãy số', rating: 1000, tags: ['math', 'implementation'] },
    { contestId: 'VOJ', index: '003', name: 'Đồ thị liên thông', rating: 1300, tags: ['graphs'] },
    { contestId: 'VOJ', index: '004', name: 'Quay lui', rating: 1500, tags: ['brute force'] },
    { contestId: 'VOJ', index: '005', name: 'TSP', rating: 2000, tags: ['dp', 'bitmasks'] },
    { contestId: 'VOJ', index: '006', name: 'Cây nhị phân', rating: 1200, tags: ['trees'] },
    { contestId: 'VOJ', index: '007', name: 'Balance', rating: 1400, tags: ['dp', 'greedy'] },
    { contestId: 'VOJ', index: '008', name: 'KMP', rating: 1700, tags: ['strings'] },
    { contestId: 'VOJ', index: '009', name: 'Sắp xếp', rating: 900, tags: ['sortings'] },
    { contestId: 'VOJ', index: '010', name: 'Đếm cách', rating: 1600, tags: ['dp', 'combinatorics'] },
  ],
  marisao: [
    { contestId: 'MARISAO', index: '001', name: 'Hello World', rating: 800, tags: ['implementation'] },
    { contestId: 'MARISAO', index: '002', name: 'Phân tích số', rating: 1000, tags: ['math', 'number theory'] },
    { contestId: 'MARISAO', index: '003', name: 'Sắp xếp mảng', rating: 1100, tags: ['sortings'] },
    { contestId: 'MARISAO', index: '004', name: 'Đếm cặp', rating: 1400, tags: ['two pointers'] },
    { contestId: 'MARISAO', index: '005', name: 'Hình chữ nhật', rating: 1600, tags: ['geometry'] },
    { contestId: 'MARISAO', index: '006', name: 'DFS', rating: 1300, tags: ['graphs', 'dfs and similar'] },
    { contestId: 'MARISAO', index: '007', name: 'BFS', rating: 1300, tags: ['graphs', 'dfs and similar'] },
    { contestId: 'MARISAO', index: '008', name: 'Modulo', rating: 900, tags: ['math'] },
    { contestId: 'MARISAO', index: '009', name: 'Phân hoạch', rating: 1500, tags: ['dp'] },
    { contestId: 'MARISAO', index: '010', name: 'GCD', rating: 1000, tags: ['math', 'number theory'] },
  ]
};

const CATEGORIES = {
  cp: { label: 'CP', color: '#00d4ff' },
  ielts: { label: 'IELTS', color: '#f59e0b' },
  school: { label: 'Học văn hóa', color: '#10b981' },
  exercise: { label: 'Thể dục', color: '#8b5cf6' },
  rest: { label: 'Nghỉ ngơi', color: '#ec4899' },
  other: { label: 'Khác', color: '#6b7280' },
};

const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const STORAGE_KEYS = {
  bookmarks: 'cpHub_bookmarks',
  solved: 'cpHub_solved',
  schedule: 'cpHub_schedule',
  theme: 'cpHub_theme',
  customTemplates: 'cpHub_customTemplates',
  selectedOJ: 'cpHub_selectedOJ',
  searchHistory: 'cpHub_searchHistory',
  problemsCache: 'cpHub_problemsCache',
};
const CACHE_DURATION = 30 * 60 * 1000;
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
  tagSearchQuery: '',
  tagMatchMode: 'any',
  isLoading: false,
  searchQuery: '',
  searchHistory: [],
  bookmarks: new Set(),
  solved: new Set(),
  events: {},
  selectedDate: null,
  weekStart: null,
  currentPageName: 'problems',
  theme: 'dark',
  customTemplates: [],
  selectedTemplateId: null,
  renderTimeout: null,
  tagFilterTimeout: null,
  searchTimeout: null,
  diskDirectoryHandle: null,
  diskSaveTimeout: null,
  useIndexedDB: true,
};

// ============== UTILITIES ==============
function $(id) { return document.getElementById(id); }
function $$(selector) { return document.querySelectorAll(selector); }

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function formatDateVi(dateStr) {
  const parts = dateStr.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function parseDate(str) {
  const parts = str.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
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
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return h + ':' + m;
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

function sanitizeInput(str) {
  if (!str) return '';
  const element = document.createElement('div');
  element.textContent = str;
  return element.innerHTML;
}

// ============== LOCAL DISK STORAGE ==============
// The browser only grants folder access after the user explicitly chooses it.
const DISK_FILE_NAME = 'cp-hub-data.json';
const DISK_HANDLE_DB = 'cpHubDiskStorage';

function getBackupData() {
  return {
    version: '1.1',
    exportedAt: new Date().toISOString(),
    bookmarks: [...state.bookmarks],
    solved: [...state.solved],
    schedule: state.events,
    customTemplates: state.customTemplates,
    searchHistory: state.searchHistory,
  };
}

function openDiskHandleDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DISK_HANDLE_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('handles');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDirectoryHandle(handle) {
  const db = await openDiskHandleDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('handles', 'readwrite');
    transaction.objectStore('handles').put(handle, 'data-folder');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function restoreDirectoryHandle() {
  if (!('showDirectoryPicker' in window) || !window.indexedDB) return;
  try {
    const db = await openDiskHandleDb();
    const handle = await new Promise((resolve, reject) => {
      const request = db.transaction('handles', 'readonly').objectStore('handles').get('data-folder');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (handle) {
      state.diskDirectoryHandle = handle;
      updateDiskStorageStatus('Đã nhớ thư mục lưu — bấm Lưu vào ổ cứng để cấp lại quyền', 'warning');
    }
  } catch (error) {
    console.warn('Cannot restore disk folder handle:', error);
  }
}

function updateDiskStorageStatus(message, type) {
  const status = $('disk-storage-status');
  const saveButton = $('save-to-disk-btn');
  if (status) {
    status.textContent = message;
    status.classList.toggle('connected', type === 'connected');
    status.classList.toggle('warning', type === 'warning');
  }
  if (saveButton) saveButton.disabled = !state.diskDirectoryHandle;
}

async function ensureDiskPermission() {
  const handle = state.diskDirectoryHandle;
  if (!handle) return false;
  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
}

async function chooseDataFolder() {
  if (!('showDirectoryPicker' in window)) {
    showToast('Trình duyệt này chưa hỗ trợ lưu trực tiếp vào thư mục. Hãy dùng Chrome hoặc Edge.', 'error');
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    state.diskDirectoryHandle = handle;
    await saveDirectoryHandle(handle);
    await saveDataToDisk();
    showToast('Đã kết nối thư mục "' + handle.name + '"', 'success');
  } catch (error) {
    if (error.name !== 'AbortError') showToast('Không thể chọn thư mục lưu: ' + error.message, 'error');
  }
}

async function saveDataToDisk() {
  if (!state.diskDirectoryHandle) return;
  try {
    if (!(await ensureDiskPermission())) {
      updateDiskStorageStatus('Chưa được cấp quyền ghi thư mục', 'warning');
      return;
    }
    const fileHandle = await state.diskDirectoryHandle.getFileHandle(DISK_FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(getBackupData(), null, 2));
    await writable.close();
    updateDiskStorageStatus('Đang lưu: ' + state.diskDirectoryHandle.name + '\\' + DISK_FILE_NAME, 'connected');
  } catch (error) {
    updateDiskStorageStatus('Không thể lưu vào ổ cứng', 'warning');
    console.error('Disk save error:', error);
  }
}

function queueDiskSave() {
  if (!state.diskDirectoryHandle) return;
  clearTimeout(state.diskSaveTimeout);
  state.diskSaveTimeout = setTimeout(saveDataToDisk, 400);
}

// ============== TOAST ==============
function showToast(message, type = 'info') {
  const container = $('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = sanitizeInput(message);
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
  const toggleBtn = $('theme-toggle');
  if (state.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (toggleBtn) toggleBtn.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (toggleBtn) toggleBtn.textContent = '🌙';
  }
}

// ============== SIMPLE STORAGE (localStorage fallback) ==============
function getCacheKey(ojId) {
  return STORAGE_KEYS.problemsCache + '_' + ojId;
}

function getCachedProblems(ojId) {
  try {
    const key = getCacheKey(ojId);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.problems;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedProblems(ojId, problems) {
  try {
    const key = getCacheKey(ojId);
    localStorage.setItem(key, JSON.stringify({
      problems: problems,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

function clearCache(ojId) {
  try {
    const key = getCacheKey(ojId);
    localStorage.removeItem(key);
  } catch (e) {}
}

// ============== STORAGE HELPERS ==============
function loadBookmarks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.bookmarks);
    state.bookmarks = new Set(data ? JSON.parse(data) : []);
  } catch { state.bookmarks = new Set(); }
}

function saveBookmarks() {
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify([...state.bookmarks]));
  updateStatsBar();
  queueDiskSave();
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
  queueDiskSave();
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
  queueDiskSave();
}

function loadCustomTemplates() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.customTemplates);
    state.customTemplates = data ? JSON.parse(data) : [];
  } catch { state.customTemplates = []; }
}

function saveCustomTemplates() {
  localStorage.setItem(STORAGE_KEYS.customTemplates, JSON.stringify(state.customTemplates));
  queueDiskSave();
}

function loadSearchHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.searchHistory);
    state.searchHistory = data ? JSON.parse(data) : [];
  } catch { state.searchHistory = []; }
}

function saveSearchHistory() {
  localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(state.searchHistory));
  queueDiskSave();
}

// ============== NAVIGATION ==============
function navigateTo(pageName) {
  state.currentPageName = pageName;
  $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageName));
  $$('.page').forEach(page => page.classList.toggle('active', page.id === pageName + '-page'));
  const sidebar = $('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// ============== STATS BAR ==============
function updateStatsBar() {
  const totalSolved = $('total-solved');
  const todayTasks = $('today-tasks');
  if (totalSolved) totalSolved.textContent = state.bookmarks.size;
  if (todayTasks) {
    const todayKey = formatDate(new Date());
    const todayEvents = state.events[todayKey] || [];
    todayTasks.textContent = todayEvents.length;
  }
}

// ============== SOLVED STATS ==============
function renderSolvedStats() {
  const total = state.solved.size;
  let easy = 0, medium = 0, hard = 0;
  
  state.solved.forEach(id => {
    const p = state.allProblems.find(pr => pr.id === id);
    if (p) {
      if (p.rating <= 1400) easy++;
      else if (p.rating <= 1900) medium++;
      else hard++;
    }
  });

  const totalEl = $('solved-total');
  const easyEl = $('solved-easy');
  const mediumEl = $('solved-medium');
  const hardEl = $('solved-hard');
  
  if (totalEl) totalEl.textContent = total;
  if (easyEl) easyEl.textContent = easy;
  if (mediumEl) mediumEl.textContent = medium;
  if (hardEl) hardEl.textContent = hard;
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
//  OJ HANDLING
// ============================================================

function getProblemUrl(problem) {
  return CF_PROBLEM_URL + '/' + problem.contestId + '/' + problem.index;
}

function fetchCodeforcesProblems() {
  // Try cache first
  const cached = getCachedProblems('codeforces');
  if (cached) return Promise.resolve(cached);

  state.isLoading = true;
  const loadingEl = $('problems-loading');
  const gridEl = $('problems-grid');
  if (loadingEl) loadingEl.classList.add('active');
  if (gridEl) gridEl.innerHTML = '';

  return fetch(CF_API_URL)
    .then(response => {
      if (!response.ok) throw new Error('Codeforces API error');
      return response.json();
    })
    .then(data => {
      if (data.status !== 'OK') throw new Error(data.comment || 'API Error');

      const problemStats = {};
      if (data.result.problemStatistics) {
        data.result.problemStatistics.forEach(ps => {
          const key = ps.contestId + '-' + ps.index;
          problemStats[key] = ps.solvedCount;
        });
      }

      const problems = data.result.problems
        .filter(p => p.rating)
        .map(p => ({
          contestId: p.contestId,
          index: p.index,
          name: p.name,
          rating: p.rating,
          tags: p.tags || [],
          solvedCount: problemStats[p.contestId + '-' + p.index] || 0,
          id: '' + p.contestId + p.index,
          ojId: 'codeforces',
          url: CF_PROBLEM_URL + '/' + p.contestId + '/' + p.index,
        }));

      setCachedProblems('codeforces', problems);
      return problems;
    })
    .catch(error => {
      showToast('Không thể tải dữ liệu từ Codeforces. Thử lại sau.', 'error');
      console.error('Fetch error:', error);
      return [];
    })
    .finally(() => {
      state.isLoading = false;
      if (loadingEl) loadingEl.classList.remove('active');
    });
}

// ============== SEARCH ==============
function searchProblems(query) {
  state.searchQuery = query.trim();
  
  if (state.searchQuery) {
    state.searchHistory.unshift(state.searchQuery);
    if (state.searchHistory.length > 20) state.searchHistory.pop();
    saveSearchHistory();
  }
  
  filterProblems();
}

// ============== INIT OJ SELECTOR ==============
// ============== LOADING STATES ==============
function showLoadingState(message) {
  const grid = $('problems-grid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="loading-state" style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 16px;">
      <div class="spinner"></div>
      <p style="color: var(--text-secondary);">${sanitizeInput(message || 'Đang tải dữ liệu...')}</p>
    </div>
  `;
  const loadingEl = $('problems-loading');
  if (loadingEl) loadingEl.classList.add('active');
}

function hideLoadingState() {
  const loadingEl = $('problems-loading');
  if (loadingEl) loadingEl.classList.remove('active');
}

// ============================================================
//  PROBLEM FINDER
// ============================================================

function fetchProblems() {
  return fetchCodeforcesProblems().then(problems => {
    state.allProblems = problems;
    state.filteredProblems = [...problems];
    renderTagsUI();
  });
}

function initTagsUI() {
  const search = $('tag-search-input');
  if (search) search.addEventListener('input', function() {
    state.tagSearchQuery = this.value.trim().toLowerCase();
    renderTagsUI();
  });
  const clear = $('clear-tags-btn');
  if (clear) clear.addEventListener('click', clearSelectedTags);
  const filterButton = $('filters-search-btn');
  if (filterButton) filterButton.addEventListener('click', filterProblems);
  $$('.tag-mode-btn').forEach(btn => btn.addEventListener('click', function() {
    state.tagMatchMode = this.dataset.tagMode;
    $$('.tag-mode-btn').forEach(item => item.classList.toggle('active', item === this));
    filterProblems();
  }));
  renderTagsUI();
}

function renderTagsUI() {
  const container = $('tags-container');
  if (!container) return;
  const query = state.tagSearchQuery || '';
  container.innerHTML = '';
  CF_TAGS.filter(tag => tag.includes(query)).forEach(tag => {
    const count = state.allProblems.filter(problem => problem.tags.includes(tag)).length;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tag-chip' + (state.selectedTags.has(tag) ? ' selected' : '');
    chip.dataset.tag = tag;
    chip.setAttribute('aria-pressed', String(state.selectedTags.has(tag)));
    chip.innerHTML = sanitizeInput(tag) + ' <span class="tag-chip-count">' + count + '</span>';
    chip.addEventListener('click', function() {
      state.selectedTags.has(tag) ? state.selectedTags.delete(tag) : state.selectedTags.add(tag);
      renderTagsUI();
      clearTimeout(state.tagFilterTimeout);
      state.tagFilterTimeout = setTimeout(filterProblems, 250);
    });
    container.appendChild(chip);
  });
  renderSelectedTagsUI();
}

function renderSelectedTagsUI() {
  const container = $('selected-tags');
  if (!container) return;
  container.innerHTML = '';
  state.selectedTags.forEach(tag => {
    const item = document.createElement('span');
    item.className = 'selected-tag';
    item.innerHTML = sanitizeInput(tag) + '<button type="button" aria-label="Bỏ chọn ' + sanitizeInput(tag) + '">×</button>';
    item.querySelector('button').addEventListener('click', function() {
      state.selectedTags.delete(tag);
      renderTagsUI();
      filterProblems();
    });
    container.appendChild(item);
  });
}

function clearSelectedTags() {
  state.selectedTags.clear();
  renderTagsUI();
  filterProblems();
}

function filterProblems() {
  const minRating = parseInt($('rating-min')?.value) || 0;
  const maxRating = parseInt($('rating-max')?.value) || 9999;
  const tags = state.selectedTags;
  const searchQuery = state.searchQuery.toLowerCase();

  let filtered = [...state.allProblems];
  
  state.filteredProblems = filtered.filter(p => {
    if (p.rating < minRating || p.rating > maxRating) return false;
    if (tags.size > 0) {
      const selected = [...tags];
      const matched = state.tagMatchMode === 'all'
        ? selected.every(tag => p.tags.includes(tag))
        : selected.some(tag => p.tags.includes(tag));
      if (!matched) return false;
    }
    if (searchQuery) {
      const searchText = (p.contestId + ' ' + p.index + ' ' + p.name + ' ' + p.tags.join(' ')).toLowerCase();
      return searchText.includes(searchQuery);
    }
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
  if (!grid) return;
  
  const start = (state.currentPage - 1) * PROBLEMS_PER_PAGE;
  const end = start + PROBLEMS_PER_PAGE;
  const page = state.filteredProblems.slice(start, end);
  const totalPages = Math.ceil(state.filteredProblems.length / PROBLEMS_PER_PAGE);

  grid.innerHTML = '';

  if (page.length === 0) {
    showEmptyState(grid);
    hidePagination();
    return;
  }

  showPagination(totalPages);
  
  const fragment = document.createDocumentFragment();
  page.forEach(problem => {
    fragment.appendChild(createProblemCard(problem));
  });
  grid.appendChild(fragment);
  
  const resultsEl = $('results-count');
  if (resultsEl) resultsEl.textContent = state.filteredProblems.length + ' bài';
  const sortBar = $('sort-bar');
  if (sortBar) sortBar.style.display = 'flex';
}

function showEmptyState(grid) {
  grid.innerHTML = `
    <div class="empty-state" style="grid-column: 1/-1;">
      <div class="empty-state-icon">🔍</div>
      <p class="empty-state-text">Không tìm thấy bài tập nào</p>
      <p class="empty-state-sub">
        ${state.searchQuery ? 'Không tìm thấy kết quả cho "' + sanitizeInput(state.searchQuery) + '"' : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác'}
      </p>
      <button class="btn btn-ghost" onclick="window.clearFilters()" style="margin-top: 12px;">
        ✕ Xóa tất cả bộ lọc
      </button>
    </div>`;
  const sortBar = $('sort-bar');
  const resultsEl = $('results-count');
  if (sortBar) sortBar.style.display = 'none';
  if (resultsEl) resultsEl.textContent = '';
}

function hidePagination() {
  const pagination = $('pagination');
  if (pagination) pagination.style.display = 'none';
}

function showPagination(totalPages) {
  const pagination = $('pagination');
  if (!pagination) return;
  
  if (totalPages > 1) {
    pagination.style.display = 'flex';
    const pageInfo = $('page-info');
    if (pageInfo) pageInfo.textContent = state.currentPage + ' / ' + totalPages;
    const prevBtn = $('prev-page-btn');
    const nextBtn = $('next-page-btn');
    if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = state.currentPage >= totalPages;
  } else {
    pagination.style.display = 'none';
  }
}

function createProblemCard(problem) {
  const card = document.createElement('div');
  const isSolved = state.solved.has(problem.id);
  card.className = 'problem-card' + (isSolved ? ' is-solved' : '');
  card.style.setProperty('--card-accent', getRatingColor(problem.rating));

  const isBookmarked = state.bookmarks.has(problem.id);
  const ratingColor = getRatingColor(problem.rating);
  const ojConfig = OJ_CONFIGS[problem.ojId || 'codeforces'];

  card.innerHTML = `
    <div class="problem-header">
      <div>
        <div class="problem-id">
          ${ojConfig ? '<span class="oj-badge" style="background:' + ojConfig.color + '20;color:' + ojConfig.color + '">' + ojConfig.icon + ' ' + ojConfig.name + '</span>' : ''}
          <span class="problem-contest">${sanitizeInput(problem.contestId)}${sanitizeInput(problem.index)}</span>
        </div>
        <div class="problem-name">
          <a href="${problem.url || '#'}" target="_blank" rel="noopener noreferrer">${sanitizeInput(problem.name)}</a>
        </div>
      </div>
      <span class="problem-rating-badge" style="color:${ratingColor};border-color:${ratingColor}30;background:${ratingColor}10">
        ${problem.rating}
      </span>
    </div>
    <div class="problem-tags">
      ${problem.tags.map(t => '<span class="problem-tag">' + sanitizeInput(t) + '</span>').join('')}
    </div>
    <div class="problem-footer">
      <span class="problem-solved">Solved: <span>${(problem.solvedCount || 0).toLocaleString()}</span></span>
      <div class="problem-actions">
        <button class="solved-btn ' + (isSolved ? 'solved' : '') + '" data-problem-id="' + problem.id + '" title="' + (isSolved ? 'Bỏ đánh dấu đã giải' : 'Đánh dấu đã giải') + '">
          ${isSolved ? '✔' : '○'}
        </button>
        <button class="bookmark-btn ' + (isBookmarked ? 'bookmarked' : '') + '" data-problem-id="' + problem.id + '" title="Bookmark">
          ${isBookmarked ? '⭐' : '☆'}
        </button>
      </div>
    </div>`;

  card.querySelector('.solved-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSolvedProblem(problem.id, this, card);
  });

  card.querySelector('.bookmark-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleBookmark(problem.id, this);
  });

  return card;
}

function toggleSolvedProblem(problemId, btnEl, cardEl) {
  if (state.solved.has(problemId)) {
    state.solved.delete(problemId);
    btnEl.classList.remove('solved');
    btnEl.textContent = '○';
    btnEl.title = 'Bỏ đánh dấu đã giải';
    cardEl.classList.remove('is-solved');
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
  showToast('🎲 Random: ' + problem.contestId + problem.index + ' - ' + problem.name + ' (' + problem.rating + ')', 'success');
}

function clearFilters() {
  const ratingMin = $('rating-min');
  const ratingMax = $('rating-max');
  const searchInput = $('search-input');
  
  if (ratingMin) ratingMin.value = '';
  if (ratingMax) ratingMax.value = '';
  if (searchInput) searchInput.value = '';
  
  state.searchQuery = '';
  state.selectedTags.clear();
  state.tagSearchQuery = '';
  const tagSearch = $('tag-search-input');
  if (tagSearch) tagSearch.value = '';
  renderTagsUI();
  state.filteredProblems = [...state.allProblems];
  sortProblems();
  state.currentPage = 1;
  renderProblems();
  showToast('Đã xóa tất cả bộ lọc', 'info');
}

function renderBookmarks() {
  const list = $('bookmarks-list');
  if (!list) return;
  
  if (state.bookmarks.size === 0) {
    list.innerHTML = '<p class="bookmarks-empty">Chưa có bài tập nào được bookmark. Nhấn ☆ trên thẻ bài tập để thêm.</p>';
    return;
  }
  list.innerHTML = '';
  
  const fragment = document.createDocumentFragment();
  state.allProblems
    .filter(p => state.bookmarks.has(p.id))
    .forEach(p => {
      fragment.appendChild(createProblemCard(p));
    });
  list.appendChild(fragment);
}

// ============================================================
//  SCHEDULE PLANNER (giữ nguyên)
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
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = addDays(state.weekStart, i);
    const dateKey = formatDate(date);
    const events = state.events[dateKey] || [];
    const isActive = isSameDay(date, state.selectedDate);
    const isTodayDate = isToday(date);

    const tab = document.createElement('div');
    tab.className = 'day-tab' + (isActive ? ' active' : '') + (isTodayDate ? ' today' : '');
    tab.dataset.date = dateKey;
    tab.innerHTML = `
      <span class="day-tab-name">${DAY_NAMES_VI[date.getDay()]}</span>
      <span class="day-tab-date">${date.getDate()}</span>
      <span class="day-tab-count">${events.length > 0 ? events.length + ' sự kiện' : '—'}</span>`;

    tab.addEventListener('click', function() {
      state.selectedDate = parseDate(this.dataset.date);
      renderWeekHeader();
      renderDayView();
    });
    container.appendChild(tab);
  }
}

function renderDayView() {
  const timeCol = $('time-column');
  const eventsCol = $('events-column');
  if (!timeCol || !eventsCol) return;
  
  timeCol.innerHTML = '';
  eventsCol.innerHTML = '';

  for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = String(h).padStart(2, '0') + ':00';
    timeCol.appendChild(label);
  }

  for (let h = SCHEDULE_START_HOUR; h < SCHEDULE_END_HOUR; h++) {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.dataset.hour = h;
    const halfLine = document.createElement('div');
    halfLine.className = 'time-slot-half';
    slot.appendChild(halfLine);
    slot.addEventListener('click', function() {
      openEventModal(null, parseInt(this.dataset.hour));
    });
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
    block.className = 'event-block cat-' + event.category;
    block.style.top = top + 'px';
    block.style.height = height + 'px';
    block.innerHTML = `
      <div class="event-title">${sanitizeInput(event.title)}</div>
      ${height >= 40 ? '<div class="event-time">' + event.startTime + ' - ' + event.endTime + '</div>' : ''}
      ${height >= 56 && event.notes ? '<div class="event-notes-preview">' + sanitizeInput(event.notes) + '</div>' : ''}`;

    block.addEventListener('click', function(e) { 
      e.stopPropagation(); 
      openEventModal(event); 
    });
    eventsCol.appendChild(block);
  });

  if (isToday(state.selectedDate)) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const scheduleStartMin = SCHEDULE_START_HOUR * 60;
    if (nowMin >= scheduleStartMin && nowMin < SCHEDULE_END_HOUR * 60) {
      const line = document.createElement('div');
      line.className = 'current-time-line';
      line.style.top = ((nowMin - scheduleStartMin) / 60 * 60) + 'px';
      eventsCol.appendChild(line);
    }
  }
}

function renderWeekOverview() {
  const container = $('week-stats');
  if (!container) return;
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

function openEventModal(event, defaultHour) {
  const modal = $('event-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  if (event) {
    editingEventId = event.id;
    const titleEl = $('modal-title');
    const idEl = $('event-id');
    const titleInput = $('event-title');
    const dateInput = $('event-date');
    const startInput = $('event-start');
    const endInput = $('event-end');
    const notesInput = $('event-notes');
    const deleteBtn = $('modal-delete-btn');
    
    if (titleEl) titleEl.textContent = 'Chỉnh sửa sự kiện';
    if (idEl) idEl.value = event.id;
    if (titleInput) titleInput.value = event.title;
    if (dateInput) dateInput.value = formatDate(state.selectedDate);
    if (startInput) startInput.value = event.startTime;
    if (endInput) endInput.value = event.endTime;
    if (notesInput) notesInput.value = event.notes || '';
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    $$('#event-form .cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === event.category));
  } else {
    editingEventId = null;
    const titleEl = $('modal-title');
    const idEl = $('event-id');
    const form = $('event-form');
    const dateInput = $('event-date');
    const deleteBtn = $('modal-delete-btn');
    const startInput = $('event-start');
    const endInput = $('event-end');
    
    if (titleEl) titleEl.textContent = 'Thêm sự kiện';
    if (form) form.reset();
    if (idEl) idEl.value = '';
    if (dateInput) dateInput.value = formatDate(state.selectedDate);
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (defaultHour !== null && defaultHour !== undefined) {
      if (startInput) startInput.value = String(defaultHour).padStart(2, '0') + ':00';
      if (endInput) endInput.value = String(Math.min(defaultHour + 2, 23)).padStart(2, '0') + ':00';
    } else {
      if (startInput) startInput.value = '19:00';
      if (endInput) endInput.value = '21:00';
    }
    $$('#event-form .cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === 'cp'));
  }
  const titleInput = $('event-title');
  if (titleInput) setTimeout(() => titleInput.focus(), 100);
}

function closeEventModal() {
  const modal = $('event-modal');
  if (modal) modal.style.display = 'none';
  editingEventId = null;
}

function getSelectedCategory() {
  const active = document.querySelector('#event-form .cat-btn.active');
  return active ? active.dataset.cat : 'other';
}

function saveEvent() {
  const titleInput = $('event-title');
  const dateInput = $('event-date');
  const startInput = $('event-start');
  const endInput = $('event-end');
  const notesInput = $('event-notes');
  
  if (!titleInput || !dateInput || !startInput || !endInput) return;
  
  const title = titleInput.value.trim();
  const dateStr = dateInput.value;
  const startTime = startInput.value;
  const endTime = endInput.value;
  const notes = notesInput ? notesInput.value.trim() : '';
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
    state.events[dateStr].push({ id: editingEventId, title: title, startTime: startTime, endTime: endTime, category: category, notes: notes });
    showToast('Đã cập nhật sự kiện!', 'success');
  } else {
    state.events[dateStr].push({ id: generateId(), title: title, startTime: startTime, endTime: endTime, category: category, notes: notes });
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
  const modal = $('copy-modal');
  const source = $('copy-source');
  const target = $('copy-target');
  if (!modal || !source || !target) return;
  modal.style.display = 'flex';
  source.value = formatDate(state.selectedDate);
  target.value = '';
}

function closeCopyModal() {
  const modal = $('copy-modal');
  if (modal) modal.style.display = 'none';
}

function copyDay() {
  const source = $('copy-source');
  const target = $('copy-target');
  if (!source || !target) return;
  
  const sourceVal = source.value;
  const targetVal = target.value;
  
  if (!sourceVal || !targetVal) { showToast('Vui lòng chọn cả ngày nguồn và ngày đích', 'error'); return; }
  if (sourceVal === targetVal) { showToast('Ngày nguồn và ngày đích phải khác nhau', 'error'); return; }
  const sourceEvents = state.events[sourceVal] || [];
  if (sourceEvents.length === 0) { showToast('Ngày nguồn không có sự kiện nào', 'error'); return; }
  state.events[targetVal] = sourceEvents.map(e => ({ ...e, id: generateId() }));
  saveSchedule();
  closeCopyModal();
  showToast('Đã sao chép ' + sourceEvents.length + ' sự kiện!', 'success');
  state.selectedDate = parseDate(targetVal);
  state.weekStart = getMonday(state.selectedDate);
  renderWeekHeader();
  renderDayView();
  renderWeekOverview();
}

function clearDay() {
  const dateKey = formatDate(state.selectedDate);
  const events = state.events[dateKey] || [];
  if (events.length === 0) { showToast('Ngày này không có sự kiện nào', 'info'); return; }
  if (!confirm('Xóa tất cả ' + events.length + ' sự kiện trong ngày ' + formatDateVi(dateKey) + '?')) return;
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
  const modal = $('template-modal');
  const targetDate = $('template-target-date');
  const applyBtn = $('template-apply-btn');
  const preview = $('template-preview');
  
  if (!modal) return;
  modal.style.display = 'flex';
  if (targetDate) targetDate.textContent = formatDateVi(formatDate(state.selectedDate));
  if (applyBtn) applyBtn.disabled = true;
  if (preview) preview.style.display = 'none';
  renderTemplateGrid();
}

function closeTemplateModal() {
  const modal = $('template-modal');
  if (modal) modal.style.display = 'none';
  state.selectedTemplateId = null;
}

function renderTemplateGrid() {
  const container = $('template-grid');
  if (!container) return;
  container.innerHTML = '';
  const templates = getAllTemplates();

  templates.forEach(tmpl => {
    const card = document.createElement('div');
    card.className = 'template-card' + (state.selectedTemplateId === tmpl.id ? ' selected' : '');
    card.innerHTML = `
      <span class="template-card-icon">${tmpl.icon || '📄'}</span>
      <div class="template-card-name">${sanitizeInput(tmpl.name)}</div>
      <div class="template-card-count">${tmpl.events.length} sự kiện</div>
      ${!tmpl.builtin ? '<button class="template-delete-btn" data-tmpl-id="' + tmpl.id + '">Xóa template</button>' : ''}`;

    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('template-delete-btn')) return;
      selectTemplate(tmpl.id);
    });

    const delBtn = card.querySelector('.template-delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteCustomTemplate(tmpl.id);
      });
    }

    container.appendChild(card);
  });
}

function selectTemplate(templateId) {
  state.selectedTemplateId = templateId;
  const applyBtn = $('template-apply-btn');
  if (applyBtn) applyBtn.disabled = false;

  $$('.template-card').forEach(c => c.classList.remove('selected'));
  const allTemplates = getAllTemplates();
  const idx = allTemplates.findIndex(t => t.id === templateId);
  const grid = $('template-grid');
  if (grid && idx >= 0) {
    const children = grid.children;
    if (children[idx]) children[idx].classList.add('selected');
  }

  const template = allTemplates.find(t => t.id === templateId);
  if (template) {
    const preview = $('template-preview');
    const list = $('template-events-list');
    if (preview) preview.style.display = 'block';
    if (list) {
      list.innerHTML = '';
      template.events.forEach(ev => {
        const catInfo = CATEGORIES[ev.category] || CATEGORIES.other;
        const item = document.createElement('div');
        item.className = 'template-event-item';
        item.style.borderLeftColor = catInfo.color;
        item.innerHTML = '<span class="te-time">' + ev.startTime + ' – ' + ev.endTime + '</span><span class="te-title">' + sanitizeInput(ev.title) + '</span>';
        list.appendChild(item);
      });
    }
  }
}

function applyTemplate() {
  const template = getAllTemplates().find(t => t.id === state.selectedTemplateId);
  if (!template) return;

  const dateKey = formatDate(state.selectedDate);
  const existing = state.events[dateKey] || [];

  if (existing.length > 0) {
    if (!confirm('Ngày ' + formatDateVi(dateKey) + ' đã có ' + existing.length + ' sự kiện. Thay thế toàn bộ?')) return;
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
  showToast('Đã áp dụng template "' + template.name + '"!', 'success');
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

  const name = prompt('Đặt tên cho template:', 'Custom - ' + formatDateVi(dateKey));
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
  showToast('Đã lưu template "' + name + '"!', 'success');
}

function deleteCustomTemplate(templateId) {
  if (!confirm('Xóa template này?')) return;
  state.customTemplates = state.customTemplates.filter(t => t.id !== templateId);
  saveCustomTemplates();

  if (state.selectedTemplateId === templateId) {
    state.selectedTemplateId = null;
    const applyBtn = $('template-apply-btn');
    const preview = $('template-preview');
    if (applyBtn) applyBtn.disabled = true;
    if (preview) preview.style.display = 'none';
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
    existingLine.style.top = ((nowMin - scheduleStartMin) / 60 * 60) + 'px';
  }
}

// ============== EXPORT/IMPORT DATA ==============
function exportData() {
  const data = getBackupData();
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cp-hub-backup-' + formatDate(new Date()) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Đã xuất dữ liệu thành công!', 'success');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!data.bookmarks && !data.solved && !data.schedule) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      
      if (!confirm('Import sẽ ghi đè dữ liệu hiện tại. Bạn có chắc?')) return;
      
      if (data.bookmarks) {
        state.bookmarks = new Set(data.bookmarks);
        saveBookmarks();
      }
      
      if (data.solved) {
        state.solved = new Set(data.solved);
        saveSolved();
      }
      
      if (data.schedule) {
        state.events = data.schedule;
        saveSchedule();
        renderWeekHeader();
        renderDayView();
        renderWeekOverview();
      }
      
      if (data.customTemplates) {
        state.customTemplates = data.customTemplates;
        saveCustomTemplates();
      }
      
      if (data.searchHistory) {
        state.searchHistory = data.searchHistory;
        saveSearchHistory();
      }
      
      renderProblems();
      renderBookmarks();
      renderSolvedStats();
      queueDiskSave();
      showToast('Import dữ liệu thành công!', 'success');
    } catch (error) {
      showToast('Lỗi khi import: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ============== EVENT LISTENERS ==============
function initEventListeners() {
  // Navigation
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      navigateTo(this.dataset.page);
    });
  });

  // Mobile menu
  const menuToggle = $('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const sidebar = $('sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }
  
  document.addEventListener('click', function(e) {
    const sidebar = $('sidebar');
    const menuToggle = $('menu-toggle');
    if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
      sidebar.classList.remove('open');
    }
  });

  // Theme toggle
  const themeToggle = $('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // Problem Finder
  const searchBtn = $('search-btn');
  const randomBtn = $('random-btn');
  const clearFiltersBtn = $('clear-filters-btn');
  const clearSolvedBtn = $('clear-solved-btn');
  const prevPageBtn = $('prev-page-btn');
  const nextPageBtn = $('next-page-btn');
  
  if (searchBtn) searchBtn.addEventListener('click', function() {
    const searchInput = $('search-input');
    if (searchInput) searchProblems(searchInput.value);
  });
  if (randomBtn) randomBtn.addEventListener('click', randomProblem);
  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
  if (clearSolvedBtn) clearSolvedBtn.addEventListener('click', clearSolved);

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function() {
      if (state.currentPage > 1) { 
        state.currentPage--; 
        renderProblems(); 
        const grid = $('problems-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function() {
      const totalPages = Math.ceil(state.filteredProblems.length / PROBLEMS_PER_PAGE);
      if (state.currentPage < totalPages) { 
        state.currentPage++; 
        renderProblems(); 
        const grid = $('problems-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Sort buttons
  $$('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      state.currentSort = this.dataset.sort;
      $$('.sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      sortProblems();
      state.currentPage = 1;
      renderProblems();
    });
  });

  // Bookmarks toggle
  const toggleBookmarksBtn = $('toggle-bookmarks-btn');
  if (toggleBookmarksBtn) {
    toggleBookmarksBtn.addEventListener('click', function() {
      const list = $('bookmarks-list');
      if (!list) return;
      const isHidden = list.style.display === 'none';
      list.style.display = isHidden ? 'grid' : 'none';
      this.textContent = isHidden ? 'Ẩn' : 'Hiện';
    });
  }

  // Enter key on rating inputs
  const ratingMin = $('rating-min');
  const ratingMax = $('rating-max');
  if (ratingMin) ratingMin.addEventListener('keydown', function(e) { if (e.key === 'Enter') filterProblems(); });
  if (ratingMax) ratingMax.addEventListener('keydown', function(e) { if (e.key === 'Enter') filterProblems(); });

  // Search input with debounce
  const searchInput = $('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        searchProblems(this.value);
      }
    });
    
    searchInput.addEventListener('input', function() {
      clearTimeout(state.searchTimeout);
      state.searchTimeout = setTimeout(function() {
        const query = searchInput.value;
        if (query.length >= 2 || query.length === 0) {
          searchProblems(query);
        }
      }, 400);
    });
    
    // Focus search on Ctrl+K or Cmd+K
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // Schedule
  const addEventBtn = $('add-event-btn');
  const prevWeekBtn = $('prev-week-btn');
  const nextWeekBtn = $('next-week-btn');
  const todayBtn = $('today-btn');
  const copyDayBtn = $('copy-day-btn');
  const clearDayBtn = $('clear-day-btn');
  
  if (addEventBtn) addEventBtn.addEventListener('click', function() { openEventModal(null, null); });
  if (prevWeekBtn) prevWeekBtn.addEventListener('click', prevWeek);
  if (nextWeekBtn) nextWeekBtn.addEventListener('click', nextWeek);
  if (todayBtn) todayBtn.addEventListener('click', goToToday);
  if (copyDayBtn) copyDayBtn.addEventListener('click', openCopyModal);
  if (clearDayBtn) clearDayBtn.addEventListener('click', clearDay);

  // Templates
  const templateBtn = $('template-btn');
  const templateModalClose = $('template-modal-close');
  const templateCancelBtn = $('template-cancel-btn');
  const templateApplyBtn = $('template-apply-btn');
  const saveAsTemplateBtn = $('save-as-template-btn');
  const templateModal = $('template-modal');
  
  if (templateBtn) templateBtn.addEventListener('click', openTemplateModal);
  if (templateModalClose) templateModalClose.addEventListener('click', closeTemplateModal);
  if (templateCancelBtn) templateCancelBtn.addEventListener('click', closeTemplateModal);
  if (templateApplyBtn) templateApplyBtn.addEventListener('click', applyTemplate);
  if (saveAsTemplateBtn) saveAsTemplateBtn.addEventListener('click', saveCurrentDayAsTemplate);
  if (templateModal) {
    templateModal.addEventListener('click', function(e) { if (e.target === this) closeTemplateModal(); });
  }

  // Event Modal
  const modalCloseBtn = $('modal-close-btn');
  const modalCancelBtn = $('modal-cancel-btn');
  const modalDeleteBtn = $('modal-delete-btn');
  const eventForm = $('event-form');
  const eventModal = $('event-modal');
  
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEventModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeEventModal);
  if (modalDeleteBtn) modalDeleteBtn.addEventListener('click', deleteEvent);
  if (eventForm) eventForm.addEventListener('submit', function(e) { e.preventDefault(); saveEvent(); });
  if (eventModal) {
    eventModal.addEventListener('click', function(e) { if (e.target === this) closeEventModal(); });
  }

  // Category buttons in modal
  $$('#event-form .cat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      $$('#event-form .cat-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Copy modal
  const copyModalClose = $('copy-modal-close');
  const copyCancelBtn = $('copy-cancel-btn');
  const copyConfirmBtn = $('copy-confirm-btn');
  const copyModal = $('copy-modal');
  
  if (copyModalClose) copyModalClose.addEventListener('click', closeCopyModal);
  if (copyCancelBtn) copyCancelBtn.addEventListener('click', closeCopyModal);
  if (copyConfirmBtn) copyConfirmBtn.addEventListener('click', copyDay);
  if (copyModal) {
    copyModal.addEventListener('click', function(e) { if (e.target === this) closeCopyModal(); });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { 
      closeEventModal(); 
      closeCopyModal(); 
      closeTemplateModal(); 
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
      e.preventDefault();
      randomProblem();
    }
  });

  // Export/Import buttons
  const exportBtn = $('export-data-btn');
  const importBtn = $('import-data-btn');
  const importInput = $('import-file-input');
  const chooseDataFolderBtn = $('choose-data-folder-btn');
  const saveToDiskBtn = $('save-to-disk-btn');
  
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  if (chooseDataFolderBtn) chooseDataFolderBtn.addEventListener('click', chooseDataFolder);
  if (saveToDiskBtn) saveToDiskBtn.addEventListener('click', saveDataToDisk);
  if (importBtn && importInput) {
    importBtn.addEventListener('click', function() { importInput.click(); });
    importInput.addEventListener('change', function(e) {
      if (e.target.files.length > 0) {
        importData(e.target.files[0]);
        e.target.value = '';
      }
    });
  }
}

// ============== INIT ==============
function init() {
  try {
    // Load data from localStorage
    loadTheme();
    loadBookmarks();
    loadSolved();
    loadSchedule();
    loadCustomTemplates();
    loadSearchHistory();
    restoreDirectoryHandle();
    
    // Init UI
    initEventListeners();
    initTagsUI();
    updateStatsBar();
    initSchedule();

    // Load problems
    fetchProblems().then(function() {
      if (state.allProblems.length > 0) {
        state.filteredProblems = [...state.allProblems];
        sortProblems();
        renderProblems();
        renderBookmarks();
        renderSolvedStats();
        const ojName = OJ_CONFIGS.codeforces.name;
        showToast('Đã tải ' + state.allProblems.length + ' bài tập từ ' + ojName, 'success');
      }
    });

    // Auto-refresh Codeforces data every 5 minutes
    setInterval(function() {
      fetchCodeforcesProblems().then(function(problems) {
        if (problems && problems.length > 0) {
          state.allProblems = problems;
          filterProblems();
          renderTagsUI();
        }
      });
    }, 5 * 60 * 1000);

    // Update timeline every minute
    setInterval(updateTimeLine, 60000);
    
    console.log('🔑 Keyboard shortcuts:');
    console.log('  Ctrl+K - Focus search');
    console.log('  Ctrl+Shift+R - Random problem');
    console.log('  Escape - Close modals');
    
  } catch (error) {
    console.error('Init error:', error);
    showToast('Lỗi khởi tạo ứng dụng. Vui lòng tải lại trang.', 'error');
  }
}

// Export functions for HTML onclick
window.clearFilters = clearFilters;
window.randomProblem = randomProblem;
window.exportData = exportData;
window.importData = importData;

// Start app
document.addEventListener('DOMContentLoaded', init);
