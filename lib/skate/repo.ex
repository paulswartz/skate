defmodule Skate.Repo do
  require Logger

  use Ecto.Repo,
    otp_app: :skate,
    adapter: Ecto.Adapters.Postgres

  def add_prod_credentials(config, auth_token_fn \\ &ExAws.RDS.generate_db_auth_token/4) do
    hostname = System.get_env("POSTGRES_HOSTNAME")
    port = System.get_env("POSTGRES_PORT", "5432") |> String.to_integer()
    username = System.get_env("POSTGRES_USERNAME")

    token =
      auth_token_fn.(
        hostname,
        username,
        port,
        %{}
      )

    Keyword.merge(config,
      hostname: hostname,
      username: username,
      port: port,
      password: token,
      ssl_opts: [
        cacertfile: "priv/aws-cert-bundle.pem",
        verify: :verify_peer,
        server_name_indication: String.to_charlist(hostname),
        verify_fun:
          {&:ssl_verify_hostname.verify_fun/3, [check_hostname: String.to_charlist(hostname)]}
      ]
    )
  end
end
