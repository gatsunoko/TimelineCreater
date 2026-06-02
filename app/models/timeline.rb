class Timeline < ApplicationRecord
  belongs_to :user
  has_many :timeline_events, dependent: :destroy

  validates :title, presence: true
  validates :birth_month, inclusion: { in: 1..12 }, allow_nil: true
  validates :birth_day, inclusion: { in: 1..31 }, allow_nil: true

  def birth
    { year: birth_year, month: birth_month, day: birth_day }
  end

  def to_export_hash
    {
      title: title,
      birth: birth,
      items: timeline_events.ordered.map(&:to_export_hash)
    }
  end
end
