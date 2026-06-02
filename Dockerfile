FROM ruby:4.0.5

ENV BUNDLE_PATH=/usr/local/bundle \
    RAILS_ENV=development

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

COPY Gemfile ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["bash", "-lc", "bundle exec rails db:prepare && bundle exec rails server -b 0.0.0.0"]
