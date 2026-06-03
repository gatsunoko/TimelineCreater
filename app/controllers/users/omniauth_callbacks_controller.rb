class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    @user = User.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted?
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: "Google") if is_navigational_format?
    else
      session["devise.google_data"] = request.env["omniauth.auth"].except(:extra)
      redirect_to new_user_registration_url, alert: "Googleアカウントでの登録に失敗しました: #{@user.errors.full_messages.join(', ')}"
    end
  end

  def failure
    redirect_to new_user_session_path, alert: "Google認証に失敗しました。もう一度お試しください。"
  end
end
