class TimelineEventsController < ApplicationController
  before_action :set_timeline
  before_action :set_event, only: %i[edit update destroy]

  def new
    @event = @timeline.timeline_events.new
  end

  def create
    @event = @timeline.timeline_events.new(event_params)
    if @event.save
      redirect_to manage_timeline_path(@timeline), notice: "項目を追加しました。"
    else
      @events = @timeline.timeline_events.ordered
      @query = ""
      @display_mode = "date"
      render "timelines/manage", status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @event.update(event_params)
      redirect_to manage_timeline_path(@timeline), notice: "項目を更新しました。"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    redirect_to manage_timeline_path(@timeline), notice: "項目を削除しました。"
  end

  private

  def set_timeline
    @timeline = current_user.timelines.find(params[:timeline_id])
  end

  def set_event
    @event = @timeline.timeline_events.find(params[:id])
  end

  def event_params
    params.require(:timeline_event).permit(
      :western_year,
      :western_month,
      :western_day,
      :japanese_era,
      :japanese_year,
      :japanese_month,
      :japanese_leap,
      :japanese_day,
      :approximate,
      :event,
      :note
    )
  end
end
