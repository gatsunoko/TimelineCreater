user = User.find_or_create_by!(email: "demo@example.com") do |record|
  record.password = "password"
  record.password_confirmation = "password"
end

timeline = user.timelines.find_or_create_by!(title: "日本史年表") do |record|
  record.birth_year = 1534
  record.birth_month = 6
  record.birth_day = 23
end

if timeline.timeline_events.empty?
  timeline.timeline_events.create!(
    western_year: 1534,
    western_month: 6,
    western_day: 23,
    japanese_era: "天文",
    japanese_year: 3,
    japanese_month: 5,
    japanese_day: 12,
    event: "織田信長誕生",
    note: "尾張国の織田弾正忠家に生まれる。"
  )

  timeline.timeline_events.create!(
    western_year: 1582,
    western_month: 6,
    western_day: 21,
    japanese_era: "天正",
    japanese_year: 10,
    japanese_month: 6,
    japanese_day: 2,
    event: "本能寺の変",
    note: "明智光秀の謀反により、京都本能寺で信長が自害する。"
  )
end
