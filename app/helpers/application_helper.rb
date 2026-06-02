module ApplicationHelper
  def age_display(timeline, event, mode)
    return event.western_display if mode == "date" || timeline.birth_year.blank?

    birth_month = timeline.birth_month || 1
    birth_day = timeline.birth_day || 1
    event_month = event.western_month || 1
    event_day = event.western_day || 1

    age =
      if mode == "age-count"
        event.western_year - timeline.birth_year + 1
      else
        full = event.western_year - timeline.birth_year
        full -= 1 if (event_month * 100 + event_day) < (birth_month * 100 + birth_day)
        full
      end

    age >= 0 ? "#{age}歳" : "誕生前"
  end

  def mode_button_class(current, mode)
    ["btn", "btn-sm", ("active" if current == mode)].compact.join(" ")
  end
end
