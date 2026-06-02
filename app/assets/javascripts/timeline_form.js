document.addEventListener("DOMContentLoaded", () => {
  const eraData = typeof ERA_DATA !== "undefined" ? ERA_DATA : [];

  const populateEraOptions = (select, currentValue = "") => {
    if (!select || eraData.length === 0) return;
    if (select.dataset.populated === "true") return;

    eraData.forEach((era) => {
      const option = document.createElement("option");
      option.value = era.name;
      option.textContent = era.name;
      if (currentValue === era.name) option.selected = true;
      select.appendChild(option);
    });
    select.dataset.populated = "true";
  };

  const findEraByWesternYear = (year) => {
    return [...eraData].reverse().find((era) => {
      const starts = era.startYear <= year;
      const notEnded = !era.endYear || era.endYear >= year;
      return starts && notEnded;
    });
  };

  const numberValue = (input) => {
    if (!input || input.value === "") return null;
    const value = parseInt(input.value, 10);
    return Number.isNaN(value) ? null : value;
  };

  const canUseQreki = () => {
    return typeof Qreki !== "undefined" && Qreki && Qreki.isReady && Qreki.isReady();
  };

  const setJapaneseFromWestern = (fields) => {
    const year = numberValue(fields.westernYear);
    const month = numberValue(fields.westernMonth);
    const day = numberValue(fields.westernDay);
    if (!year || !fields.japaneseEra || !fields.japaneseYear) return;

    if (year && month && day && canUseQreki()) {
      const converted = Qreki.westToKyureki(year, month, day);
      if (converted) {
        fields.japaneseEra.value = converted.era || "";
        fields.japaneseYear.value = converted.year || "";
        if (fields.japaneseMonth) fields.japaneseMonth.value = converted.month || "";
        if (fields.japaneseDay) fields.japaneseDay.value = converted.day || "";
        if (fields.japaneseLeap) fields.japaneseLeap.checked = !!converted.isLeap;
        return;
      }
    }

    const era = findEraByWesternYear(year);
    if (!era) return;

    fields.japaneseEra.value = era.name;
    fields.japaneseYear.value = year - era.startYear + 1;
    if (fields.japaneseMonth && fields.westernMonth) fields.japaneseMonth.value = fields.westernMonth.value;
    if (fields.japaneseDay && fields.westernDay) fields.japaneseDay.value = fields.westernDay.value;
    if (fields.japaneseLeap) fields.japaneseLeap.checked = false;
  };

  document.querySelectorAll("[data-note-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.noteToggle);
      if (!target) return;

      const open = target.classList.toggle("show");
      button.textContent = open ? "備考を閉じる" : "備考を表示";
    });
  });

  document.querySelectorAll("form[data-turbo-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!window.confirm(form.dataset.turboConfirm)) {
        event.preventDefault();
      }
    });
  });

  const eraSelect = document.getElementById("timeline_event_japanese_era");
  populateEraOptions(eraSelect, eraSelect ? eraSelect.dataset.current : "");

  const westernYear = document.getElementById("timeline_event_western_year");
  const westernMonth = document.getElementById("timeline_event_western_month");
  const westernDay = document.getElementById("timeline_event_western_day");
  const japaneseEra = document.getElementById("timeline_event_japanese_era");
  const japaneseYear = document.getElementById("timeline_event_japanese_year");
  const japaneseMonth = document.getElementById("timeline_event_japanese_month");
  const japaneseDay = document.getElementById("timeline_event_japanese_day");
  const japaneseLeap = document.getElementById("timeline_event_japanese_leap");

  if (westernYear && japaneseEra && japaneseYear && eraData.length > 0) {
    const syncEventWesternToJapanese = () => {
      setJapaneseFromWestern({
        westernYear,
        westernMonth,
        westernDay,
        japaneseEra,
        japaneseYear,
        japaneseMonth,
        japaneseDay,
        japaneseLeap
      });
    };

    [westernYear, westernMonth, westernDay].forEach((input) => {
      if (input) input.addEventListener("input", syncEventWesternToJapanese);
    });
  }

  const birthWesternYear = document.getElementById("timeline_birth_year");
  const birthWesternMonth = document.getElementById("timeline_birth_month");
  const birthWesternDay = document.getElementById("timeline_birth_day");
  const birthJapaneseEra = document.getElementById("timeline_birth_japanese_era");
  const birthJapaneseYear = document.getElementById("timeline_birth_japanese_year");
  const birthJapaneseMonth = document.getElementById("timeline_birth_japanese_month");
  const birthJapaneseDay = document.getElementById("timeline_birth_japanese_day");

  populateEraOptions(birthJapaneseEra);

  const syncBirthWesternToJapanese = () => {
    setJapaneseFromWestern({
      westernYear: birthWesternYear,
      westernMonth: birthWesternMonth,
      westernDay: birthWesternDay,
      japaneseEra: birthJapaneseEra,
      japaneseYear: birthJapaneseYear,
      japaneseMonth: birthJapaneseMonth,
      japaneseDay: birthJapaneseDay
    });
  };

  const syncBirthJapaneseToWestern = () => {
    if (!birthWesternYear || !birthJapaneseEra || !birthJapaneseYear) return;

    const era = eraData.find((candidate) => candidate.name === birthJapaneseEra.value);
    const eraYear = parseInt(birthJapaneseYear.value, 10);
    if (!era || !eraYear) return;

    birthWesternYear.value = era.startYear + eraYear - 1;
    if (birthWesternMonth && birthJapaneseMonth) birthWesternMonth.value = birthJapaneseMonth.value;
    if (birthWesternDay && birthJapaneseDay) birthWesternDay.value = birthJapaneseDay.value;
  };

  [birthWesternYear, birthWesternMonth, birthWesternDay].forEach((input) => {
    if (input) input.addEventListener("input", syncBirthWesternToJapanese);
  });

  [birthJapaneseEra, birthJapaneseYear, birthJapaneseMonth, birthJapaneseDay].forEach((input) => {
    if (input) input.addEventListener("input", syncBirthJapaneseToWestern);
    if (input && input.tagName === "SELECT") input.addEventListener("change", syncBirthJapaneseToWestern);
  });

  syncBirthWesternToJapanese();
});
