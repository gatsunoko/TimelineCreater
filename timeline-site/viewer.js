/**
 * viewer.js
 * 日本史年表 — 公開ページ用の閲覧専用スクリプト
 *
 * データ読み込みの優先順位:
 *   1. localStorage（編集ページで保存されたデータ）
 *   2. timeline-data.json（公開用データファイル）
 *
 * 編集・削除などの機能は含まない。
 */

// =====================================================================
//  グローバル状態
// =====================================================================

/** @type {Array<Object>} 年表データ配列 */
let timelineData = [];

/** @type {string} 年表タイトル */
let timelineTitle = '日本史年表';

/** @type {Object} 主役の誕生日 */
let timelineBirth = { year: null, month: null, day: null };

/** @type {'date'|'age-count'|'age-full'} 現在の表示モード */
let currentDisplayMode = 'date';

/** @type {string} 現在の検索クエリ */
let searchQuery = '';

/** localStorage のキー（app.js と共通） */
const STORAGE_KEY = 'timeline-data-local';

// =====================================================================
//  DOM 参照
// =====================================================================

const dom = {
  siteTitle:    () => document.getElementById('site-title'),
  siteFooter:   () => document.getElementById('site-footer-text'),
  tbody:        () => document.getElementById('timeline-tbody'),
  emptyMsg:     () => document.getElementById('empty-message'),
  tableCount:   () => document.getElementById('table-count'),
  tableWrapper: () => document.querySelector('.table-wrapper'),
  searchInput:  () => document.getElementById('search-input'),
  searchBtn:    () => document.getElementById('search-btn'),
  searchClear:  () => document.getElementById('search-clear-btn'),
  displayModeContainer: () => document.getElementById('display-mode-container'),
  btnModeDate:          () => document.getElementById('btn-mode-date'),
  btnModeAgeCount:      () => document.getElementById('btn-mode-age-count'),
  btnModeAgeFull:       () => document.getElementById('btn-mode-age-full'),
};

// =====================================================================
//  初期化
// =====================================================================

document.addEventListener('DOMContentLoaded', init);

/**
 * アプリケーション初期化
 */
async function init() {
  // 旧暦データのロード（qreki-data.jsが既にロードされている場合はスキップ）
  if (!Qreki.isReady()) {
    try {
      const qrekiRes = await fetch('Qreki_data.json');
      if (!qrekiRes.ok) throw new Error('HTTP ' + qrekiRes.status);
      const qrekiData = await qrekiRes.json();
      Qreki.loadData(qrekiData);
    } catch (err) {
      console.error('Qreki_data.json のロードに失敗しました:', err);
    }
  }

  bindEvents();
  await loadData();
  migrateSortKeys();
  updateDisplayModeToggles();
  updateHeaderTitle();
  renderTable();
}

// =====================================================================
//  イベントバインド
// =====================================================================

/**
 * イベントリスナーを登録する
 */
function bindEvents() {
  dom.searchBtn().addEventListener('click', handleSearch);
  dom.searchClear().addEventListener('click', clearSearch);
  dom.searchInput().addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // 表示モード切り替え
  if (dom.btnModeDate()) {
    dom.btnModeDate().addEventListener('click', () => changeDisplayMode('date'));
    dom.btnModeAgeCount().addEventListener('click', () => changeDisplayMode('age-count'));
    dom.btnModeAgeFull().addEventListener('click', () => changeDisplayMode('age-full'));
  }
}

// =====================================================================
//  データ読み込み
// =====================================================================

/**
 * データを読み込む
 * localStorage にデータがあればそれを優先、なければ timeline-data.json を fetch
 */
async function loadData() {
  // 1. localStorage からのロードを最優先で試行
  // (編集ページでの編集内容を即座に index.html に反映させ、ローカルでのファイル上書きトラブルを防ぐため)
  const localData = loadFromLocalStorage();
  if (localData && localData.length > 0) {
    timelineData = localData;
    console.info('localStorage から最新の編集データを最優先でロードしました（連動モード: ' + localData.length + '件）');
    return;
  }

  // 2. localStorage にデータがない場合、サーバー上の timeline-data.json を fetch 試行
  try {
    const response = await fetch('timeline-data.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const parsed = await response.json();
    
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      timelineTitle = parsed.title || '日本史年表';
      timelineBirth = parsed.birth || { year: null, month: null, day: null };
      timelineData = Array.isArray(parsed.items) ? parsed.items : [];
    } else if (Array.isArray(parsed)) {
      timelineTitle = '日本史年表';
      timelineBirth = { year: null, month: null, day: null };
      timelineData = parsed;
    }
    console.info('timeline-data.json から本番用データを読み込みました');
    return;
  } catch (err) {
    console.warn('timeline-data.json の読み込みに失敗 (timeline-data.js の読み込みを試みます):', err.message);
  }

  // 3. もし timeline-data.js (定数 TIMELINE_DATA) が読み込まれていれば、CORS制限回避用に使用
  if (typeof TIMELINE_DATA !== 'undefined' && TIMELINE_DATA) {
    timelineTitle = TIMELINE_DATA.title || '日本史年表';
    timelineBirth = TIMELINE_DATA.birth || { year: null, month: null, day: null };
    timelineData = Array.isArray(TIMELINE_DATA.items) ? TIMELINE_DATA.items : [];
    console.info('timeline-data.js (JS定数) から初期データをロードしました（CORS制限回避）');
    return;
  }

  // 4. どれも取得できない場合、ハードコードされたサンプルデータをロード
  console.warn('ファイルおよび localStorage の双方にデータがありません。サンプルデータを表示します。');
  timelineTitle = '日本史年表';
  timelineBirth = { year: null, month: null, day: null };
  timelineData = getSampleDataFallback();
}

/**
 * localStorage からデータを読み込む
 * @returns {Array|null}
 */
function loadFromLocalStorage() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const parsed = JSON.parse(json);
    
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      timelineTitle = parsed.title || '日本史年表';
      timelineBirth = parsed.birth || { year: null, month: null, day: null };
      return Array.isArray(parsed.items) ? parsed.items : [];
    } else if (Array.isArray(parsed)) {
      timelineTitle = '日本史年表';
      timelineBirth = { year: null, month: null, day: null };
      return parsed;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// =====================================================================
//  テーブル描画
// =====================================================================

/**
 * 年表テーブルを描画する
 */
function renderTable() {
  const tbody = dom.tbody();
  tbody.innerHTML = '';

  // ソート（sortKey 昇順）
  const sorted = [...timelineData].sort((a, b) => {
    if (a.sortKey < b.sortKey) return -1;
    if (a.sortKey > b.sortKey) return 1;
    return 0;
  });

  // 検索フィルタ
  const filtered = filterData(sorted, searchQuery);

  if (filtered.length === 0) {
    dom.emptyMsg().style.display = 'block';
    dom.tableWrapper().style.display = 'none';
    dom.emptyMsg().textContent = searchQuery
      ? '「' + searchQuery + '」に一致する項目はありません。'
      : '年表データがありません。';
  } else {
    dom.emptyMsg().style.display = 'none';
    dom.tableWrapper().style.display = 'block';
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');

    // 日付セル（西暦・和暦を上下に配置）
    const tdDate = document.createElement('td');
    tdDate.className = 'col-date';

    const divWestern = document.createElement('div');
    divWestern.className = 'date-western';

    const jDisplay = buildJapaneseDisplay(
      item.japanese.era,
      item.japanese.year,
      item.japanese.month,
      item.japanese.isLeap,
      item.japanese.day,
      item.isApprox
    ) || item.japanese.display;

    const divJapanese = document.createElement('div');
    divJapanese.className = 'date-japanese';

    if (
      (currentDisplayMode === 'age-count' || currentDisplayMode === 'age-full') &&
      timelineBirth && timelineBirth.year
    ) {
      const mode = currentDisplayMode === 'age-count' ? 'count' : 'full';
      const ageStr = calculateAge(timelineBirth, item.western, mode);
      
      divWestern.textContent = ageStr;
      divWestern.style.fontWeight = 'bold';
      divWestern.style.color = 'var(--color-accent)';
      divJapanese.textContent = jDisplay || '－';
    } else {
      divWestern.textContent = item.western.display || '－';
      divWestern.style.fontWeight = '';
      divWestern.style.color = '';
      divJapanese.textContent = jDisplay || '－';
    }

    tdDate.appendChild(divWestern);
    tdDate.appendChild(divJapanese);

    // 事項セル
    const tdEvent = document.createElement('td');
    tdEvent.className = 'col-event';
    tdEvent.textContent = item.event;

    // 備考があれば折りたたみ表示
    if (item.note && item.note.trim()) {
      const noteToggle = document.createElement('button');
      noteToggle.className = 'note-toggle';
      noteToggle.textContent = '備考を表示';
      const noteSpan = document.createElement('span');
      noteSpan.className = 'note-text';
      noteSpan.textContent = item.note;

      noteToggle.addEventListener('click', () => {
        const isOpen = noteSpan.classList.toggle('show');
        noteToggle.textContent = isOpen ? '備考を閉じる' : '備考を表示';
      });

      tdEvent.appendChild(noteToggle);
      tdEvent.appendChild(noteSpan);
    }

    tr.appendChild(tdDate);
    tr.appendChild(tdEvent);
    tbody.appendChild(tr);
  });

  // 件数表示
  const countText = searchQuery
    ? `${filtered.length} / ${timelineData.length} 件（検索中）`
    : `${timelineData.length} 件`;
  dom.tableCount().textContent = countText;
}

/**
 * 検索フィルタ
 * @param {Array} data
 * @param {string} query
 * @returns {Array}
 */
function filterData(data, query) {
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter(item =>
    item.event.toLowerCase().includes(q) ||
    (item.note && item.note.toLowerCase().includes(q)) ||
    item.japanese.era.toLowerCase().includes(q) ||
    item.japanese.display.toLowerCase().includes(q) ||
    item.western.display.toLowerCase().includes(q)
  );
}

// =====================================================================
//  検索
// =====================================================================

/**
 * 検索を実行する
 */
function handleSearch() {
  searchQuery = dom.searchInput().value.trim();
  renderTable();
}

/**
 * 検索をクリアする
 */
function clearSearch() {
  searchQuery = '';
  dom.searchInput().value = '';
  renderTable();
}

/**
 * 西暦の表示文字列を生成
 * @param {number|null} year
 * @param {number|null} month
 * @param {number|null} day
 * @param {boolean} [isApprox=false] 曖昧フラグ（「〜頃」）
 * @returns {string}
 */
function buildWesternDisplay(year, month, day, isApprox = false) {
  if (!year) return '';
  let s = year + '年';
  if (month) {
    s += month + '月';
    if (day) s += day + '日';
  }
  if (isApprox) {
    s += '頃';
  }
  return s;
}

/**
 * 和暦の表示文字列を生成（閏月対応）
 * @param {string} era
 * @param {number|null} year
 * @param {number|null} month
 * @param {boolean} isLeap
 * @param {number|null} day
 * @param {boolean} [isApprox=false] 曖昧フラグ（「〜頃」）
 * @returns {string}
 */
function buildJapaneseDisplay(era, year, month, isLeap, day, isApprox = false) {
  if (!era || !year) return '';
  const yearStr = (year === 1) ? '元' : String(year);
  let s = era + yearStr + '年';
  if (month) {
    s += (isLeap ? '閏' : '') + month + '月';
    if (day) s += day + '日';
  }
  if (isApprox) {
    s += '頃';
  }
  return s;
}

/**
 * CORS制限等でtimeline-data.jsonのロードが失敗したときのハードコードされたサンプルデータフォールバック
 * 歴史的に完全に正しい日付（本能寺の変＝1582/6/21ユリウス、関ヶ原＝1600/10/21グレゴリオ）を提供します。
 * @returns {Array<Object>}
 */
function getSampleDataFallback() {
  return [
    {
      "id": "sample-001",
      "western": { "year": 1467, "month": null, "day": null, "display": "1467年" },
      "japanese": { "era": "応仁", "year": 1, "month": null, "day": null, "display": "応仁元年" },
      "event": "応仁の乱が始まる", "note": "", "sortKey": "1467-00-00"
    },
    {
      "id": "sample-002",
      "western": { "year": 1543, "month": null, "day": null, "display": "1543年" },
      "japanese": { "era": "天文", "year": 12, "month": null, "day": null, "display": "天文12年" },
      "event": "鉄砲伝来", "note": "", "sortKey": "1543-00-00"
    },
    {
      "id": "sample-003",
      "western": { "year": 1560, "month": null, "day": null, "display": "1560年" },
      "japanese": { "era": "永禄", "year": 3, "month": null, "day": null, "display": "永禄3年" },
      "event": "桶狭間の戦い", "note": "", "sortKey": "1560-00-00"
    },
    {
      "id": "sample-004",
      "western": { "year": 1573, "month": null, "day": null, "display": "1573年" },
      "japanese": { "era": "天正", "year": 1, "month": null, "day": null, "display": "天正元年" },
      "event": "室町幕府が事実上終焉", "note": "", "sortKey": "1573-00-00"
    },
    {
      "id": "sample-005",
      "western": { "year": 1582, "month": 6, "day": 21, "display": "1582年6月21日" },
      "japanese": { "era": "天正", "year": 10, "month": 6, "day": 2, "display": "天正10年6月2日" },
      "event": "本能寺の変",
      "note": "本能寺の変は天正10年6月2日に発生。ユリウス暦では1582年6月21日、グレゴリオ暦では7月1日に相当します。",
      "sortKey": "1582-06-21"
    },
    {
      "id": "sample-006",
      "western": { "year": 1600, "month": 10, "day": 21, "display": "1600年10月21日" },
      "japanese": { "era": "慶長", "year": 5, "month": 9, "day": 15, "display": "慶長5年9月15日" },
      "event": "関ヶ原の戦い",
      "note": "関ヶ原の戦いは慶長5年9月15日に発生。グレゴリオ暦では1600年10月21日に相当します。",
      "sortKey": "1600-10-21"
    },
    {
      "id": "sample-007",
      "western": { "year": 1603, "month": null, "day": null, "display": "1603年" },
      "japanese": { "era": "慶長", "year": 8, "month": null, "day": null, "display": "慶長8年" },
      "event": "徳川家康が征夷大将軍となる", "note": "", "sortKey": "1603-00-00"
    },
    {
      "id": "sample-008",
      "western": { "year": 1868, "month": null, "day": null, "display": "1868年" },
      "japanese": { "era": "明治", "year": 1, "month": null, "day": null, "display": "明治元年" },
      "event": "明治改元", "note": "", "sortKey": "1868-00-00"
    }
  ];
}

/**
 * ヘッダーの h1 タイトルおよびブラウザの document.title を更新する
 */
function updateHeaderTitle() {
  const titleEl = dom.siteTitle();
  if (titleEl) {
    titleEl.textContent = timelineTitle;
  }
  const footerEl = dom.siteFooter();
  if (footerEl) {
    footerEl.textContent = timelineTitle;
  }
  document.title = timelineTitle;
}

/**
 * どのような月日入力形態であっても、歴史的に正しい順序でソートするためのキーを生成する
 * @param {Object} western 西暦オブジェクト { year, month, day }
 * @param {Object} japanese 和暦オブジェクト { era, year, month, isLeap, day }
 * @returns {string} ソートキー (YYYY-MM-DD 形式)
 */
function buildSortKey(western, japanese) {
  // 1. 和暦の入力があり、元号と年が揃っている場合
  if (japanese && japanese.era && japanese.year) {
    const era = japanese.era;
    const year = japanese.year;
    const month = japanese.month || 1;
    const isLeap = !!japanese.isLeap;
    const day = japanese.day || 1;

    try {
      // Qreki が利用可能であれば精密変換を試みる
      if (typeof Qreki !== 'undefined' && Qreki.isReady()) {
        const res = Qreki.kyurekiToWest(era, year, month, isLeap, day);
        if (res) {
          const y = String(res.year).padStart(4, '0');
          const m = String(res.month).padStart(2, '0');
          const d = String(res.day).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }
    } catch (e) {
      console.warn("Failed to build sortKey from Japanese date:", e);
    }
  }

  // 2. 和暦がなくて西暦のみの場合、または上記がエラーになった場合の代替処理
  const wYear = western ? western.year : null;
  const wMonth = western ? western.month : 1;
  const wDay = western ? western.day : 1;

  const y = String(wYear || 0).padStart(4, '0');
  const m = String(wMonth || 1).padStart(2, '0');
  const d = String(wDay || 1).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 読み込まれた年表データのソートキーを最新アルゴリズムで再計算する
 */
function migrateSortKeys() {
  if (Array.isArray(timelineData) && timelineData.length > 0) {
    timelineData.forEach(item => {
      // 1. isApprox が未定義の場合、表示文字列の末尾が「頃」で終わっているかで自動判定して移行
      if (item.isApprox === undefined) {
        const westDisplay = item.western.display || '';
        const japDisplay = item.japanese.display || '';
        item.isApprox = westDisplay.endsWith('頃') || japDisplay.endsWith('頃');
      }

      // 2. 表示文字列を最新仕様で再生成
      item.western.display = buildWesternDisplay(item.western.year, item.western.month, item.western.day, item.isApprox);
      item.japanese.display = buildJapaneseDisplay(item.japanese.era, item.japanese.year, item.japanese.month, item.japanese.isLeap, item.japanese.day, item.isApprox);

      // 3. ソートキーを再計算
      item.sortKey = buildSortKey(item.western, item.japanese);
    });
  }
}

/**
 * 表示モード切り替えトグルの表示・非表示およびアクティブ状態を更新する
 */
function updateDisplayModeToggles() {
  const hasBirth = timelineBirth && timelineBirth.year;
  const container = dom.displayModeContainer();
  if (container) {
    container.style.display = hasBirth ? 'flex' : 'none';
  }
  
  if (dom.btnModeDate()) {
    dom.btnModeDate().classList.toggle('active', currentDisplayMode === 'date');
    dom.btnModeAgeCount().classList.toggle('active', currentDisplayMode === 'age-count');
    dom.btnModeAgeFull().classList.toggle('active', currentDisplayMode === 'age-full');
  }
}

/**
 * 表示モードを切り替える
 * @param {'date'|'age-count'|'age-full'} mode
 */
function changeDisplayMode(mode) {
  currentDisplayMode = mode;
  updateDisplayModeToggles();
  renderTable();
}

/**
 * 誕生日と出来事日付から年齢を計算する
 * @param {Object} birth 誕生日のオブジェクト { year, month, day }
 * @param {Object} eventDate 出来事の西暦オブジェクト { year, month, day }
 * @param {'count'|'full'} mode 計算モード（'count': 数え年, 'full': 満年齢）
 * @returns {string} 表示用の年齢文字列
 */
function calculateAge(birth, eventDate, mode) {
  if (!birth || !birth.year || !eventDate || !eventDate.year) return '－';
  const bY = birth.year;
  const bM = birth.month || 1;
  const bD = birth.day || 1;
  const eY = eventDate.year;
  const eM = eventDate.month || 1;
  const eD = eventDate.day || 1;

  if (mode === 'count') {
    const age = eY - bY + 1;
    return age > 0 ? `${age}歳` : '誕生前';
  } else {
    let age = eY - bY;
    if (eM < bM || (eM === bM && eD < bD)) {
      age--;
    }
    return age >= 0 ? `${age}歳` : '誕生前';
  }
}

