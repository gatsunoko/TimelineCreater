# wafujs
日本関連のデータを扱うJavascriptライブラリです。  
※ オリジナル・パッケージは [こちら](https://github.com/SUKOHI/Wafu)

# インストール

    npm i wafujs --save

# 依存パッケージ

時間を扱うメソッドの場合、[momentjs](https://momentjs.com/)が必要です。

# 使い方

**曜日**  

    wafu.weekNames();
    // {0: "日", 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土"}

    wafu.weekNames(false);
    // ["日", "月", "火", "水", "木", "金", "土"]

    wafu.weekName(5);
    // 金
    
    wafu.weekName(moment());
    // 日〜土

    wafu.hasWeekName(6);
    wafu.hasWeekName(moment());
    // true or false

**長い曜日**

    wafu.longWeekNames();
    // {0: "日曜日", 1: "月曜日", 2: "火曜日", 3: "水曜日", 4: "木曜日", 5: "金曜日", 6: "土曜日"}
    
    wafu.longWeekNames(false);
    // ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]

    wafu.longWeekName(5);
    // 金曜日
    
    wafu.longWeekName(moment());
    // // 日曜日〜土曜日

**月名**

    wafu.months();
    // {1: "1月", 2: "2月", 3: "3月", 4: "4月", 5: "5月", 6: "6月", 7: "7月", 8: "8月", 9: "9月", 10: "10月", 11: "11月", 12: "12月"}
    
    wafu.months(false);
    // ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

    wafu.month(5);
    // 5月
    
    wafu.month(moment());
    // 1月〜12月
    
    wafu.hasMonth(12);
    // true

**旧暦月名**

    wafu.oldMonths();
    // {1: "睦月", 2: "如月", 3: "弥生", 4: "卯月", 5: "皐月", 6: "水無月", 7: "文月", 8: "葉月", 9: "長月", 10: "神無月", 11: "霜月", 12: "師走"}

    wafu.oldMonths(false);
    // ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", "文月", "葉月", "長月", "神無月", "霜月", "師走"]
    
    wafu.oldMonth(5);
    // 皐月
    
    wafu.oldMonth(moment());
    // 睦月〜師走
    
    wafu.hasOldMonth(12);
    // true
    
**性別**

    wafu.genders();
    // [ {id: "1", text: "男性"}, {id: "2", text: "女性"} ]
    
    wafu.genders(true);
    // [ {id: "1", text: "男性"}, {id: "2", text: "女性"}, {id: "0", text: "その他"} ]
    
    wafu.gender(1);
    // 男性
    
    wafu.hasGender(2);
    // true
    
**都道府県**

    wafu.prefectures();
{1: "北海道", 2: "青森県", 3: "岩手県", 4: "宮城県", 5: "秋田県", 6: "山形県", 7: "福島県", 8: "茨城県", 9: "栃木県", 10: "群馬県", 11: "埼玉県", 12: "千葉県", 13: "東京都", 14: "神奈川県", 15: "新潟県", 16: "富山県", 17: "石川県", 18: "福井県", 19: "山梨県", 20: "長野県", 21: "岐阜県", 22: "静岡県", 23: "愛知県", 24: "三重県", 25: "滋賀県", 26: "京都府", 27: "大阪府", 28: "兵庫県", 29: "奈良県", 30: "和歌山県", 31: "鳥取県", 32: "島根県", 33: "岡山県", 34: "広島県", 35: "山口県", 36: "徳島県", 37: "香川県", 38: "愛媛県", 39: "高知県", 40: "福岡県", 41: "佐賀県", 42: "長崎県", 43: "熊本県", 44: "大分県", 45: "宮崎県", 46: "鹿児島県", 47: "沖縄県"}
    
    wafu.prefectures(true);
{1: "北海道", 2: "青森", 3: "岩手", 4: "宮城", 5: "秋田", 6: "山形", 7: "福島", 8: "茨城", 9: "栃木", 10: "群馬", 11: "埼玉", 12: "千葉", 13: "東京", 14: "神奈川", 15: "新潟", 16: "富山", 17: "石川", 18: "福井", 19: "山梨", 20: "長野", 21: "岐阜", 22: "静岡", 23: "愛知", 24: "三重", 25: "滋賀", 26: "京都", 27: "大阪", 28: "兵庫", 29: "奈良", 30: "和歌山", 31: "鳥取", 32: "島根", 33: "岡山", 34: "広島", 35: "山口", 36: "徳島", 37: "香川", 38: "愛媛", 39: "高知", 40: "福岡", 41: "佐賀", 42: "長崎", 43: "熊本", 44: "大分", 45: "宮崎", 46: "鹿児島", 47: "沖縄"}
    
    wafu.prefecture(13);
    // 東京都
    
    wafu.prefecture(13, true);
    // 東京
    
    wafu.prefectureId('兵庫県');
    // 28
    
    wafu.prefectureId('東京');
    // 13
    
    wafu.hasPrefecture(13);
    // true

**地方**

    wafu.regions();
{1: "北海道", 2: "東北", 3: "関東", 4: "中部", 5: "関西", 6: "中国", 7: "四国", 8: "九州"}
    
    wafu.regionPrefectureIds();
    /*
    
    {
        '1': [1],
        '2': [2, 3, 4, 5, 6, 7],
        '3': [8, 9, 10, 11, 12, 13, 14],
        '4': [15, 16, 17, 18, 19, 20, 21, 22, 23],
        '5': [24, 25, 26, 27, 28, 29, 30],
        '6': [31, 32, 33, 34, 35],
        '7': [36, 37, 38, 39],
        '8': [40, 41, 42, 43, 44, 45, 46, 47]
    }
    
    */

    wafu.region(5);
    // 関西
    
    wafu.regionId('関西');
    // 5
    
    wafu.hasRegion(3);
    // true
    
**和暦**

    wafu.era(1989);
    // {name: "平成", year: 1, initial: "H", symbol: "heisei", full: "平成元年"}
    
    // 厳密モード： era() にセットする引数を moment のインスタンスにすると、日付により例えば「平成31年」が取得できます。

    const heiseiEndDt = moment('2019-04-30');
    const heiseiEndEra = wafu.era(heiseiEndDt);
    // {"name": "平成", "year": 31, "initial": "H", "symbol": "heisei", "full": "平成31年"}

    const reiwaStartDt = moment('2019-05-01');
    const reiwaStartEra = wafu.era(reiwaStartDt);
    // {"name": "令和", "year": 1, "initial": "R", "symbol": "reiwa", "full": "令和元年"}**

    wafu.eraYear(1989);
    // 平成元年

    // or 厳密モードも使えます

    wafu.eraYear(moment('2019-04-30'));
    // 平成31年
    

    wafu.eraYears();
    // {reiwa: "令和", heisei: "平成", showa: "昭和", taisho: "大正", meiji: "明治"}
    
    wafu.eraNames();
    // ["令和", "平成", "昭和", "大正", "明治"]
    
    wafu.eraInitials();
    // ["R", "H", "S", "T", "M"]
    
    wafu.eraSymbols();
    // ["reiwa", "heisei", "showa", "taisho", "meiji"]
    
    wafu.commonYear('平成元年');
    // 1989
    
    wafu.maxEraYears();
    // {reiwa: 1, heisei: 31, showa: 64, taisho: 15, meiji: 45}
    
    wafu.eraYearOptions('heisei');  // the argument is symbol of era name.
    {1: "元年", 2: "2年", ... , 29: "29年", 30: "30年", 31: "31年"}

    
**日付**

    /*** 日付の取得 ***/

    wafu.date('{Y}');
    // 2019年
    
    wafu.date('{y}');
    // 19年
    
    wafu.date('{E}');
    // 令和元年
    
    wafu.date('{e}');
    // R1
    
    wafu.date('{m}');
    // 04月
    
    wafu.date('{n}');
    // 4月
    
    wafu.date('{d}');
    // 04日
    
    wafu.date('{j}');
    // 4日
    
    wafu.date('{G}');
    // 1時
    
    wafu.date('{H}');
    // 01時
    
    wafu.date('{i}');
    // 04分
    
    wafu.date('{s}');
    // 04秒
    
    wafu.date('{w}');
    // 日〜土
    
    wafu.date('{a}');
    // 午前 or 午後
    
    wafu.date('{Y}{m}{d}（{w}） {H}{i}');
    // 2019年04月27日（土） 01時31分
    
    wafu.date('{F}');
    // 2019年04月27日（土） 01時04分
    
    wafu.date('{f}');
    // 2019年04月27日（土） 01:04
    
    
    /*** parseDate()： momentインスタンスの取得 ***/

    wafu.parseDate('平成２７年05月23日（土） 20時11分29秒').format();
    // 2015-05-23T20:11:29+09:00
    
    wafu.parseDate('平成２７年05月23日（土） 20時11分').format();
    // 2015-05-23T20:11:00+09:00
    
    wafu.parseDate('平成２７年05月23日（土） 20時').format();
    // 2015-05-23T20:00:00+09:00
    
    wafu.parseDate('平成２７年05月23日（土） 20:11:29').format();
    // 2015-05-23T20:11:29+09:00
    
    wafu.parseDate('平成２７年05月23日（土） 20:11').format();
    // 2015-05-23T20:11:00+09:00
    
    wafu.parseDate('平成２７年05月23日（土）').format();
    // 2015-05-23T00:00:00+09:00
    
    wafu.parseDate('平成２７年05月').format();
    // 2015-05-01T00:00:00+09:00
    
    wafu.parseDate('平成２７年').format();
    // 2015-01-01T00:00:00+09:00
    
    wafu.parseDate('H27.5.23（土） 20時11分29秒').format();
    // 2015-05-23T20:11:29+09:00
    
    wafu.parseDate('H27.5.23（土） 20時11分').format();
    // 2015-05-23T20:11:00+09:00
    
    wafu.parseDate('H27.5.23（土） 20:11:29').format();
    // 2015-05-23T20:11:29+09:00
    
    wafu.parseDate('H27.5.23（土） 20:11').format();
    // 2015-05-23T20:11:00+09:00
    
    wafu.parseDate('H27.5.23（土）').format();
    // 2015-05-23T00:00:00+09:00
    
    wafu.parseDate('H27.5').format();
    // 2015-05-01T00:00:00+09:00
    
    wafu.parseDate('H27').format();
    // 2015-01-01T00:00:00+09:00
    
**通貨**

    wafu.yen(1500);
    // 1,500円
    
    wafu.yen(1500, 'noComma');
    // 1500円
    
    wafu.yen(1500, 'symbol');
    // ￥1,500
    
    wafu.yen(1500, 'symbolNoComma');
    // ￥1500
    
    wafu.yen(1500, 'symbolCommaHyphen');
    // ￥1,500-
    
    wafu.yen(1500, 'symbolNoCommaHyphen');
    // ￥1500-
    
**消費税**

    const dt = moment('1989-04-01');
    const amount = 1000;
    const totalFlag = true;
    wafu.consumptionTax(dt, amount);   // 30
    wafu.consumptionTax(dt, amount, totalFlag);    // 1030
    
**郵便番号**

    wafu.zip('1234567');
    // 123-4567
    
    wafu.zip('1234567', '_');
    // 123_4567
    
    wafu.zip('１２３４５６７');
    // 123-4567
    
    wafu.checkZip('123-5678');
    // true
    
**半角英数字、スペース**

    wafu.singleByte('ＡＺ　０-９');
    // AZ 0-9
    
    wafu.singleByte('ＡＺ　０-９', ['alphabet', 'numeric']);
    // AZ　0-9
    
    wafu.singleByte('ＡＺ　０-９', ['space']);
    // ＡＺ ０-９
    
# ライセンス

このパッケージは、MITライセンスで配布されています。  
Copyright 2019 Sukohi Kuhoh