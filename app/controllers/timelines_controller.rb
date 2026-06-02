
class TimelinesController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_visible_timeline, only: :show
  before_action :set_owned_timeline, only: %i[manage edit update export_json import_json]
  before_action :set_owned_timeline_for_destroy, only: :destroy

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
    return redirect_to timelines_path, notice: "年表はすでに削除されています。" unless @timeline

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


  def import_json
    payload = JSON.parse(params.require(:file).read)
    items = payload.is_a?(Array) ? payload : payload.fetch("items", [])

    Timeline.transaction do
      unless payload.is_a?(Array)
        if params[:overwrite_metadata] == "true"
          @timeline.update!(
            title: payload["title"].presence || @timeline.title,
            birth_year: payload.dig("birth", "year"),
            birth_month: payload.dig("birth", "month"),
            birth_day: payload.dig("birth", "day")
          )
        end
      end

      items.each { |item| @timeline.timeline_events.create!(event_attributes_from_json(item)) }
    end

    redirect_to manage_timeline_path(@timeline), notice: "#{items.size}件のJSONデータをインポートしました。"
  rescue JSON::ParserError, KeyError, ActiveRecord::RecordInvalid => e
    redirect_to manage_timeline_path(@timeline), alert: "JSONインポートに失敗しました: #{e.message}"
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

  def set_owned_timeline_for_destroy
    @timeline = current_user.timelines.find_by(id: params[:id])
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


end
