var wafu = {

    // Week name

    _weekNames: {
        '0': '日',
        '1': '月',
        '2': '火',
        '3': '水',
        '4': '木',
        '5': '金',
        '6': '土'
    },

    weekNames(keyFlag = true) {

        if(keyFlag) {

            return wafu._weekNames;

        }

        return wafu.arrayValues(wafu._weekNames);

    },

    weekName(weekNo) {

        if(typeof moment !== 'undefined' && weekNo instanceof moment) {

            weekNo = weekNo.day();

        }

        return wafu.arrayGet(wafu._weekNames, weekNo.toString());

    },

    hasWeekName(weekNo) {

        return (wafu.weekName(weekNo) !== '');

    },

    longWeekNames(keyFlag = true) {

        let weekNames = wafu.weekNames();
        let longWeekNames = {};

        for(let key in weekNames) {

            longWeekNames[key] = weekNames[key] +'曜日';

        }

        if(keyFlag) {

            return longWeekNames;

        }

        return wafu.arrayValues(longWeekNames);

    },

    longWeekName(weekNo) {

        if(typeof moment !== 'undefined' && weekNo instanceof moment) {

            weekNo = weekNo.day();

        }

        return wafu.arrayGet(wafu.longWeekNames(), weekNo.toString());

    },

    // Months

    _months: {
        '1': '1月',
        '2': '2月',
        '3': '3月',
        '4': '4月',
        '5': '5月',
        '6': '6月',
        '7': '7月',
        '8': '8月',
        '9': '9月',
        '10': '10月',
        '11': '11月',
        '12': '12月'
    },

    months(keyFlag = true) {

        if(keyFlag) {

            return wafu._months;

        }

        return wafu.arrayValues(wafu._months);

    },

    month(monthNo) {

        if(typeof moment !== 'undefined' && monthNo instanceof moment) {

            monthNo = monthNo.month() + 1;

        }

        return wafu.arrayGet(wafu._months, monthNo.toString());

    },

    hasMonth(monthNo) {

        const month = wafu.month(monthNo);
        return (month !== '');

    },

    // Old month


    _oldMonths: {
        '1': '睦月',
        '2': '如月',
        '3': '弥生',
        '4': '卯月',
        '5': '皐月',
        '6': '水無月',
        '7': '文月',
        '8': '葉月',
        '9': '長月',
        '10': '神無月',
        '11': '霜月',
        '12': '師走'
    },

    oldMonths(keyFlag = true) {

        if(keyFlag) {

            return wafu._oldMonths;

        }

        return wafu.arrayValues(wafu._oldMonths);

    },

    oldMonth(monthNo) {

        if(typeof moment !== 'undefined' && monthNo instanceof moment) {

            monthNo = monthNo.month() + 1;

        }

        return wafu.arrayGet(wafu._oldMonths, monthNo.toString());

    },

    hasOldMonth(monthNo) {

        const month = wafu.oldMonth(monthNo);
        return (month !== '');

    },

    // Gender

    _genders: [
        {id: '1', text: '男性'},
        {id: '2', text: '女性'},
        {id: '0', text: 'その他'}
    ],

    genders(otherFlag = false) {

        let genders = wafu._genders;

        if(!otherFlag) {

            return [
                genders[0],
                genders[1]
            ];

        }

        return genders;

    },

    gender(genderId) {

        for(let index in wafu._genders) {

            let gender = wafu._genders[index];

            if(gender.id.toString() === genderId.toString()) {

                return gender.text;

            }

        }

        return '';

    },

    hasGender(genderId) {

        return (wafu.gender(genderId) !== '');

    },


    // Prefecture

    _prefectures: {
        '1': '北海道',
        '2': '青森県',
        '3': '岩手県',
        '4': '宮城県',
        '5': '秋田県',
        '6': '山形県',
        '7': '福島県',
        '8': '茨城県',
        '9': '栃木県',
        '10': '群馬県',
        '11': '埼玉県',
        '12': '千葉県',
        '13': '東京都',
        '14': '神奈川県',
        '15': '新潟県',
        '16': '富山県',
        '17': '石川県',
        '18': '福井県',
        '19': '山梨県',
        '20': '長野県',
        '21': '岐阜県',
        '22': '静岡県',
        '23': '愛知県',
        '24': '三重県',
        '25': '滋賀県',
        '26': '京都府',
        '27': '大阪府',
        '28': '兵庫県',
        '29': '奈良県',
        '30': '和歌山県',
        '31': '鳥取県',
        '32': '島根県',
        '33': '岡山県',
        '34': '広島県',
        '35': '山口県',
        '36': '徳島県',
        '37': '香川県',
        '38': '愛媛県',
        '39': '高知県',
        '40': '福岡県',
        '41': '佐賀県',
        '42': '長崎県',
        '43': '熊本県',
        '44': '大分県',
        '45': '宮崎県',
        '46': '鹿児島県',
        '47': '沖縄県'
    },

    prefectures(shortFlag = false) {

        const prefectures = wafu._prefectures;

        if(shortFlag) {

            let shortPrefectures = {};

            for(let id in prefectures) {

                let prefecture = prefectures[id];
                shortPrefectures[id] = wafu.getShortPrefecture(prefecture);

            }

            return shortPrefectures;

        }

        return prefectures;

    },

    prefecture(prefectureId, shortFlag = false) {

        if(wafu._prefectures[prefectureId] !== undefined) {

            let prefecture = wafu._prefectures[prefectureId];

            if(shortFlag) {

                return wafu.getShortPrefecture(prefecture);

            }

            return prefecture;

        }

        return '';

    },

    prefectureId(prefectureName) {

        for(let id in wafu._prefectures) {

            let prefecture = wafu._prefectures[id];
            let shortPrefecture = wafu.getShortPrefecture(prefecture);

            if(prefecture === prefectureName || shortPrefecture === prefectureName) {

                return id;

            }

        }

        return -1;

    },

    hasPrefecture(prefectureId) {

        return (wafu.prefecture(prefectureId) !== '');

    },


    // Region

    _regions: {
        '1': '北海道',
        '2': '東北',
        '3': '関東',
        '4': '中部',
        '5': '関西',
        '6': '中国',
        '7': '四国',
        '8': '九州'
    },

    _regionPrefectureIds: {
        '1': [1],
        '2': [2, 3, 4, 5, 6, 7],
        '3': [8, 9, 10, 11, 12, 13, 14],
        '4': [15, 16, 17, 18, 19, 20, 21, 22, 23],
        '5': [24, 25, 26, 27, 28, 29, 30],
        '6': [31, 32, 33, 34, 35],
        '7': [36, 37, 38, 39],
        '8': [40, 41, 42, 43, 44, 45, 46, 47]
    },

    regions() {

        return wafu._regions;

    },

    regionPrefectureIds() {

        return wafu._regionPrefectureIds;

    },

    region(regionId) {

        return wafu.arrayGet(wafu._regions, regionId.toString());

    },

    regionId(regionName) {

        for(let id in wafu._regions) {

            let region = wafu._regions[id];

            if(region === regionName) {

                return id;

            }

        }

        return -1;

    },

    hasRegion(regionId) {

        return (wafu.region(regionId) !== '');

    },


    // Era

    _eras: [
        { year: 2018, name: '令和', initial: 'R', symbol: 'reiwa', maxYear: null, startDate: '2019-05-01' },
        { year: 1988, name: '平成', initial: 'H', symbol: 'heisei', maxYear: 31, startDate: '1989-01-08' },
        { year: 1925, name: '昭和', initial: 'S', symbol: 'showa', maxYear: 64, startDate: '1926-12-25' },
        { year: 1911, name: '大正', initial: 'T', symbol: 'taisho', maxYear: 15, startDate: '1912-07-30' },
        { year: 1867, name: '明治', initial: 'M', symbol: 'meiji', maxYear: 45, startDate: '1868-01-25' }
    ],

    era(time) {

        const isStrict = (time instanceof moment);
        const year = (isStrict === true) ? time.year() : parseInt(time);

        for(let i in wafu._eras) {

            i = parseInt(i);
            let era = wafu._eras[i];
            const baseYear = era.year;

            if(year > baseYear) {

                let eraYear = year - baseYear;

                if(isStrict === true) {

                    const startDt = moment(era.startDate);

                    if(time < startDt) {

                        try {

                            era = wafu._eras[i + 1];
                            eraYear = era.maxYear;

                        } catch(e) {}

                    }

                }

                const eraName = era.name;
                const eraYearCorrected = (eraYear === 1) ? '元' : eraYear;
                return {
                    'name': eraName,
                    'year': eraYear,
                    'initial': era.initial,
                    'symbol': era.symbol,
                    'full': eraName + eraYearCorrected +'年'
                };

            }

        }

        return null;

    },

    eraYear(time) {

        let era = wafu.era(time);
        return era.full;

    },

    eraYears() {

        let eraYears = {};

        for(let i in wafu._eras) {

            let era = wafu._eras[i];
            eraYears[era.symbol] = era.name;

        }

        return eraYears;

    },

    eraYearOptions(symbol) {

        const maxYears = wafu.maxEraYears();
        let options = {};

        if(maxYears[symbol] !== undefined) {

            let maxYear = maxYears[symbol];

            for(let i = 1 ; i <= maxYear ; i++) {

                options[i] = (i === 1) ? '元年' : i +'年';

            }

        }

        return options;

    },

    maxEraYears() {

        const now = new Date();
        const currentYear = now.getFullYear();
        let maxYears = {};

        for(let i in wafu._eras) {

            let era = wafu._eras[i];
            let maxYear = (era.maxYear > 0) ? era.maxYear : currentYear - era.year;
            maxYears[era.symbol] = maxYear;

        }

        return maxYears;

    },

    eraNames() {

        let eraNames = [];

        for(let i in wafu._eras) {

            let era = wafu._eras[i];
            eraNames.push(era.name);

        }

        return eraNames;

    },

    eraInitials() {

        let eraInitials = [];

        for(let i in wafu._eras) {

            let era = wafu._eras[i];
            eraInitials.push(era.initial);

        }

        return eraInitials;

    },

    eraSymbols() {

        let eraSymbols = [];

        for(let i in wafu._eras) {

            let era = wafu._eras[i];
            eraSymbols.push(era.symbol);

        }

        return eraSymbols;

    },

    commonYear(eraYear) {

        eraYear = wafu.singleByte(eraYear).replace('元年', '1年');
        const eraNamePattern = wafu.eraNames().join('|');
        const eraInitialPattern = wafu.eraInitials().join('|');
        const pattern = new RegExp('('+ eraNamePattern +'|'+ eraInitialPattern +')([0-9]+)[年]?');
        const matches = eraYear.match(pattern);

        if(matches) {

            const eraName = matches[1];
            let year = parseInt(matches[2]);

            if(eraName === '明治' || eraName === 'M') {

                year += 1867;

            } else if(eraName === '大正' || eraName === 'T') {

                year += 1911;

            } else if(eraName === '昭和' || eraName === 'S') {

                year += 1925;

            } else if(eraName === '平成' || eraName === 'H') {

                year += 1988;

            } else if(eraName === '令和' || eraName === 'R') {

                year += 2018;

            }

            return year;

        }

        return -1;

    },

    // Date

    date(format, dateTime) {

        if(!(dateTime instanceof moment)) {

            dateTime = moment(dateTime);

        }

        const pattern = new RegExp('\{([YymndjGgHhiswaEeFf])\}', 'g');
        format = format.replace(pattern, (match, symbol) => {

            let replacedFormat = '';
            let era = null;

            switch(symbol) {

                case 'Y':
                    replacedFormat = 'YYYY年';
                    break;
                case 'y':
                    replacedFormat = 'YY年';
                    break;
                case 'm':
                    replacedFormat = 'MM月';
                    break;
                case 'n':
                    replacedFormat = 'M月';
                    break;
                case 'd':
                    replacedFormat = 'DD日';
                    break;
                case 'j':
                    replacedFormat = 'D日';
                    break;
                case 'G':
                    replacedFormat = 'H時';
                    break;
                case 'g':
                    replacedFormat = 'H時';
                    break;
                case 'H':
                    replacedFormat = 'HH時';
                    break;
                case 'h':
                    replacedFormat = 'HH時';
                    break;
                case 'i':
                    replacedFormat = 'mm分';
                    break;
                case 's':
                    replacedFormat = 'ss秒';
                    break;
                case 'w':
                    replacedFormat = wafu.weekName(dateTime.day());
                    break;
                case 'a':
                    replacedFormat = (dateTime.format('a') === 'am') ? '午前' : '午後';
                    break;
                case 'E':
                    era = wafu.era(dateTime);
                    replacedFormat = era.full;
                    break;
                case 'e':
                    era = wafu.era(dateTime);
                    replacedFormat = '\\'+ era.initial + era.year;
                    break;
                case 'F':
                    replacedFormat = 'YYYY年MM月DD日（'+ wafu.weekName(dateTime.day()) +'） HH時MM分';
                    break;
                case 'f':
                    replacedFormat = 'YYYY年MM月DD日（'+ wafu.weekName(dateTime.day()) +'） HH:MM';
                    break;

            }

            return replacedFormat;

        });

        return dateTime.format(format);

    },

    parseDate(date) {

        date = wafu.singleByte(date).trim();
        const weekNamePattern = wafu.arrayValues(wafu._weekNames).join('|');
        const weekNamePatterns = [
            '（('+ weekNamePattern +')）',
            '\\(('+ weekNamePattern +'\\))'
        ];

        for(let i in weekNamePatterns) {

            let weekNamePattern = new RegExp(weekNamePatterns[i]);
            date = date.replace(weekNamePattern, '');

        }

        const eraNamePattern = wafu.eraNames().join('|');
        const eraInitialPattern = wafu.eraInitials().join('|');
        const eraPatterns = [
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月([\\d]+)日 ([\\d]+)時([\\d]+)分([\\d]+)秒',
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月([\\d]+)日 ([\\d]+)時([\\d]+)分',
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月([\\d]+)日 ([\\d]+)時',
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月([\\d]+)日 ([\\d]+):([\\d]+):([\\d]+)',
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月([\\d]+)日 ([\\d]+):([\\d]+)',
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月([\\d]+)日',
            '(('+ eraNamePattern +')[\\d]+年)([\\d]+)月',
            '(('+ eraNamePattern +')[\\d]+)年',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+).([\\d]+) ([\\d]+)時([\\d]+)分([\\d]+)',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+).([\\d]+) ([\\d]+)時([\\d]+)分',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+).([\\d]+) ([\\d]+)時',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+).([\\d]+) ([\\d]+):([\\d]+):([\\d]+)',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+).([\\d]+) ([\\d]+):([\\d]+)',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+).([\\d]+)',
            '(('+ eraInitialPattern +')[\\d]+).([\\d]+)',
            '(('+ eraInitialPattern +')[\\d]+)',
        ];

        for(let i in eraPatterns) {

            let eraPattern = new RegExp(eraPatterns[i]);
            let matches = date.match(eraPattern);

            if(matches) {

                let year = wafu.commonYear(matches[1]);
                let matchesCount = matches.length;

                if(matchesCount === 8) {

                    return moment({
                        year: year,
                        month: parseInt(matches[3]) - 1,
                        day: matches[4],
                        hour: matches[5],
                        minute: matches[6],
                        second: matches[7]
                    });

                } else if(matchesCount === 7) {

                    return moment({
                        year: year,
                        month: parseInt(matches[3]) - 1,
                        day: matches[4],
                        hour: matches[5],
                        minute: matches[6],
                        second: 0
                    });

                } else if(matchesCount === 6) {


                    return moment({
                        year: year,
                        month: parseInt(matches[3]) - 1,
                        day: matches[4],
                        hour: matches[5],
                        minute: 0,
                        second: 0
                    });

                } else if(matchesCount === 5) {

                    return moment({
                        year: year,
                        month: parseInt(matches[3]) - 1,
                        day: matches[4],
                        hour: 0,
                        minute: 0,
                        second: 0
                    });

                } else if(matchesCount === 4) {


                    return moment({
                        year: year,
                        month: parseInt(matches[3]) - 1,
                        day: 1,
                        hour: 0,
                        minute: 0,
                        second: 0
                    });

                } else if(matchesCount === 3 || matchesCount === 2) {

                    return moment({
                        year: year,
                        month: 0,
                        day: 1,
                        hour: 0,
                        minute: 0,
                        second: 0
                    });

                }

            }

        }

        return null;

    },


    // Yen

    yen(price, mode = 'comma') {

        let yen = '';

        switch(mode) {

            case 'comma':
                yen = wafu.numberFormat(price) +'円';
                break;
            case 'noComma':
                yen = price +'円';
                break;
            case 'symbol':
                yen = '￥'+ wafu.numberFormat(price);
                break;
            case 'symbolNoComma':
                yen = '￥'+ price;
                break;
            case 'symbolCommaHyphen':
                yen = '￥'+ wafu.numberFormat(price) +'-';
                break;
            case 'symbolNoCommaHyphen':
                yen = '￥'+ price +'-';
                break;

        }

        return yen;

    },


    // Consumption tax

    consumptionTax(dt, amount, totalFlag = false) {

        let percentage = 0.08;

        if(dt.isBefore(moment({year: 1989, month: 3, day: 1}))) {   // month: 3 means April!

            percentage = 0;

        } else if(dt.isBefore(moment({year: 1997, month: 3, day: 1}))) {

            percentage = 0.03;

        } else if(dt.isBefore(moment({year: 2014, month: 3, day: 1}))) {

            percentage = 0.05;

        }

        const tax = Math.floor(amount * percentage);

        if(totalFlag) {

            return amount + tax;

        }

        return tax;

    },


    // Zip

    zip(zip, separator = '-') {

        zip = wafu.singleByte(zip);

        if(zip.length === 7) {

            return zip.substr(0, 3) + separator + zip.substr(3, 4);

        }

        return '';

    },

    checkZip(zip, separator = '-') {

        const pattern = new RegExp('^[0-9]{3}'+ separator +'[0-9]{4}$');
        return (zip.search(pattern) !== -1);

    },


    // Single byte characters

    singleByte(str, options = ['alphabet', 'numeric', 'space']) {

        str = str.toString();
        let patterns = [];
        let patternCharacters = {
            alphabet: 'Ａ-Ｚａ-ｚ',
            numeric: '０-９',
            space: '　',
        };

        for(let key in patternCharacters) {

            if(options.indexOf(key) !== -1) {

                let patternCharacter = patternCharacters[key];
                patterns.push(patternCharacter);

            }

        }

        if(patterns.length === 0) {

            return str;

        }

        let pattern = new RegExp('['+ patterns.join('|') +']', 'g');
        return str.replace(pattern, (match) => {

            if(match === '　') {

                return ' ';

            }

            return String.fromCharCode(match.charCodeAt(0) - 65248);

        });

    },


    // Others
    arrayGet(array, key, defaultValue) {

        if(defaultValue === undefined) {

            defaultValue = '';

        }

        if(array[key] === undefined) {

            return defaultValue;

        }

        return array[key];

    },

    arrayValues(array) {

        let values = [];

        for(let key in array) {

            values.push(array[key]);

        }

        return values;

    },

    getShortPrefecture(name) {

        return name.replace(/(県|府|都)$/, '');

    },

    numberFormat(number) {

        return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

    },
};

module.exports = wafu;