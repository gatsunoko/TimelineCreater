const fs = require('fs');
const path = require('path');
const Qreki = require('./qreki.js');

// 1. era-data.js をグローバルにロード
const eraDataCode = fs.readFileSync(path.join(__dirname, 'era-data.js'), 'utf8')
  .replace('const ERA_DATA =', 'global.ERA_DATA =');
eval(eraDataCode);

// 2. Qreki_data.json をロード
const qrekiDataRaw = fs.readFileSync(path.join(__dirname, 'Qreki_data.json'), 'utf8');
const qrekiData = JSON.parse(qrekiDataRaw);
Qreki.loadData(qrekiData);

// 3. テストケース定義
const testCases = [
  {
    name: "本能寺の変",
    kyureki: { era: "天正", year: 10, month: 6, isLeap: false, day: 2 },
    west: { year: 1582, month: 6, day: 21 } // 歴史的西暦（ユリウス暦）
  },
  {
    name: "関ヶ原の戦い",
    kyureki: { era: "慶長", year: 5, month: 9, isLeap: false, day: 15 },
    west: { year: 1600, month: 10, day: 21 } // 歴史的西暦（グレゴリオ暦）
  },
  {
    name: "江戸幕府開府",
    kyureki: { era: "慶長", year: 8, month: 2, isLeap: false, day: 12 },
    west: { year: 1603, month: 3, day: 24 } // 歴史的西暦（グレゴリオ暦）
  },
  {
    name: "明治改暦",
    kyureki: { era: "明治", year: 5, month: 12, isLeap: false, day: 2 },
    west: { year: 1872, month: 12, day: 31 } // 歴史的西暦（グレゴリオ暦）
  },
  {
    name: "天正11年閏1月の変換",
    kyureki: { era: "天正", year: 11, month: 1, isLeap: true, day: 1 },
    west: { year: 1583, month: 2, day: 23 } // 歴史的西暦（ユリウス暦）
  },
  {
    name: "大化元年の元日 (日本最初の元号)",
    kyureki: { era: "大化", year: 1, month: 1, isLeap: false, day: 1 },
    west: { year: 645, month: 2, day: 2 } // 歴史的西暦（ユリウス暦）
  }
];

console.log("==========================================");
console.log("  qreki.js 総合テスト実行 (高精度表引き方式) ");
console.log("==========================================\n");

let passedCount = 0;

testCases.forEach((tc, idx) => {
  console.log(`[Case ${idx + 1}] ${tc.name}`);
  console.log(`  期待する旧暦: ${tc.kyureki.era}${tc.kyureki.year}年${tc.kyureki.isLeap ? '閏' : ''}${tc.kyureki.month}月${tc.kyureki.day}日`);
  console.log(`  期待する西暦: ${tc.west.year}年${tc.west.month}月${tc.west.day}日`);

  // 1. 旧暦 -> 西暦 変換
  const actualWest = Qreki.kyurekiToWest(
    tc.kyureki.era,
    tc.kyureki.year,
    tc.kyureki.month,
    tc.kyureki.isLeap,
    tc.kyureki.day
  );

  const westOk = actualWest &&
    actualWest.year === tc.west.year &&
    actualWest.month === tc.west.month &&
    actualWest.day === tc.west.day;

  console.log(`  -> 旧暦から西暦: ${actualWest ? `${actualWest.year}/${actualWest.month}/${actualWest.day}` : "変換失敗"} [${westOk ? "SUCCESS" : "FAIL"}]`);

  // 2. 西暦 -> 旧暦 変換
  const actualKyureki = Qreki.westToKyureki(
    tc.west.year,
    tc.west.month,
    tc.west.day
  );

  const kyurekiOk = actualKyureki &&
    actualKyureki.era === tc.kyureki.era &&
    actualKyureki.year === tc.kyureki.year &&
    actualKyureki.month === tc.kyureki.month &&
    actualKyureki.isLeap === tc.kyureki.isLeap &&
    actualKyureki.day === tc.kyureki.day;

  console.log(`  -> 西暦から旧暦: ${actualKyureki ? `${actualKyureki.era}${actualKyureki.year}年${actualKyureki.isLeap ? '閏' : ''}${actualKyureki.month}月${actualKyureki.day}日` : "変換失敗"} [${kyurekiOk ? "SUCCESS" : "FAIL"}]`);

  if (westOk && kyurekiOk) {
    passedCount++;
    console.log("  => 結果: 合格 (双方向一致)\n");
  } else {
    console.log("  => 結果: 不合格 (不一致あり)\n");
  }
});

console.log("==========================================");
console.log(` テスト完了: ${passedCount} / ${testCases.length} ケース合格`);
console.log("==========================================");

if (passedCount === testCases.length) {
  console.log("🎉 ALL TESTS PASSED! 完璧に動作しています。");
} else {
  console.log("⚠️ 一部のテストで不一致が発生しました。");
  process.exit(1);
}
