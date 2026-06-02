class CreateTimelines < ActiveRecord::Migration[8.1]
  def change
    create_table :timelines do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false, default: "日本史年表"
      t.integer :birth_year
      t.integer :birth_month
      t.integer :birth_day
      t.timestamps null: false
    end
  end
end
