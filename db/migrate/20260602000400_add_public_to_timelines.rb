class AddPublicToTimelines < ActiveRecord::Migration[8.1]
  def change
    add_column :timelines, :public, :boolean, null: false, default: false
    add_index :timelines, :public
  end
end
