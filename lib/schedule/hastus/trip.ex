defmodule Schedule.Hastus.Trip do
  alias Schedule.Csv
  alias Schedule.{Block, Route, Trip}
  alias Schedule.Hastus.{Place, Run, Schedule}

  @type t :: %__MODULE__{
          schedule_id: Schedule.id(),
          run_id: Run.id(),
          block_id: Block.id(),
          start_time: Util.Time.time_of_day(),
          end_time: Util.Time.time_of_day(),
          start_place: Place.id(),
          end_place: Place.id(),
          # nil means nonrevenue
          route_id: Route.id() | nil,
          trip_id: Trip.id()
        }

  @enforce_keys [
    :schedule_id,
    :run_id,
    :block_id,
    :start_time,
    :end_time,
    :start_place,
    :end_place,
    :trip_id
  ]

  defstruct [
    :schedule_id,
    :run_id,
    :block_id,
    :start_time,
    :end_time,
    :start_place,
    :end_place,
    :route_id,
    :trip_id
  ]

  @spec from_csv_row(Csv.row()) :: t()
  def from_csv_row(row) do
    %__MODULE__{
      schedule_id: row["schedule_id"],
      run_id: Run.from_parts(row["area"], row["run_id"]),
      block_id: String.replace(row["block_id"], " ", ""),
      start_time: Util.Time.parse_hhmm(row["start_time"]),
      end_time: Util.Time.parse_hhmm(row["end_time"]),
      start_place: Place.map_input_place_id(row["start_place"]),
      end_place: Place.map_input_place_id(row["end_place"]),
      route_id: route_id(row["route_id"]),
      trip_id: row["trip_id"]
    }
  end

  @spec route_id(String.t()) :: Route.id() | nil
  defp route_id(""), do: nil
  defp route_id("pull"), do: nil
  defp route_id(s), do: s

  @doc """
  Some rows in trips.csv are missing a lot of data. Drop them.
  """
  @spec complete_row?(Csv.row()) :: boolean()
  def complete_row?(row) do
    row["area"] != ""
  end

  @spec parse(binary() | nil) :: [t()]
  def parse(file_binary) do
    Csv.parse(
      file_binary,
      filter: &complete_row?/1,
      parse: &from_csv_row/1,
      format: :hastus
    )
  end

  @spec run_key(t()) :: Run.key()
  def run_key(trip) do
    {trip.schedule_id, trip.run_id}
  end

  @spec block_key(t()) :: Block.key()
  def block_key(trip) do
    {trip.schedule_id, trip.block_id}
  end

  # GTFS Creator creates multiple trips per HASTUS trip with a suffix added
  # to the trip ID. It does this because Schedules has to merge these
  # through-routed trips into continuous trips that change route number,
  # because they can't depend on the HASTUS "fixed link" feature that kept
  # the separate trips attached. But we wanted to keep presenting these to 
  # passengers as separate trips with multiple route numbers. In theory the
  # HASTUS problem will eventually get fixed, but it's been several years
  # already.

  @spec expand_through_routed_trips([t()], MapSet.t()) :: [t()]
  def expand_through_routed_trips(trips, gtfs_trip_ids) do
    through_routed_trip_ids = Enum.filter(gtfs_trip_ids, &Regex.match?(~r/_\d+$/, &1))

    original_id_to_through_routed_trip_ids =
      Enum.reduce(through_routed_trip_ids, %{}, fn through_routed_trip_id, result ->
        original_id = String.replace(through_routed_trip_id, ~r/_\d+$/, "")
        through_routed_trip_ids = Map.get(result, original_id, [])
        new_through_routed_trip_ids = [through_routed_trip_id | through_routed_trip_ids]
        Map.put(result, original_id, new_through_routed_trip_ids)
      end)

    trips
    |> Enum.flat_map(fn trip ->
      through_routed_trip_ids = Map.get(original_id_to_through_routed_trip_ids, trip.trip_id)

      if through_routed_trip_ids do
        Enum.map(through_routed_trip_ids, &%__MODULE__{trip | trip_id: &1})
      else
        [trip]
      end
    end)
  end
end
