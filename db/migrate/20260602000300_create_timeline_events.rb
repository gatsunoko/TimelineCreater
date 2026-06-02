class CreateTimelineEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :timeline_events do |t|
      t.references :timeline, null: false, foreign_key: true
      t.integer :western_year, null: false
      t.integer :western_month
      t.integer :western_day
      t.string :western_display
      t.string :japanese_era
      t.integer :japanese_year
      t.integer :japanese_month
      t.boolean :japanese_leap, null: false, default: false
      t.integer :japanese_day
      t.string :japanese_display
      t.boolean :approximate, null: false, default: false
      t.string :event, null: false
      t.text :note
      t.string :sort_key, null: false
      t.timestamps null: false
    end

    add_index :timeline_events, [:timeline_id, :sort_key]
  end
end
