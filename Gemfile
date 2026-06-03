source "https://rubygems.org"

ruby "4.0.5"

gem "rails", "~> 8.1.3"
gem "propshaft"
gem "sqlite3", ">= 2.1", groups: [:development, :test]
gem "pg", "~> 1.5", groups: :production
gem "puma", ">= 6.0"
gem "devise", "~> 4.9"
gem "omniauth-google-oauth2", "~> 1.2"
gem "omniauth-rails_csrf_protection", "~> 1.0"
gem "tzinfo-data", platforms: %i[ windows jruby ]

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
end
