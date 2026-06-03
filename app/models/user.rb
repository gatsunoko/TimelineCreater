class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]

  has_many :timelines, dependent: :destroy

  validates :name, presence: true

  def display_name
    name.presence || email
  end

  # Google OAuth ユーザーはパスワード不要
  def password_required?
    !(provider.present?) && super
  end

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.name = auth.info.name
      user.password = Devise.friendly_token(32)
    end
  end
end
