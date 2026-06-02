Rails.application.routes.draw do
  devise_for :users

  authenticated :user do
    root "timelines#index", as: :authenticated_root
  end

  devise_scope :user do
    unauthenticated { root "devise/sessions#new" }
  end

  resources :timelines do
    member do
      get :manage
      get :export_json
      get :export_js
      get :export_csv
      post :import_json
      post :import_csv
    end
    resources :timeline_events, except: %i[index show]
  end
end
