class TimelineEvent < ApplicationRecord
  belongs_to :timeline

  validates :western_year, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :western_month, inclusion: { in: 1..12 }, allow_nil: true
  validates :western_day, inclusion: { in: 1..31 }, allow_nil: true
  validates :event, presence: true

  before_validation :build_displays_and_sort_key

  scope :ordered, -> { order(:sort_key, :id) }

  def self.search(query)
    return all if query.blank?

    q = "%#{sanitize_sql_like(query)}%"
    where(
      "event LIKE :q OR note LIKE :q OR western_display LIKE :q OR japanese_display LIKE :q OR japanese_era LIKE :q",
      q: q
    )
  end

  def build_displays_and_sort_key
    self.western_display = build_western_display
    self.japanese_display = build_japanese_display
    self.sort_key = [
      western_year.to_i.to_s.rjust(4, "0"),
      (western_month || 0).to_i.to_s.rjust(2, "0"),
      (western_day || 0).to_i.to_s.rjust(2, "0")
    ].join("-")
  end

  def to_export_hash
    {
      id: "tl-#{id}",
      western: {
        year: western_year,
        month: western_month,
        day: western_day,
        display: western_display
      },
      japanese: {
        era: japanese_era,
        year: japanese_year,
        month: japanese_month,
        isLeap: japanese_leap,
        day: japanese_day,
        display: japanese_display
      },
      isApprox: approximate,
      event: event,
      note: note.to_s,
      sortKey: sort_key
    }
  end

  private

  def build_western_display
    display = "#{western_year}年"
    display += "#{western_month}月" if western_month.present?
    display += "#{western_day}日" if western_day.present?
    approximate ? "#{display}頃" : display
  end

  def build_japanese_display
    return "" if japanese_era.blank? || japanese_year.blank?

    year_text = japanese_year == 1 ? "元" : japanese_year.to_s
    display = "#{japanese_era}#{year_text}年"
    display += "閏" if japanese_leap?
    display += "#{japanese_month}月" if japanese_month.present?
    display += "#{japanese_day}日" if japanese_day.present?
    approximate ? "#{display}頃" : display
  end
end
