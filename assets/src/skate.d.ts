export interface ByRouteId<T> {
  [routeId: string]: T
}

export type Direction = 0 | 1

export interface Route {
  id: RouteId
}

export type RouteId = string

export type StopId = string

export interface Timepoint {
  id: TimepointId
}

// An undefined value indicates that the timepoints need to be loaded
// A null value indicates that we are currently loading the timepoints
export type LoadableTimepoints = Timepoint[] | null | undefined

export type TimepointId = string

export type TimepointsByRouteId = ByRouteId<LoadableTimepoints>

export type TripId = string

export interface Vehicle {
  id: VehicleId
  label: string
  timestamp: number
  latitude: number
  longitude: number
  direction_id: Direction
  route_id: RouteId
  trip_id: TripId
  headsign: string | null
  via_variant: ViaVariant | null
  stop_status: VehicleStopStatus
  timepoint_status: VehicleTimepointStatus | null
}

export type VehicleId = string

export interface VehicleStopStatus {
  status: VehicleStatus
  stop_id: StopId
}

export interface VehicleTimepointStatus {
  timepoint_id: TimepointId
  fraction_until_timepoint: number
}

export type VehiclesByRouteId = ByRouteId<Vehicle[]>

export type VehicleStatus = "in_transit_to" | "stopped_at"

export type ViaVariant = string
