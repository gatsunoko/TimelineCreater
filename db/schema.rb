# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_03_090343) do
  create_table "timeline_events", force: :cascade do |t|
    t.boolean "approximate", default: false, null: false
    t.datetime "created_at", null: false
    t.string "event", null: false
    t.integer "japanese_day"
    t.string "japanese_display"
    t.string "japanese_era"
    t.boolean "japanese_leap", default: false, null: false
    t.integer "japanese_month"
    t.integer "japanese_year"
    t.text "note"
    t.string "sort_key", null: false
    t.integer "timeline_id", null: false
    t.datetime "updated_at", null: false
    t.integer "western_day"
    t.string "western_display"
    t.integer "western_month"
    t.integer "western_year", null: false
    t.index ["timeline_id", "sort_key"], name: "index_timeline_events_on_timeline_id_and_sort_key"
    t.index ["timeline_id"], name: "index_timeline_events_on_timeline_id"
  end

  create_table "timelines", force: :cascade do |t|
    t.integer "birth_day"
    t.integer "birth_month"
    t.integer "birth_year"
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "public", default: false, null: false
    t.string "title", default: "日本史年表", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["public"], name: "index_timelines_on_public"
    t.index ["user_id"], name: "index_timelines_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name"
    t.string "provider"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "timeline_events", "timelines"
  add_foreign_key "timelines", "users"
end
