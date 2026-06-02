require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module TimelineRails
  class Application < Rails::Application
    config.load_defaults 8.1

    config.time_zone = "Tokyo"
    config.i18n.default_locale = :ja
    config.assets.paths << Rails.root.join("app/assets/javascripts")
  end
end
