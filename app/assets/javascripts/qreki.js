/**
 * qreki.js
 * 日本の旧暦（太陰太陽暦）と西暦（歴史的暦）の日付相互変換エンジン
 *
 * 歴史的文献（『日本暦日原典』など）に基づく完全対照データテーブル方式（表引き方式）を使用し、
 * 大化元年（645年）から明治5年（1872年）およびそれ以降の旧暦と西暦を、
 * 1日のズレもなく100%正確に相互変換します。
 *
 * 西暦は1582年10月4日以前はユリウス暦、1582年10月15日以降はグレゴリオ暦（歴史的暦）を基準とします。
 * これにより、「天正10年6月2日 ↔ 1582年6月21日（歴史的西暦）」の相互変換が完全に成り立ちます。
 */

(function (global) {
  'use strict';

  let kyurekiTable = null;

  // =========================================================================
  //  データ初期化API
  // =========================================================================

  /**
   * Qreki_data.json の内容をロードしてエンジンを初期化します。
   * @param {Object} data Qreki_data.json からパースしたオブジェクト
   */
  function loadData(data) {
    if (data && data["旧暦表"]) {
      kyurekiTable = data["旧暦表"];
      return true;
    }
    return false;
  }

  // 自動ロード処理
  if (typeof QREKI_DATA !== 'undefined') {
    loadData(QREKI_DATA);
  } else if (typeof window !== 'undefined' && window.QREKI_DATA) {
    loadData(window.QREKI_DATA);
  } else if (typeof global !== 'undefined' && global.QREKI_DATA) {
    loadData(global.QREKI_DATA);
  }

  function isReady() {
    return kyurekiTable !== null;
  }

  // =========================================================================
  //  MJD (修正ユリウス日) 計算ヘルパー
  // =========================================================================

  function getMJDGregorian(y, m, d) {
    let Y = y;
    let M = m;
    if (M <= 2) {
      Y -= 1;
      M += 12;
    }
    return Math.floor(365.25 * Y) + Math.floor(Y / 400) - Math.floor(Y / 100) + Math.floor(30.59 * (M - 2)) + d - 678912;
  }

  function getMJDJulian(y, m, d) {
    let Y = y;
    let M = m;
    if (M <= 2) {
      Y -= 1;
      M += 12;
    }
    return Math.floor(365.25 * Y) + Math.floor(30.59 * (M - 2)) + d - 678914;
  }

  // 1582年10月15日グレゴリオ暦開始のMJD
  const GREGORIAN_START_MJD = -100843;

  function getMJD(y, m, d) {
    const mjdG = getMJDGregorian(y, m, d);
    if (mjdG >= GREGORIAN_START_MJD) {
      return mjdG;
    } else {
      return getMJDJulian(y, m, d);
    }
  }

  function mjdToDateGregorian(mjd) {
    const n = mjd + 678881;
    const a = 4 * n + 3 + 4 * Math.floor(3 / 4 * Math.floor((4 * (n + 1) / 146097 + 1)));
    const b = 5 * Math.floor((a % 1461) / 4) + 2;
    let y = Math.floor(a / 1461);
    let m = Math.floor(b / 153) + 3;
    let d = Math.floor((b % 153) / 5) + 1;
    if (m > 12) {
      y += 1;
      m -= 12;
    }
    if (y <= 0) y -= 1;
    return { year: y, month: m, day: d };
  }

  function mjdToDateJulian(mjd) {
    const n = mjd + 678883;
    const a = 4 * n + 3;
    const b = 5 * Math.floor((a % 1461) / 4) + 2;
    let y = Math.floor(a / 1461);
    let m = Math.floor(b / 153) + 3;
    let d = Math.floor((b % 153) / 5) + 1;
    if (m > 12) {
      y += 1;
      m -= 12;
    }
    if (y <= 0) y -= 1;
    return { year: y, month: m, day: d };
  }

  function mjdToDate(mjd) {
    if (mjd >= GREGORIAN_START_MJD) {
      return mjdToDateGregorian(mjd);
    } else {
      return mjdToDateJulian(mjd);
    }
  }

  function parseDateStr(str) {
    const parts = str.split('/');
    return {
      y: parseInt(parts[0], 10),
      m: parseInt(parts[1], 10),
      d: parseInt(parts[2], 10)
    };
  }

  // =========================================================================
  //  メインAPI: 西暦 ↔ 旧暦 相互変換
  // =========================================================================

  /**
   * 西暦（歴史的暦）から旧暦（和暦）への変換
   * @param {number} y 西暦年
   * @param {number} m 西暦月
   * @param {number} d 西暦日
   * @returns {Object|null} 変換結果オブジェクト
   */
  function westToKyureki(y, m, d) {
    if (!isReady()) {
      console.warn("Qreki database not loaded. Call Qreki.loadData() first.");
      return null;
    }

    const mjd = getMJD(y, m, d);
    const startYear = 645;
    const dateObj = mjdToDate(mjd);
    let idx = dateObj.year - startYear;

    if (idx < 0) idx = 0;
    if (idx >= kyurekiTable.length) idx = kyurekiTable.length - 1;

    let data = kyurekiTable[idx];
    let ganjitsuParts = parseDateStr(data["元日"]);
    let ganjitsuMjd = getMJD(ganjitsuParts.y, ganjitsuParts.m, ganjitsuParts.d);

    if (mjd < ganjitsuMjd && idx > 0) {
      idx--;
      data = kyurekiTable[idx];
      const gp = parseDateStr(data["元日"]);
      ganjitsuMjd = getMJD(gp.y, gp.m, gp.d);
    }

    const daysDiff = mjd - ganjitsuMjd;
    const sizes = data["大小"];
    const leapMonth = data["閏"] || 0;

    let tempDays = daysDiff;
    let month = 1;
    let day = 1;
    let isLeap = false;

    for (let i = 0; i < sizes.length; i++) {
      const size = 29 + sizes[i];
      if (tempDays >= size) {
        tempDays -= size;
      } else {
        day = tempDays + 1;
        const mIdx = i + 1;
        if (leapMonth && mIdx > leapMonth) {
          month = mIdx - 1;
          if (month === leapMonth) {
            isLeap = true;
          }
        } else {
          month = mIdx;
        }
        break;
      }
    }

    let kyurekiYear = dateObj.year;
    if (idx > 0) {
      const shogatsuData = kyurekiTable.find((x, k) => k >= idx - 1 && parseDateStr(x["元日"]).y === dateObj.year);
      if (shogatsuData) {
        const sp = parseDateStr(shogatsuData["元日"]);
        const sMjd = getMJD(sp.y, sp.m, sp.d);
        if (mjd < sMjd) {
          kyurekiYear = dateObj.year - 1;
        }
      }
    }

    // 元号検索 (global.ERA_DATA または window.ERA_DATA がある想定)
    let matchedEra = "";
    let eraYear = 1;
    const eraData = (typeof ERA_DATA !== 'undefined' ? ERA_DATA : null) || 
                    (typeof window !== 'undefined' ? window.ERA_DATA : null) || 
                    (typeof global !== 'undefined' ? global.ERA_DATA : null);

    if (eraData) {
      for (let i = eraData.length - 1; i >= 0; i--) {
        const era = eraData[i];
        if (kyurekiYear >= era.startYear) {
          if (era.endYear === null || kyurekiYear <= era.endYear) {
            matchedEra = era.name;
            eraYear = kyurekiYear - era.startYear + 1;
            break;
          }
        }
      }
    }

    return {
      era: matchedEra,
      year: eraYear,
      month: month,
      isLeap: isLeap,
      day: day,
      westernYear: kyurekiYear
    };
  }

  /**
   * 旧暦（和暦）から西暦（歴史的暦）への変換
   * @param {string} eraName 元号名 (例: "天正")
   * @param {number} eraYear 元号年
   * @param {number} month 旧暦月
   * @param {boolean} isLeap 閏月フラグ
   * @param {number} day 旧暦日
   * @returns {Object|null} { year, month, day }
   */
  function kyurekiToWest(eraName, eraYear, month, isLeap, day) {
    if (!isReady()) {
      console.warn("Qreki database not loaded. Call Qreki.loadData() first.");
      return null;
    }

    const eraData = (typeof ERA_DATA !== 'undefined' ? ERA_DATA : null) || 
                    (typeof window !== 'undefined' ? window.ERA_DATA : null) || 
                    (typeof global !== 'undefined' ? global.ERA_DATA : null);
    if (!eraData) return null;

    const era = eraData.find(e => e.name === eraName);
    if (!era) return null;
    const wYear = era.startYear + eraYear - 1;

    const startYear = 645;
    const idx = wYear - startYear;
    if (idx < 0 || idx >= kyurekiTable.length) return null;

    const data = kyurekiTable[idx];
    const ganjitsuParts = parseDateStr(data["元日"]);
    const ganjitsuMjd = getMJD(ganjitsuParts.y, ganjitsuParts.m, ganjitsuParts.d);

    const sizes = data["大小"];
    const leapMonth = data["閏"] || 0;

    let targetIdx = month;
    if (isLeap) {
      targetIdx = month + 1;
    } else if (leapMonth && month > leapMonth) {
      targetIdx = month + 1;
    }

    let offset = 0;
    for (let i = 0; i < targetIdx - 1; i++) {
      offset += 29 + sizes[i];
    }
    offset += day - 1;

    const finalMjd = ganjitsuMjd + offset;
    return mjdToDate(finalMjd);
  }

  // =========================================================================
  //  グローバル公開
  // =========================================================================

  const Qreki = {
    loadData: loadData,
    isReady: isReady,
    westToKyureki: westToKyureki,
    kyurekiToWest: kyurekiToWest,
    getMJD: getMJD,
    mjdToDate: mjdToDate
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Qreki;
    }
    exports.Qreki = Qreki;
  } else {
    global.Qreki = Qreki;
  }

})(typeof window !== 'undefined' ? window : this);
