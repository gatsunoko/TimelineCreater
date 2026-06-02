/**
 * app.js
 * 日本史年表作成ツール — メインアプリケーションロジック
 *
 * 機能:
 *   - 年表データの表示（テーブル）
 *   - データの追加・編集・削除
 *   - 西暦↔和暦の自動変換
 *   - JSON インポート / エクスポート
 *   - localStorage による保存・復元
 *   - 検索フィルタ
 *   - ソート（sortKey 昇順）
 */

// =====================================================================
//  グローバル状態
// =====================================================================

/** @type {Array<Object>} 年表データ配列 */
let timelineData = [];

/** @type {string} 年表タイトル */
let timelineTitle = '日本史年表';

/** @type {Object} 年表主役の誕生日 */
let timelineBirth = { year: null, month: null, day: null };

/** @type {'date'|'age-count'|'age-full'} 現在の表示モード */
let currentDisplayMode = 'date';

/** @type {string|null} 編集中のデータID（null なら新規追加モード） */
let editingId = null;

/** @type {string} 現在の検索クエリ */
let searchQuery = '';

/** localStorage のキー */
const STORAGE_KEY = 'timeline-data-local';

// =====================================================================
//  DOM 参照
// =====================================================================

const dom = {
  // タイトル
  siteTitle:    () => document.getElementById('site-title'),
  titleInput:   () => document.getElementById('title-input'),
  siteFooter:   () => document.getElementById('site-footer-text'),

  // 誕生日
  birthYear:    () => document.getElementById('birth-year'),
  birthMonth:   () => document.getElementById('birth-month'),
  birthDay:     () => document.getElementById('birth-day'),

  // 表示切替トグル
  displayModeContainer: () => document.getElementById('display-mode-container'),
  btnModeDate:          () => document.getElementById('btn-mode-date'),
  btnModeAgeCount:      () => document.getElementById('btn-mode-age-count'),
  btnModeAgeFull:       () => document.getElementById('btn-mode-age-full'),

  // テーブル
  tbody:        () => document.getElementById('timeline-tbody'),
  emptyMsg:     () => document.getElementById('empty-message'),
  tableCount:   () => document.getElementById('table-count'),
  tableWrapper: () => document.querySelector('.table-wrapper'),

  // 検索
  searchInput:  () => document.getElementById('search-input'),
  searchBtn:    () => document.getElementById('search-btn'),
  searchClear:  () => document.getElementById('search-clear-btn'),

  // フォーム
  form:         () => document.getElementById('timeline-form'),
  westernYear:  () => document.getElementById('western-year'),
  westernMonth: () => document.getElementById('western-month'),
  westernDay:   () => document.getElementById('western-day'),
  japaneseEra:  () => document.getElementById('japanese-era'),
  japaneseYear: () => document.getElementById('japanese-year'),
  japaneseMonth:() => document.getElementById('japanese-month'),
  japaneseLeap: () => document.getElementById('japanese-leap'),
  japaneseDay:  () => document.getElementById('japanese-day'),
  eventText:    () => document.getElementById('event-text'),
  noteText:     () => document.getElementById('note-text'),
  submitBtn:    () => document.getElementById('form-submit-btn'),
  clearBtn:     () => document.getElementById('form-clear-btn'),
  editIndicator:() => document.getElementById('editing-indicator'),
  editLabel:    () => document.getElementById('editing-label'),
  cancelEditBtn:() => document.getElementById('cancel-edit-btn'),
  isApproximate:() => document.getElementById('is-approximate'),

  // JSON
  importFileInput: () => document.getElementById('import-file-input'),
  importBtn:    () => document.getElementById('import-btn'),
  exportJsonBtn:() => document.getElementById('export-json-btn'),
  exportJsBtn:  () => document.getElementById('export-js-btn'),

  // CSV
  importCsvFileInput: () => document.getElementById('import-csv-file-input'),
  importCsvBtn: () => document.getElementById('import-csv-btn'),
  exportCsvBtn: () => document.getElementById('export-csv-btn'),

  // トースト
  toastContainer: () => document.getElementById('toast-container'),
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
      showToast('旧暦対照データの読み込みに失敗しました。変換機能が動作しない可能性があります。', 'error');
    }
  }

  // 元号セレクトボックスの生成
  populateEraSelect();

  // 前回選択した元号があれば初期フォーカスさせる
  const lastEra = localStorage.getItem('timeline-last-selected-era');
  if (lastEra) {
    dom.japaneseEra().value = lastEra;
  }

  // イベントリスナーの登録
  bindEvents();

  // アコーディオンの初期化
  initAccordions();

  // データの読み込み
  await loadInitialData();

  // ソートキーを最新暦並び替えアルゴリズムで自動マイグレーション
  migrateSortKeys();

  // 誕生日の入力フィールド同期
  updateBirthFields();

  // 表示モード切り替えトグルの状態更新
  updateDisplayModeToggles();

  // ヘッダータイトルの更新と入力フィールド同期
  updateHeaderTitle();
  if (dom.titleInput()) {
    dom.titleInput().value = timelineTitle;
  }

  // テーブルの描画
  renderTable();
}

// =====================================================================
//  元号セレクトボックス生成
// =====================================================================

/**
 * ERA_DATA から元号の select options を生成する
 */
function populateEraSelect() {
  const select = dom.japaneseEra();
  ERA_DATA.forEach(era => {
    const option = document.createElement('option');
    option.value = era.name;
    option.textContent = `${era.name}（${era.startYear}〜）`;
    select.appendChild(option);
  });
}

// =====================================================================
//  イベントバインド
// =====================================================================

/**
 * 全イベントリスナーを登録する
 */
function bindEvents() {
  // 年表タイトルの編集
  if (dom.titleInput()) {
    dom.titleInput().addEventListener('input', onTitleInput);
  }

  // フォーム送信
  dom.form().addEventListener('submit', handleFormSubmit);

  // フォーム内での Enter キーによる誤送信を防ぐ（ただし textarea を除く）
  dom.form().addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // フォームクリア
  dom.clearBtn().addEventListener('click', clearForm);

  // 編集キャンセル
  dom.cancelEditBtn().addEventListener('click', cancelEdit);

  // 西暦入力 → 和暦自動変換
  dom.westernYear().addEventListener('input', debounce(onWesternInput, 300));
  dom.westernMonth().addEventListener('input', debounce(onWesternInput, 300));
  dom.westernDay().addEventListener('input', debounce(onWesternInput, 300));

  // 和暦入力 → 西暦自動変換
  dom.japaneseEra().addEventListener('change', () => {
    const val = dom.japaneseEra().value;
    if (val) {
      localStorage.setItem('timeline-last-selected-era', val);
    }
    onJapaneseInput();
  });
  dom.japaneseYear().addEventListener('input', debounce(onJapaneseInput, 300));
  dom.japaneseMonth().addEventListener('input', debounce(onJapaneseInput, 300));
  dom.japaneseLeap().addEventListener('change', onJapaneseInput);
  dom.japaneseDay().addEventListener('input', debounce(onJapaneseInput, 300));

  // 検索
  dom.searchBtn().addEventListener('click', handleSearch);
  dom.searchClear().addEventListener('click', clearSearch);
  dom.searchInput().addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // 誕生日の変更
  if (dom.birthYear()) {
    dom.birthYear().addEventListener('input', onBirthInput);
    dom.birthMonth().addEventListener('input', onBirthInput);
    dom.birthDay().addEventListener('input', onBirthInput);
  }

  // 表示モード切り替え
  if (dom.btnModeDate()) {
    dom.btnModeDate().addEventListener('click', () => changeDisplayMode('date'));
    dom.btnModeAgeCount().addEventListener('click', () => changeDisplayMode('age-count'));
    dom.btnModeAgeFull().addEventListener('click', () => changeDisplayMode('age-full'));
  }

  // JSON
  dom.importBtn().addEventListener('click', handleImport);
  if (dom.exportJsonBtn()) {
    dom.exportJsonBtn().addEventListener('click', handleExportJson);
  }
  if (dom.exportJsBtn()) {
    dom.exportJsBtn().addEventListener('click', handleExportJs);
  }

  // CSV
  if (dom.importCsvBtn()) {
    dom.importCsvBtn().addEventListener('click', handleImportCsv);
  }
  if (dom.exportCsvBtn()) {
    dom.exportCsvBtn().addEventListener('click', handleExportCsv);
  }
}

// =====================================================================
//  データ読み込み
// =====================================================================

/**
 * 初回データ読み込み
 * localStorage → 優先確認 → timeline-data.json fallback
 */
async function loadInitialData() {
  const localData = loadFromLocalStorage();

  if (localData && localData.length > 0) {
    // localStorage にデータがある場合、確認する
    const useLocal = confirm(
      'ブラウザ内に保存された編集データがあります（' + localData.length + '件）。\nこれを読み込みますか？\n\n' +
      '「OK」→ 保存データを使用\n「キャンセル」→ timeline-data.json を読み込み'
    );
    if (useLocal) {
      timelineData = localData;
      showToast('ブラウザ内の保存データを読み込みました', 'success');
      return;
    }
  }

  // 1. timeline-data.json を fetch 試行 (Webサーバー経由での動作など) 【最優先】
  try {
    const response = await fetch('timeline-data.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const parsed = await response.json();
    
    // オブジェクト（新形式）と配列（旧形式）の双方に対応
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      timelineTitle = parsed.title || '日本史年表';
      timelineBirth = parsed.birth || { year: null, month: null, day: null };
      timelineData = Array.isArray(parsed.items) ? parsed.items : [];
    } else if (Array.isArray(parsed)) {
      timelineTitle = '日本史年表';
      timelineBirth = { year: null, month: null, day: null };
      timelineData = parsed;
    }
    
    saveToLocalStorage();
    showToast('timeline-data.json を優先的に読み込みました（' + timelineData.length + '件）', 'info');
    return;
  } catch (err) {
    console.warn('timeline-data.json の読み込みに失敗 (timeline-data.js の読み込みを試みます):', err.message);
  }

  // 2. もし timeline-data.js (定数 TIMELINE_DATA) が先に読み込まれていれば、CORS制限を回避するため使用
  if (typeof TIMELINE_DATA !== 'undefined' && TIMELINE_DATA) {
    timelineTitle = TIMELINE_DATA.title || '日本史年表';
    timelineBirth = TIMELINE_DATA.birth || { year: null, month: null, day: null };
    timelineData = Array.isArray(TIMELINE_DATA.items) ? TIMELINE_DATA.items : [];
    saveToLocalStorage();
    showToast('timeline-data.js (JS定数) を読み込みました（CORS制限回避モード）', 'info');
    return;
  }

  // 3. どちらも取得できない場合、ローカルサンプルをロード
  timelineTitle = '日本史年表';
  timelineBirth = { year: null, month: null, day: null };
  timelineData = getSampleDataFallback();
  saveToLocalStorage();
  showToast('サンプルデータをロードしました（ローカル動作モード）', 'info');
}

// =====================================================================
//  テーブル描画
// =====================================================================

/**
 * 年表テーブルを再描画する
 */
function renderTable() {
  const tbody = dom.tbody();
  tbody.innerHTML = '';

  // ソート
  const sorted = sortData(timelineData);

  // 検索フィルタ
  const filtered = filterData(sorted, searchQuery);

  if (filtered.length === 0) {
    dom.emptyMsg().style.display = 'block';
    dom.tableWrapper().style.display = 'none';
    if (searchQuery) {
      dom.emptyMsg().textContent = '「' + searchQuery + '」に一致する項目はありません。';
    } else {
      dom.emptyMsg().textContent = '年表データがありません。下のフォームから追加してください。';
    }
  } else {
    dom.emptyMsg().style.display = 'none';
    dom.tableWrapper().style.display = 'block';
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.dataset.id = item.id;

    // 日付セル（西暦・和暦を上下に配置、または年齢表示）
    const tdDate = document.createElement('td');
    tdDate.className = 'col-date';

    const divWestern = document.createElement('div');
    divWestern.className = 'date-western';

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
      
      // 年齢モードの時、下段には元の和暦を補足表示
      divJapanese.textContent = item.japanese.display || '－';
    } else {
      divWestern.textContent = item.western.display || '－';
      divWestern.style.fontWeight = '';
      divWestern.style.color = '';
      divJapanese.textContent = item.japanese.display || '－';
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

    // 操作セル
    const tdActions = document.createElement('td');
    tdActions.className = 'col-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-secondary';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => startEdit(item.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.textContent = '削除';
    deleteBtn.style.marginLeft = '4px';
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdDate);
    tr.appendChild(tdEvent);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });

  // 件数表示
  const countText = searchQuery
    ? `${filtered.length} / ${timelineData.length} 件（検索中）`
    : `${timelineData.length} 件`;
  dom.tableCount().textContent = countText;
}

// =====================================================================
//  ソートとフィルタ
// =====================================================================

/**
 * sortKey で昇順ソートする
 * @param {Array} data
 * @returns {Array} ソート済み配列（元配列は変更しない）
 */
function sortData(data) {
  return [...data].sort((a, b) => {
    if (a.sortKey < b.sortKey) return -1;
    if (a.sortKey > b.sortKey) return 1;
    return 0;
  });
}

/**
 * 検索クエリでフィルタする
 * 事項・備考・和暦元号に対して部分一致検索
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
//  フォーム送信（追加 / 更新）
// =====================================================================

/**
 * フォーム送信ハンドラ
 * @param {Event} e
 */
function handleFormSubmit(e) {
  e.preventDefault();

  // バリデーション
  const westernYear = parseInt(dom.westernYear().value, 10);
  const eventText = dom.eventText().value.trim();

  if (!westernYear || isNaN(westernYear)) {
    showToast('西暦年を入力してください', 'error');
    dom.westernYear().focus();
    return;
  }

  if (!eventText) {
    showToast('事項を入力してください', 'error');
    dom.eventText().focus();
    return;
  }

  // フォームからデータ構築
  const item = buildItemFromForm();

  if (editingId) {
    // 更新モード
    const index = timelineData.findIndex(d => d.id === editingId);
    if (index !== -1) {
      item.id = editingId;
      timelineData[index] = item;
      showToast('データを更新しました', 'success');
    }
    editingId = null;
    dom.editIndicator().classList.remove('active');
    dom.submitBtn().textContent = '追加';
  } else {
    // 新規追加
    item.id = generateId();
    timelineData.push(item);
    showToast('データを追加しました', 'success');
  }

  saveToLocalStorage();
  renderTable();
  clearForm();
}

/**
 * フォームの入力値からデータオブジェクトを構築する
 * @returns {Object}
 */
function buildItemFromForm() {
  const wYear  = parseInt(dom.westernYear().value, 10) || null;
  const wMonth = parseInt(dom.westernMonth().value, 10) || null;
  const wDay   = parseInt(dom.westernDay().value, 10) || null;

  const jEra   = dom.japaneseEra().value || '';
  const jYear  = parseInt(dom.japaneseYear().value, 10) || null;
  const jMonth = parseInt(dom.japaneseMonth().value, 10) || null;
  const jLeap  = dom.japaneseLeap().checked;
  const jDay   = parseInt(dom.japaneseDay().value, 10) || null;

  const isApprox = dom.isApproximate().checked;

  const event  = dom.eventText().value.trim();
  const note   = dom.noteText().value.trim();

  return {
    id: null, // 呼び出し元で設定
    isApprox: isApprox,
    western: {
      year: wYear,
      month: wMonth,
      day: wDay,
      display: buildWesternDisplay(wYear, wMonth, wDay, isApprox)
    },
    japanese: {
      era: jEra,
      year: jYear,
      month: jMonth,
      isLeap: jLeap,
      day: jDay,
      display: buildJapaneseDisplay(jEra, jYear, jMonth, jLeap, jDay, isApprox)
    },
    event: event,
    note: note,
    sortKey: buildSortKey(
      { year: wYear, month: wMonth, day: wDay },
      { era: jEra, year: jYear, month: jMonth, isLeap: jLeap, day: jDay }
    )
  };
}

// =====================================================================
//  表示文字列生成
// =====================================================================

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
 * 和暦の表示文字列を生成
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
  // 元年表示（1年 → 元年）
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

/** 新暦（グレゴリオ暦）採用年: 明治6年（1873年）以降は西暦と和暦の月日が一致する */
const GREGORIAN_ADOPTION_YEAR = 1873;

/**
 * 和暦の元号年から西暦年を算出するヘルパー
 * @param {string} eraName 元号名
 * @param {number} eraYear 元号年
 * @returns {number|null} 西暦年
 */
function eraToWesternYear(eraName, eraYear) {
  const eraData = (typeof ERA_DATA !== 'undefined') ? ERA_DATA : null;
  if (!eraData) return null;
  const era = eraData.find(e => e.name === eraName);
  if (!era) return null;
  return era.startYear + eraYear - 1;
}

/**
 * 指定の西暦年が新暦時代（1873年以降）かどうかを判定する
 * @param {number} westernYear 西暦年
 * @returns {boolean}
 */
function isModernCalendarYear(westernYear) {
  return westernYear >= GREGORIAN_ADOPTION_YEAR;
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
    const wYear = eraToWesternYear(japanese.era, japanese.year);

    // 1a. 新暦時代 (1873年以降) は月日がそのまま西暦と一致
    if (wYear && isModernCalendarYear(wYear)) {
      const month = japanese.month || 1;
      const day = japanese.day || 1;
      const y = String(wYear).padStart(4, '0');
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // 1b. 旧暦時代 (1872年以前) は Qreki で精密変換
    const era = japanese.era;
    const year = japanese.year;
    const month = japanese.month || 1;
    const isLeap = !!japanese.isLeap;
    const day = japanese.day || 1;

    try {
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

// =====================================================================
//  西暦↔和暦 自動変換
// =====================================================================

/**
 * 西暦入力に変化があった → 和暦を自動入力（精密変換）
 */
function onWesternInput() {
  const year = parseInt(dom.westernYear().value, 10);
  const month = parseInt(dom.westernMonth().value, 10);
  const day = parseInt(dom.westernDay().value, 10);

  if (!year || isNaN(year)) return;

  // 新暦時代 (1873年以降): 月日は西暦と和暦で同一、元号年のみ変換
  if (isModernCalendarYear(year)) {
    const era = findEraByWesternYear(year);
    if (era) {
      dom.japaneseEra().value = era.name;
      dom.japaneseYear().value = year - era.startYear + 1;
      // 月日はそのままコピー（新暦なので変換不要）
      dom.japaneseMonth().value = (month && !isNaN(month)) ? month : '';
      dom.japaneseLeap().checked = false; // 新暦に閏月は存在しない
      dom.japaneseDay().value = (day && !isNaN(day)) ? day : '';
      localStorage.setItem('timeline-last-selected-era', era.name);
    }
    return;
  }

  // 旧暦時代 (1872年以前): Qreki による精密変換
  if (month && !isNaN(month)) {
    if (day && !isNaN(day)) {
      // 1. 年月日がすべて揃っている場合 -> 和暦年月日を精密変換
      try {
        const res = Qreki.westToKyureki(year, month, day);
        if (res) {
          dom.japaneseEra().value = res.era;
          dom.japaneseYear().value = res.year;
          dom.japaneseMonth().value = res.month;
          dom.japaneseLeap().checked = res.isLeap;
          dom.japaneseDay().value = res.day;
          if (res.era) {
            localStorage.setItem('timeline-last-selected-era', res.era);
          }
        }
      } catch (e) {
        console.error("Qreki conversion error:", e);
      }
    } else {
      // 2. 年月が揃って日は未入力の場合 -> 1日（朔日）と仮定してだいたいの和暦月を自動補完
      try {
        const res = Qreki.westToKyureki(year, month, 1);
        if (res) {
          dom.japaneseEra().value = res.era;
          dom.japaneseYear().value = res.year;
          dom.japaneseMonth().value = res.month;
          dom.japaneseLeap().checked = res.isLeap;
          dom.japaneseDay().value = ''; // 日は空欄のまま
          if (res.era) {
            localStorage.setItem('timeline-last-selected-era', res.era);
          }
        }
      } catch (e) {
        console.error("Qreki approximate conversion error:", e);
      }
    }
  } else {
    // 3. 年だけが入力されている場合 -> 簡易的に年だけを変換
    const era = findEraByWesternYear(year);
    if (era) {
      dom.japaneseEra().value = era.name;
      dom.japaneseYear().value = year - era.startYear + 1;
      dom.japaneseMonth().value = '';
      dom.japaneseLeap().checked = false;
      dom.japaneseDay().value = '';
      localStorage.setItem('timeline-last-selected-era', era.name);
    }
  }
}

/**
 * 和暦入力に変化があった → 西暦を自動入力（精密変換）
 */
function onJapaneseInput() {
  const eraName = dom.japaneseEra().value;
  const jYear = parseInt(dom.japaneseYear().value, 10);
  const jMonth = parseInt(dom.japaneseMonth().value, 10);
  const jLeap = dom.japaneseLeap().checked;
  const jDay = parseInt(dom.japaneseDay().value, 10);

  if (!eraName || !jYear || isNaN(jYear)) return;

  const wYear = eraToWesternYear(eraName, jYear);

  // 新暦時代 (1873年以降): 月日は和暦と西暦で同一、年のみ変換
  if (wYear && isModernCalendarYear(wYear)) {
    dom.westernYear().value = wYear;
    // 月日はそのままコピー（新暦なので変換不要）
    dom.westernMonth().value = (jMonth && !isNaN(jMonth)) ? jMonth : '';
    dom.westernDay().value = (jDay && !isNaN(jDay)) ? jDay : '';
    return;
  }

  // 旧暦時代 (1872年以前): Qreki による精密変換
  if (jMonth && !isNaN(jMonth)) {
    if (jDay && !isNaN(jDay)) {
      // 1. 年月日がすべて揃っている場合 -> 西暦年月日を精密変換
      try {
        const res = Qreki.kyurekiToWest(eraName, jYear, jMonth, jLeap, jDay);
        if (res) {
          dom.westernYear().value = res.year;
          dom.westernMonth().value = res.month;
          dom.westernDay().value = res.day;
        }
      } catch (e) {
        console.error("Qreki conversion error:", e);
      }
    } else {
      // 2. 年月が揃って日は未入力の場合 -> 1日（朔日）と仮定してだいたいの西暦月を自動補完
      try {
        const res = Qreki.kyurekiToWest(eraName, jYear, jMonth, jLeap, 1);
        if (res) {
          dom.westernYear().value = res.year;
          dom.westernMonth().value = res.month;
          dom.westernDay().value = ''; // 日は空欄のまま
        }
      } catch (e) {
        console.error("Qreki approximate conversion error:", e);
      }
    }
  } else {
    // 3. 年だけが入力されている場合 -> 簡易的に年だけを変換
    const era = ERA_DATA.find(e => e.name === eraName);
    if (era) {
      dom.westernYear().value = era.startYear + jYear - 1;
      dom.westernMonth().value = '';
      dom.westernDay().value = '';
    }
  }
}

/**
 * 西暦年から対応する元号を検索する
 * @param {number} year 西暦年
 * @returns {Object|null} 元号データ
 */
function findEraByWesternYear(year) {
  // 逆順に検索（新しい元号から）して、startYear が最も近いものを返す
  for (let i = ERA_DATA.length - 1; i >= 0; i--) {
    const era = ERA_DATA[i];
    if (year >= era.startYear) {
      // endYear が null（現行元号）または year が endYear 以下
      if (era.endYear === null || year <= era.endYear) {
        return era;
      }
    }
  }
  return null;
}

// =====================================================================
//  編集
// =====================================================================

/**
 * 編集モードを開始する
 * @param {string} id データID
 */
function startEdit(id) {
  const item = timelineData.find(d => d.id === id);
  if (!item) return;

  editingId = id;

  // フォームに値をセット
  dom.westernYear().value  = item.western.year || '';
  dom.westernMonth().value = item.western.month || '';
  dom.westernDay().value   = item.western.day || '';
  dom.japaneseEra().value  = item.japanese.era || '';
  dom.japaneseYear().value = item.japanese.year || '';
  dom.japaneseMonth().value= item.japanese.month || '';
  dom.japaneseLeap().checked = !!item.japanese.isLeap;
  dom.japaneseDay().value  = item.japanese.day || '';
  dom.isApproximate().checked = !!item.isApprox;
  dom.eventText().value    = item.event || '';
  dom.noteText().value     = item.note || '';

  // 編集中表示
  dom.editIndicator().classList.add('active');
  dom.editLabel().textContent = `「${item.event}」を編集中`;
  dom.submitBtn().textContent = '更新';

  // フォームセクションを開く
  openAccordion('form');

  // フォームまでスクロール
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 編集モードをキャンセルする
 */
function cancelEdit() {
  editingId = null;
  dom.editIndicator().classList.remove('active');
  dom.submitBtn().textContent = '追加';
  clearForm();
}

// =====================================================================
//  削除
// =====================================================================

/**
 * データを削除する
 * @param {string} id データID
 */
function deleteItem(id) {
  const item = timelineData.find(d => d.id === id);
  if (!item) return;

  const ok = confirm(`「${item.event}」を削除しますか？`);
  if (!ok) return;

  timelineData = timelineData.filter(d => d.id !== id);
  saveToLocalStorage();
  renderTable();
  showToast('データを削除しました', 'info');

  // 編集中のデータが削除された場合
  if (editingId === id) {
    cancelEdit();
  }
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

// =====================================================================
//  JSON インポート / エクスポート
// =====================================================================

/**
 * JSON インポートハンドラ（ファイル選択式）
 */
function handleImport() {
  const fileInput = dom.importFileInput();
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast('読み込むJSONファイルを選択してください', 'error');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const jsonStr = e.target.result.trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      showToast('JSONの解析に失敗しました。正しいJSONファイルか確認してください: ' + err.message, 'error');
      return;
    }

    let importedTitle = '日本史年表';
    let importedBirth = { year: null, month: null, day: null };
    let importedItems = [];

    // 新形式（オブジェクト）と旧形式（配列）の判別
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      importedTitle = parsed.title || '日本史年表';
      importedBirth = parsed.birth || { year: null, month: null, day: null };
      importedItems = Array.isArray(parsed.items) ? parsed.items : [];
    } else if (Array.isArray(parsed)) {
      importedTitle = '日本史年表';
      importedItems = parsed;
    } else {
      showToast('JSONデータの形式が正しくありません', 'error');
      return;
    }

    // バリデーション（最低限のチェック）
    const valid = importedItems.every(item =>
      item.western && typeof item.western.year === 'number' &&
      item.event && typeof item.event === 'string'
    );

    if (!valid) {
      showToast('データ形式が不正です。各項目に western.year と event が必要です。', 'error');
      return;
    }

    const overwrite = confirm(
      `現在の年表データ（タイトル: ${timelineTitle}, ${timelineData.length}件）を上書きしますか？\n\n` +
      `「OK」→ インポートしたデータ（タイトル: ${importedTitle}, ${importedItems.length}件）で上書き\n「キャンセル」→ 中止`
    );
    if (!overwrite) return;

    // ID が無いデータには自動付与
    importedItems.forEach(item => {
      if (!item.id) item.id = generateId();
    });

    timelineTitle = importedTitle;
    timelineBirth = importedBirth;
    timelineData = importedItems;
    
    if (dom.titleInput()) {
      dom.titleInput().value = timelineTitle;
    }
    updateBirthFields();
    updateDisplayModeToggles();
    updateHeaderTitle();
    saveToLocalStorage();
    renderTable();
    fileInput.value = ''; // 選択をクリア
    showToast(importedItems.length + '件のデータをインポートしました', 'success');
  };

  reader.onerror = function () {
    showToast('ファイルの読み込み中にエラーが発生しました', 'error');
  };

  reader.readAsText(file, 'utf8');
}

/**
 * JSON エクスポートハンドラ（timeline-data.json を直接PCにダウンロード書き出し）
 */
function handleExportJson() {
  const sorted = sortData(timelineData);
  const exportObj = {
    title: timelineTitle,
    birth: timelineBirth,
    items: sorted
  };
  
  const jsonContent = JSON.stringify(exportObj, null, 2);

  // Blob を作成してダウンロード実行
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'timeline-data.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('timeline-data.json を書き出しました（' + sorted.length + '件）', 'success');
}

/**
 * JS エクスポートハンドラ（timeline-data.js を直接PCにダウンロード書き出し、CORS回避用）
 */
function handleExportJs() {
  const sorted = sortData(timelineData);
  const exportObj = {
    title: timelineTitle,
    birth: timelineBirth,
    items: sorted
  };
  
  const jsContent = `const TIMELINE_DATA = ${JSON.stringify(exportObj, null, 2)};\n`;

  // Blob を作成してダウンロード実行
  const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'timeline-data.js');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('timeline-data.js を書き出しました（' + sorted.length + '件）', 'success');
}

// =====================================================================
//  CSV インポート / エクスポート
// =====================================================================

/**
 * RFC 4180 準拠の CSV パーサー
 * 引用符で囲まれたフィールド内のカンマや改行も正しく処理する
 * @param {string} text CSV文字列
 * @returns {Array<Array<string>>} 行×列の2次元配列
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuote = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuote) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          // エスケープされた引用符
          field += '"';
          i += 2;
        } else {
          // 引用符終了
          inQuote = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
        i++;
      } else if (ch === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\r') {
        // CRLF or CR
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        if (i + 1 < text.length && text[i + 1] === '\n') {
          i += 2;
        } else {
          i++;
        }
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // 最後のフィールド・行を追加
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * CSV フィールドをエスケープする（カンマ・改行・引用符を含む場合は引用符で囲む）
 * @param {string} value
 * @returns {string}
 */
function escapeCsvField(value) {
  const str = (value === null || value === undefined) ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * CSV インポートハンドラ
 * 列順: 西暦年, 西暦月, 西暦日, 元号, 和暦年, 和暦月, 閏月, 和暦日, 〜頃, 事項, 備考
 */
function handleImportCsv() {
  const fileInput = dom.importCsvFileInput();
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast('読み込むCSVファイルを選択してください', 'error');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const csvText = e.target.result;
    let rows = parseCsv(csvText);

    if (rows.length === 0) {
      showToast('CSVファイルが空です', 'error');
      return;
    }

    // ヘッダー行の判定: 1行目の最初のフィールドが数値でない場合はヘッダーとみなす
    const firstField = rows[0][0] ? rows[0][0].trim() : '';
    if (firstField && isNaN(parseInt(firstField, 10))) {
      rows = rows.slice(1);
    }

    // 空行の除去
    rows = rows.filter(row => row.some(cell => cell.trim() !== ''));

    if (rows.length === 0) {
      showToast('インポート可能なデータがありません', 'error');
      return;
    }

    const importedItems = [];
    let errorCount = 0;

    rows.forEach((cols, idx) => {
      // 最低限のバリデーション: 西暦年と事項が必要
      const wYear = parseInt((cols[0] || '').trim(), 10);
      const eventText = (cols[9] || '').trim();

      if (!wYear || isNaN(wYear) || !eventText) {
        errorCount++;
        return;
      }

      const wMonth = parseInt((cols[1] || '').trim(), 10) || null;
      const wDay = parseInt((cols[2] || '').trim(), 10) || null;
      const jEra = (cols[3] || '').trim();
      const jYear = parseInt((cols[4] || '').trim(), 10) || null;
      const jMonth = parseInt((cols[5] || '').trim(), 10) || null;
      const jLeapStr = (cols[6] || '').trim().toLowerCase();
      const jLeap = (jLeapStr === '1' || jLeapStr === 'true' || jLeapStr === '○' || jLeapStr === '閏');
      const jDay = parseInt((cols[7] || '').trim(), 10) || null;
      const isApproxStr = (cols[8] || '').trim().toLowerCase();
      const isApprox = (isApproxStr === '1' || isApproxStr === 'true' || isApproxStr === '○' || isApproxStr === '頃');
      const note = (cols[10] || '').trim();

      const item = {
        id: generateId(),
        isApprox: isApprox,
        western: {
          year: wYear,
          month: wMonth,
          day: wDay,
          display: buildWesternDisplay(wYear, wMonth, wDay, isApprox)
        },
        japanese: {
          era: jEra,
          year: jYear,
          month: jMonth,
          isLeap: jLeap,
          day: jDay,
          display: buildJapaneseDisplay(jEra, jYear, jMonth, jLeap, jDay, isApprox)
        },
        event: eventText,
        note: note,
        sortKey: buildSortKey(
          { year: wYear, month: wMonth, day: wDay },
          { era: jEra, year: jYear, month: jMonth, isLeap: jLeap, day: jDay }
        )
      };

      importedItems.push(item);
    });

    if (importedItems.length === 0) {
      showToast('CSVデータの形式が正しくありません。各行に西暦年と事項が必要です。', 'error');
      return;
    }

    let message = `CSVから ${importedItems.length}件のデータを読み取りました。`;
    if (errorCount > 0) {
      message += `\n（${errorCount}行は形式不正でスキップされました）`;
    }
    message += `\n\n現在の年表データ（${timelineData.length}件）を上書きしますか？\n\n「OK」→ インポートデータで上書き\n「キャンセル」→ 中止`;

    const overwrite = confirm(message);
    if (!overwrite) return;

    timelineData = importedItems;
    saveToLocalStorage();
    renderTable();
    fileInput.value = '';
    showToast(importedItems.length + '件のデータをCSVからインポートしました', 'success');
  };

  reader.onerror = function () {
    showToast('ファイルの読み込み中にエラーが発生しました', 'error');
  };

  reader.readAsText(file, 'utf8');
}

/**
 * CSV エクスポートハンドラ
 * 列順: 西暦年, 西暦月, 西暦日, 元号, 和暦年, 和暦月, 閏月, 和暦日, 〜頃, 事項, 備考
 */
function handleExportCsv() {
  const sorted = sortData(timelineData);

  // BOM (UTF-8) + ヘッダー行
  const header = [
    '西暦年', '西暦月', '西暦日',
    '元号', '和暦年', '和暦月', '閏月', '和暦日',
    '〜頃', '事項', '備考'
  ].map(escapeCsvField).join(',');

  const dataRows = sorted.map(item => {
    return [
      item.western.year,
      item.western.month || '',
      item.western.day || '',
      item.japanese.era || '',
      item.japanese.year || '',
      item.japanese.month || '',
      item.japanese.isLeap ? '1' : '',
      item.japanese.day || '',
      item.isApprox ? '1' : '',
      item.event || '',
      item.note || ''
    ].map(escapeCsvField).join(',');
  });

  const csvContent = '\uFEFF' + header + '\n' + dataRows.join('\n') + '\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'timeline-data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('timeline-data.csv を書き出しました（' + sorted.length + '件）', 'success');
}

// =====================================================================
//  localStorage
/**
 * 読み込まれた年表データのソートキーを最新アルゴリズムで再計算し、localStorage を更新する
 */
function migrateSortKeys() {
  if (Array.isArray(timelineData) && timelineData.length > 0) {
    let updated = false;
    timelineData.forEach(item => {
      // 1. isApprox が未定義の場合、表示文字列の末尾が「頃」で終わっているかで自動判定して移行
      if (item.isApprox === undefined) {
        const westDisplay = item.western.display || '';
        const japDisplay = item.japanese.display || '';
        item.isApprox = westDisplay.endsWith('頃') || japDisplay.endsWith('頃');
        updated = true;
      }

      // 2. 表示文字列を最新仕様で再生成
      const newWestDisplay = buildWesternDisplay(item.western.year, item.western.month, item.western.day, item.isApprox);
      const newJapDisplay = buildJapaneseDisplay(item.japanese.era, item.japanese.year, item.japanese.month, item.japanese.isLeap, item.japanese.day, item.isApprox);
      
      if (item.western.display !== newWestDisplay || item.japanese.display !== newJapDisplay) {
        item.western.display = newWestDisplay;
        item.japanese.display = newJapDisplay;
        updated = true;
      }

      // 3. ソートキーを再計算
      const newKey = buildSortKey(item.western, item.japanese);
      if (item.sortKey !== newKey) {
        item.sortKey = newKey;
        updated = true;
      }
    });
    if (updated) {
      saveToLocalStorage();
      console.info('年表データのソートキーと「〜頃」表記データを最新の仕様にアップグレードしました。');
    }
  }
}

/**
 * localStorage にデータを保存する
 */
function saveToLocalStorage() {
  try {
    const exportObj = {
      title: timelineTitle,
      birth: timelineBirth,
      items: timelineData
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exportObj));
  } catch (err) {
    console.warn('localStorage への保存に失敗:', err.message);
  }
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
    console.warn('localStorage の読み込みに失敗:', err.message);
    return null;
  }
}

// =====================================================================
//  年表タイトル設定・反映
// =====================================================================

/**
 * 年表タイトル入力時のハンドラー
 */
function onTitleInput() {
  timelineTitle = dom.titleInput().value.trim() || '日本史年表';
  updateHeaderTitle();
  saveToLocalStorage();
}

/**
 * ヘッダーの h1 タイトルおよびブラウザの document.title を更新する
 */
function updateHeaderTitle() {
  const titleEl = dom.siteTitle();
  if (titleEl) {
    titleEl.textContent = timelineTitle + ' — 編集ツール';
  }
  const footerEl = dom.siteFooter();
  if (footerEl) {
    footerEl.textContent = timelineTitle + '作成ツール — 編集ページ';
  }
  document.title = timelineTitle + ' — 編集ツール';
}

// =====================================================================
//  ユーティリティ
// =====================================================================

/**
 * ユニークIDを生成する
 * @returns {string}
 */
function generateId() {
  return 'tl-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

/**
 * フォームを初期化する
 */
function clearForm() {
  dom.westernYear().value   = '';
  dom.westernMonth().value  = '';
  dom.westernDay().value    = '';
  
  // 前回選んだ元号を記憶から復元してデフォルトセットする
  const lastEra = localStorage.getItem('timeline-last-selected-era') || '';
  dom.japaneseEra().value   = lastEra;
  
  dom.japaneseYear().value  = '';
  dom.japaneseMonth().value = '';
  dom.japaneseLeap().checked = false;
  dom.japaneseDay().value   = '';
  dom.isApproximate().checked = false;
  dom.eventText().value     = '';
  dom.noteText().value      = '';
}

/**
 * debounce ユーティリティ
 * @param {Function} fn
 * @param {number} delay ミリ秒
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// =====================================================================
//  トースト通知
// =====================================================================

/**
 * トースト通知を表示する
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const container = dom.toastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // 3秒後に削除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// =====================================================================
//  アコーディオン
// =====================================================================

/**
 * アコーディオンの初期化
 */
function initAccordions() {
  const accordions = [
    { header: 'form-accordion-header', body: 'form-accordion-body' },
    { header: 'import-accordion-header', body: 'import-accordion-body' },
    { header: 'export-accordion-header', body: 'export-accordion-body' },
  ];

  accordions.forEach(({ header, body }) => {
    const headerEl = document.getElementById(header);
    const bodyEl = document.getElementById(body);
    if (!headerEl || !bodyEl) return;

    headerEl.addEventListener('click', () => {
      headerEl.classList.toggle('open');
      bodyEl.classList.toggle('open');
    });
  });
}

/**
 * 指定セクションのアコーディオンを開く
 * @param {'form'|'import'|'export'} section
 */
function openAccordion(section) {
  const headerEl = document.getElementById(section + '-accordion-header');
  const bodyEl = document.getElementById(section + '-accordion-body');
  if (headerEl && bodyEl) {
    headerEl.classList.add('open');
    bodyEl.classList.add('open');
  }
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
 * 誕生日の入力フィールド（年・月・日）を timelineBirth の値と同期する
 */
function updateBirthFields() {
  if (timelineBirth) {
    dom.birthYear().value = timelineBirth.year || '';
    dom.birthMonth().value = timelineBirth.month || '';
    dom.birthDay().value = timelineBirth.day || '';
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
 * 誕生日の入力があった際のイベントハンドラー
 */
function onBirthInput() {
  timelineBirth = {
    year: parseInt(dom.birthYear().value, 10) || null,
    month: parseInt(dom.birthMonth().value, 10) || null,
    day: parseInt(dom.birthDay().value, 10) || null
  };
  saveToLocalStorage();
  updateDisplayModeToggles();
  renderTable();
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

