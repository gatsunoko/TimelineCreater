class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable

  has_many :timelines, dependent: :destroy

  validates :name, presence: true

  def display_name
    name.presence || email
  end
end
