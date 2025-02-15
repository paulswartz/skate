defmodule Skate.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  alias Skate.Migrate
  alias Skate.SecretsManager

  @impl true
  def start(_type, _args) do
    load_runtime_config()

    # List all child processes to be supervised
    children =
      [{Skate.Repo, []}] ++
        if Application.get_env(:skate, :start_data_processes) do
          [
            Schedule.Supervisor,
            TrainVehicles.Supervisor,
            Notifications.Supervisor,
            Realtime.Supervisor
          ]
        else
          []
        end ++
        [
          {Phoenix.PubSub, name: Skate.PubSub},
          SkateWeb.Endpoint
        ]

    link = Supervisor.start_link(children, strategy: :one_for_all, name: Skate.Supervisor)

    Migrate.up()

    link
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  @spec config_change(any, any, any) :: :ok
  def config_change(changed, _new, removed) do
    SkateWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  @doc """
  Check system environment variables or SecretsManager secrets at runtime and load them into the application environment.

  Will recursively check the keys below in the application config for any {:system, "ENVIRONMENT_VARIABLE"},
  and replace them with the value in the given environment variable.

  Will recursively check the keys below in the application config for any {:secret, "secret-variable"},
  and replace them with the value in the given value from SecretsManager.
  """
  @spec load_runtime_config() :: :ok
  def load_runtime_config() do
    application_keys = [
      :api_url,
      :api_key,
      :clarity_tag,
      :google_tag_manager_id,
      :gtfs_url,
      :hastus_url,
      :busloc_url,
      :swiftly_authorization_key,
      :swiftly_realtime_vehicles_url,
      :trip_updates_url,
      :geonames_url_base,
      :geonames_token,
      :bridge_url,
      :bridge_api_username,
      :bridge_api_password,
      :sentry_frontend_dsn,
      :sentry_environment,
      SkateWeb.Endpoint,
      Skate.Repo
    ]

    for application_key <- application_keys do
      Application.put_env(
        :skate,
        application_key,
        runtime_config(Application.get_env(:skate, application_key))
      )
    end

    :ok
  end

  @spec runtime_config(any()) :: any()
  defp runtime_config(list) when is_list(list) do
    Enum.map(list, fn elem ->
      case elem do
        {key, value} when is_atom(key) ->
          {key, runtime_config(value)}

        _ ->
          elem
      end
    end)
  end

  defp runtime_config({:system, environment_variable}) do
    System.get_env(environment_variable)
  end

  defp runtime_config({:secret, secret_variable}) do
    SecretsManager.fetch!(secret_variable)
  end

  defp runtime_config(value) do
    value
  end
end
