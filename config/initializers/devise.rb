Devise.setup do |config|
  config.mailer_sender = "timeline@example.com"
  require "devise/orm/active_record"
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = false
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.sign_out_via = :delete

  # OmniAuth Google OAuth2
  config.omniauth :google_oauth2,
                  ENV.fetch("GOOGLE_CLIENT_ID", ""),
                  ENV.fetch("GOOGLE_CLIENT_SECRET", ""),
                  { scope: "email,profile" }
end
