defmodule Gtfs.Data do
  @moduledoc """
  GTFS Data management
  """
  require Logger

  alias Gtfs.{Csv, Direction, Helpers, Route, RoutePattern, Stop, StopTime, Trip}

  @type t :: %__MODULE__{
          routes: [Route.t()],
          route_patterns: [RoutePattern.t()],
          stops: [Stop.t()],
          trips: %{Trip.id() => Trip.t()}
        }

  @enforce_keys [
    :routes,
    :route_patterns,
    :stops,
    :trips
  ]

  defstruct [
    :routes,
    :route_patterns,
    :stops,
    :trips
  ]

  @type files :: %{optional(String.t()) => binary()}

  @spec all_routes(t()) :: [Route.t()]
  def all_routes(%__MODULE__{routes: routes}), do: routes

  @spec timepoint_ids_on_route(t(), Route.id()) :: [StopTime.timepoint_id()]
  def timepoint_ids_on_route(
        %__MODULE__{route_patterns: route_patterns} = data,
        route_id
      ) do
    timepoint_ids_by_direction =
      route_patterns
      |> route_patterns_by_direction(route_id)
      |> Helpers.map_values(fn route_patterns ->
        timepoint_ids_for_route_patterns(route_patterns, data)
      end)

    Helpers.merge_lists([
      timepoint_ids_by_direction |> Map.get(0, []) |> Enum.reverse(),
      Map.get(timepoint_ids_by_direction, 1, [])
    ])
  end

  @spec trip(t(), Trip.id()) :: Trip.t() | nil
  def trip(%__MODULE__{trips: trips}, trip_id), do: trips[trip_id]

  @spec parse_files(files()) :: t()
  def parse_files(files) do
    bus_routes = Csv.parse(files["routes.txt"], &Route.bus_route_row?/1, &Route.from_csv_row/1)
    bus_route_ids = MapSet.new(bus_routes, & &1.id)

    %__MODULE__{
      routes: bus_routes,
      route_patterns: bus_route_patterns(files["route_patterns.txt"], bus_route_ids),
      stops: all_stops(files["stops.txt"]),
      trips: bus_trips(files["trips.txt"], files["stop_times.txt"], bus_route_ids)
    }
  end

  @spec route_patterns_by_direction([RoutePattern.t()], Route.id()) :: %{
          Direction.id() => [RoutePattern.t()]
        }
  defp route_patterns_by_direction(route_patterns, route_id) do
    route_patterns
    |> RoutePattern.for_route_id(route_id)
    |> RoutePattern.by_direction()
  end

  # All route_patterns should be in the same direction
  @spec timepoint_ids_for_route_patterns([RoutePattern.t()], t()) :: [StopTime.timepoint_id()]
  defp timepoint_ids_for_route_patterns(route_patterns, data) do
    route_patterns
    |> Enum.map(fn route_pattern -> route_pattern.representative_trip_id end)
    |> Enum.map(fn trip_id -> trip(data, trip_id).stop_times end)
    |> Helpers.merge_lists()
    |> Enum.reject(&(&1.timepoint_id == nil))
    |> Enum.map(& &1.timepoint_id)
  end

  @spec bus_route_patterns(binary(), MapSet.t(Route.id())) :: [RoutePattern.t()]
  defp bus_route_patterns(route_patterns_data, bus_route_ids) do
    Csv.parse(
      route_patterns_data,
      &RoutePattern.row_in_route_id_set?(&1, bus_route_ids),
      &RoutePattern.from_csv_row/1
    )
  end

  @spec all_stops(binary()) :: [Stop.t()]
  defp all_stops(stops_data), do: Csv.parse(stops_data, fn _row -> true end, &Stop.from_csv_row/1)

  @spec bus_trips(binary(), binary(), MapSet.t(Route.id())) :: %{Trip.id() => Trip.t()}
  defp bus_trips(trips_data, stop_times_data, bus_route_ids) do
    bus_trips =
      Csv.parse(
        trips_data,
        &Trip.row_in_route_id_set?(&1, bus_route_ids),
        &Trip.from_csv_row/1
      )

    bus_trip_ids = MapSet.new(bus_trips, & &1.id)

    bus_trip_stop_times =
      stop_times_data
      |> Csv.parse(&StopTime.row_in_trip_id_set?(&1, bus_trip_ids))
      |> StopTime.trip_stop_times_from_csv()

    Map.new(
      bus_trips,
      fn trip -> {trip.id, %{trip | stop_times: Map.get(bus_trip_stop_times, trip.id, [])}} end
    )
  end
end
