class Users::RegistrationsController < Devise::RegistrationsController
  protected

  def update_resource(resource, params)
    # Google連携ユーザーの場合は、外部からのリクエストでメールアドレスが書き換えられるのを防ぐ
    if resource.provider.present?
      params = params.except(:email)
    end

    # パスワード入力欄が空白の場合は、現在のパスワード入力を要求せずに更新する
    if params[:password].blank? && params[:password_confirmation].blank?
      resource.update_without_password(params.except(:current_password))
    else
      super
    end
  end
end
