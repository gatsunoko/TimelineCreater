require "csv"

class TimelinesController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_visible_timeline, only: :show
  before_action :set_owned_timeline, only: %i[manage edit update destroy export_json export_csv import_json import_csv]

  def index
    @timelines_scope = current_user.timelines.order(updated_at: :desc)
    @public_timelines_scope = Timeline.published.where.not(user_id: current_user.id).order(updated_at: :desc)
    @timelines = @timelines_scope.limit(5)
    @public_timelines = @public_timelines_scope.limit(5)
  end

  def mine
    @timelines = current_user.timelines.order(updated_at: :desc)
  end

  def public_index
    @public_timelines = Timeline.published.where.not(user_id: current_user.id).order(updated_at: :desc)
  end

  def show
    @query = params[:q].to_s.strip
    @display_mode = params[:mode].presence || "date"
    @events = @timeline.timeline_events.search(@query).ordered
  end

  def manage
    @query = params[:q].to_s.strip
    @display_mode = params[:mode].presence || "date"
    @events = @timeline.timeline_events.search(@query).ordered
    @event = @timeline.timeline_events.new
  end

  def new
    @timeline = current_user.timelines.new
    @timeline.title = nil
  end

  def create
    @timeline = current_user.timelines.new(timeline_params)
    if @timeline.save
      redirect_to new_timeline_timeline_event_path(@timeline), notice: "年表を作成しました。"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @timeline.update(timeline_params)
      redirect_to @timeline, notice: "年表設定を保存しました。"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @timeline.destroy
    redirect_to timelines_path, notice: "年表を削除しました。"
  end

  def export_json
    send_data(
      JSON.pretty_generate(@timeline.to_export_hash),
      filename: "#{@timeline.title}.json",
      type: "application/json; charset=utf-8"
    )
  end

  def export_csv
    csv = CSV.generate(headers: true) do |out|
      out << %w[西暦年 西暦月 西暦日 元号 和暦年 和暦月 閏月 和暦日 頃 事項 備考]
      @timeline.timeline_events.ordered.each do |event|
        out << [
          event.western_year,
          event.western_month,
          event.western_day,
          event.japanese_era,
          event.japanese_year,
          event.japanese_month,
          event.japanese_leap ? "1" : "",
          event.japanese_day,
          event.approximate ? "1" : "",
          event.event,
          event.note
        ]
      end
    end

    send_data "\uFEFF#{csv}", filename: "timeline-data.csv", type: "text/csv; charset=utf-8"
  end

  def import_json
    payload = JSON.parse(params.require(:file).read)
    items = payload.is_a?(Array) ? payload : payload.fetch("items", [])

    Timeline.transaction do
      unless payload.is_a?(Array)
        @timeline.update!(
          title: payload["title"].presence || @timeline.title,
          birth_year: payload.dig("birth", "year"),
          birth_month: payload.dig("birth", "month"),
          birth_day: payload.dig("birth", "day")
        )
      end

      @timeline.timeline_events.destroy_all
      items.each { |item| @timeline.timeline_events.create!(event_attributes_from_json(item)) }
    end

    redirect_to manage_timeline_path(@timeline), notice: "#{items.size}件のJSONデータをインポートしました。"
  rescue JSON::ParserError, KeyError, ActiveRecord::RecordInvalid => e
    redirect_to manage_timeline_path(@timeline), alert: "JSONインポートに失敗しました: #{e.message}"
  end

  def import_csv
    rows = CSV.parse(params.require(:file).read, headers: true)
    imported = 0

    Timeline.transaction do
      @timeline.timeline_events.destroy_all
      rows.each do |row|
        next if row["西暦年"].blank? || row["事項"].blank?

        @timeline.timeline_events.create!(
          western_year: row["西暦年"],
          western_month: row["西暦月"].presence,
          western_day: row["西暦日"].presence,
          japanese_era: row["元号"].presence,
          japanese_year: row["和暦年"].presence,
          japanese_month: row["和暦月"].presence,
          japanese_leap: truthy?(row["閏月"]),
          japanese_day: row["和暦日"].presence,
          approximate: truthy?(row["頃"]),
          event: row["事項"],
          note: row["備考"]
        )
        imported += 1
      end
    end

    redirect_to manage_timeline_path(@timeline), notice: "#{imported}件のCSVデータをインポートしました。"
  rescue CSV::MalformedCSVError, ActiveRecord::RecordInvalid => e
    redirect_to manage_timeline_path(@timeline), alert: "CSVインポートに失敗しました: #{e.message}"
  end

  private

  def set_visible_timeline
    @timeline = Timeline.find(params[:id])
    return if @timeline.visible_to?(current_user)

    if user_signed_in?
      redirect_to timelines_path, alert: "この年表は非公開です。"
    else
      redirect_to new_user_session_path, alert: "この年表を見るにはログインしてください。"
    end
  end

  def set_owned_timeline
    @timeline = current_user.timelines.find(params[:id])
  end

  def timeline_params
    params.require(:timeline).permit(:title, :birth_year, :birth_month, :birth_day, :public)
  end

  def event_attributes_from_json(item)
    western = item.fetch("western", {})
    japanese = item.fetch("japanese", {})
    {
      western_year: western["year"],
      western_month: western["month"],
      western_day: western["day"],
      japanese_era: japanese["era"],
      japanese_year: japanese["year"],
      japanese_month: japanese["month"],
      japanese_leap: japanese["isLeap"],
      japanese_day: japanese["day"],
      approximate: item["isApprox"],
      event: item["event"],
      note: item["note"]
    }
  end

  def truthy?(value)
    value.to_s.downcase.in?(["1", "true", "○", "閏", "頃"])
  end
end
