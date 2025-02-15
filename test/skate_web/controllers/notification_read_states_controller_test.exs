defmodule SkateWeb.NotificationReadStatesControllerTest do
  use SkateWeb.ConnCase
  use Skate.DataCase
  import Skate.Factory
  alias Notifications.Notification
  alias Notifications.Db.NotificationUser, as: DbNotificationUser
  alias Skate.Settings.RouteTab
  alias Skate.Settings.User

  import Ecto.Query

  def build_test_tab() do
    build(:route_tab, %{
      preset_name: "some routes",
      selected_route_ids: ["1", "2"]
    })
  end

  describe "PUT /api/notification_read_states" do
    @tag :authenticated
    test "sets read state for a batch of notifications for the user", %{
      conn: conn,
      user: username
    } do
      user = User.get_or_create(username)
      route_tab1 = build_test_tab()
      RouteTab.update_all_for_user!(username, [route_tab1])

      User.get_or_create("otheruser")
      route_tab2 = build_test_tab()
      RouteTab.update_all_for_user!("otheruser", [route_tab2])

      user_notification1 =
        Notification.get_or_create_from_block_waiver(%{
          block_id: "bl1",
          service_id: "ser1",
          created_at: 0,
          reason: :manpower,
          route_ids: ["1"],
          run_ids: [],
          trip_ids: [],
          start_time: 0,
          end_time: 0
        })

      user_notification2 =
        Notification.get_or_create_from_block_waiver(%{
          block_id: "bl1",
          service_id: "ser1",
          created_at: 0,
          reason: :other,
          route_ids: ["2"],
          run_ids: [],
          trip_ids: [],
          start_time: 0,
          end_time: 0
        })

      unread_state = :unread
      read_state = :read

      assert Skate.Repo.one(
               from(nu in DbNotificationUser,
                 select: count(nu),
                 where: nu.state == ^unread_state
               )
             ) == 4

      conn =
        conn
        |> put("/api/notification_read_state", %{
          "new_state" => "read",
          "notification_ids" => "#{user_notification1.id}"
        })

      response(conn, 200)

      assert Skate.Repo.one(
               from(nu in DbNotificationUser,
                 select: count(nu),
                 where: nu.state == ^read_state
               )
             ) == 1

      assert Skate.Repo.one(
               from(nu in DbNotificationUser,
                 select: {nu.notification_id, nu.user_id},
                 where: nu.state == ^read_state
               )
             ) == {user_notification1.id, user.id}

      conn =
        conn
        |> put("/api/notification_read_state", %{
          "new_state" => "read",
          "notification_ids" => "#{user_notification2.id}"
        })

      response(conn, 200)

      assert Skate.Repo.one(
               from(nu in DbNotificationUser,
                 select: count(nu),
                 where: nu.state == ^read_state
               )
             ) == 2

      read_notification_user_ids =
        Skate.Repo.all(
          from(nu in DbNotificationUser,
            select: {nu.notification_id, nu.user_id},
            where: nu.state == ^read_state
          )
        )
        |> Enum.sort()

      assert read_notification_user_ids ==
               [
                 {user_notification1.id, user.id},
                 {user_notification2.id, user.id}
               ]
               |> Enum.sort()

      conn =
        conn
        |> put("/api/notification_read_state", %{
          "new_state" => "unread",
          "notification_ids" => "#{user_notification1.id},#{user_notification2.id}"
        })

      response(conn, 200)

      assert Skate.Repo.one(
               from(nu in DbNotificationUser,
                 select: count(nu),
                 where: nu.state == ^unread_state
               )
             ) == 4
    end
  end
end
