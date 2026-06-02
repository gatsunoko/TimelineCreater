Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?
  config.active_storage.service = :local
  config.log_level = :info
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "example.com") }
  config.i18n.fallbacks = true
  config.active_support.report_deprecations = false
end
