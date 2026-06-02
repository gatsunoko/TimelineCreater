Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: "users/registrations"
  }

  authenticated :user do
    root "timelines#index", as: :authenticated_root
  end

  devise_scope :user do
    unauthenticated { root "devise/sessions#new" }
  end

  resources :timelines do
    collection do
      get :mine
      get :public_index
    end

    member do
      get :manage
      get :export_json
      post :import_json
    end
    resources :timeline_events, except: %i[index show]
  end
end
