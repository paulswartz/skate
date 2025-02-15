import { mount } from "enzyme"
import React from "react"
import renderer, { act } from "react-test-renderer"
import RouteLadder from "../../src/components/routeLadder"
import { StateDispatchProvider } from "../../src/contexts/stateDispatchContext"
import { LadderCrowdingToggles } from "../../src/models/ladderCrowdingToggle"
import {
  Ghost,
  RouteStatus,
  Vehicle,
  VehicleOrGhost,
} from "../../src/realtime.d"
import { Route } from "../../src/schedule.d"
import { initialState, selectVehicle } from "../../src/state"
import vehicleFactory from "../factories/vehicle"
import ghostFactory from "../factories/ghost"
import routeFactory from "../factories/route"

const vehicles: Vehicle[] = [
  vehicleFactory.build({
    id: "y1818",
    label: "1818",
    runId: "run-1",
    timestamp: 1557160307,
    latitude: 0,
    longitude: 0,
    directionId: 0,
    routeId: "28",
    tripId: "39914237",
    operatorId: "op1",
    operatorFirstName: "PATTI",
    operatorLastName: "SMITH",
    operatorLogonTime: new Date("2018-08-15T13:38:21.000Z"),
    bearing: 33,
    blockId: "block-1",
    headsign: "h1",
    viaVariant: "4",
    previousVehicleId: "v2",
    scheduleAdherenceSecs: 0,
    isShuttle: false,
    isOverload: false,
    isOffCourse: false,
    isRevenue: true,
    layoverDepartureTime: null,
    dataDiscrepancies: [],
    stopStatus: {
      stopId: "57",
      stopName: "57",
    },
    timepointStatus: {
      fractionUntilTimepoint: 0.5,
      timepointId: "MATPN",
    },
    scheduledLocation: null,
    routeStatus: "on_route",
    endOfTripType: "another_trip",
    blockWaivers: [],
    crowding: null,
  }),
  vehicleFactory.build({
    id: "y0479",
    label: "0479",
    runId: "run-2",
    timestamp: 1557160347,
    latitude: 0,
    longitude: 0,
    directionId: 1,
    routeId: "28",
    tripId: "39914128",
    operatorId: "op2",
    operatorFirstName: "NORA",
    operatorLastName: "JONES",
    operatorLogonTime: new Date("2018-08-15T13:38:21.000Z"),
    bearing: 33,
    blockId: "block-1",
    headsign: null,
    viaVariant: null,
    previousVehicleId: "v2",
    scheduleAdherenceSecs: 0,
    isShuttle: false,
    isOverload: false,
    isOffCourse: false,
    isRevenue: true,
    layoverDepartureTime: null,
    dataDiscrepancies: [],
    stopStatus: {
      stopId: "59",
      stopName: "59",
    },
    timepointStatus: {
      fractionUntilTimepoint: 0.0,
      timepointId: "MORTN",
    },
    scheduledLocation: {
      routeId: "28",
      directionId: 1,
      tripId: "scheduled trip",
      runId: "scheduled run",
      timeSinceTripStartTime: 0,
      headsign: "scheduled headsign",
      viaVariant: "scheduled via variant",
      timepointStatus: {
        timepointId: "MORTN",
        fractionUntilTimepoint: 0.0,
      },
    },
    routeStatus: "on_route",
    endOfTripType: "another_trip",
    blockWaivers: [],
    crowding: null,
  }),
]

describe("routeLadder", () => {
  const originalGetBBox = SVGSVGElement.prototype.getBBox
  const originalGetElementsByClassName = document.getElementsByClassName

  beforeEach(() => {
    SVGSVGElement.prototype.getBBox = () => {
      return {
        height: 100,
        width: 50,
      } as DOMRect
    }
    const mockElement = {
      offsetHeight: 120,
    }
    // @ts-ignore
    document.getElementsByClassName = () => [mockElement]
  })

  afterEach(() => {
    SVGSVGElement.prototype.getBBox = originalGetBBox
    document.getElementsByClassName = originalGetElementsByClassName
  })

  test("renders a route ladder", () => {
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          timepoints={timepoints}
          vehiclesAndGhosts={undefined}
          selectedVehicleId={undefined}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("renders a route ladder with vehicles", () => {
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const ghost: Ghost = ghostFactory.build({
      id: "ghost-trip",
      directionId: 0,
      routeId: route.id,
      tripId: "ghost trip",
      headsign: "headsign",
      blockId: "ghost block",
      runId: "123-0123",
      viaVariant: null,
      layoverDepartureTime: null,
      scheduledTimepointStatus: {
        timepointId: "MORTN",
        fractionUntilTimepoint: 0.0,
      },
      scheduledLogonTime: null,
      routeStatus: "on_route",
      blockWaivers: [],
    })

    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          timepoints={timepoints}
          vehiclesAndGhosts={(vehicles as VehicleOrGhost[]).concat([ghost])}
          selectedVehicleId={undefined}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("renders a route ladder with vehicles in the incoming box", () => {
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]
    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          timepoints={timepoints}
          vehiclesAndGhosts={vehicles.map((vehicle: Vehicle) => ({
            ...vehicle,
            routeStatus: "pulling_out" as RouteStatus,
          }))}
          selectedVehicleId={undefined}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("renders a route ladder with laying over vehicles", () => {
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })

    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const [v1, v2] = vehicles
    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          selectedVehicleId={undefined}
          timepoints={timepoints}
          vehiclesAndGhosts={[
            { ...v1, routeStatus: "laying_over" },
            { ...v2, routeStatus: "laying_over" },
          ]}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("renders a route ladder with crowding instead of vehicles", () => {
    const ladderCrowdingToggles: LadderCrowdingToggles = { "28": true }
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })

    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const [v1, v2] = vehicles
    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          selectedVehicleId={undefined}
          timepoints={timepoints}
          vehiclesAndGhosts={[
            {
              ...v1,
              crowding: {
                occupancyStatus: "FEW_SEATS_AVAILABLE",
                occupancyPercentage: 0.78,
                load: 14,
                capacity: 18,
              },
            },
            {
              ...v2,
              crowding: null,
            },
          ]}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={ladderCrowdingToggles}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("doesn't render a bus that's off-course but nonrevenue", () => {
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })

    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const [v1, v2] = vehicles
    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          selectedVehicleId={undefined}
          timepoints={timepoints}
          vehiclesAndGhosts={[
            {
              ...v1,
            },
            {
              ...v2,
              isOffCourse: true,
              isRevenue: false,
            },
          ]}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("displays no crowding data for a bus coming off a route with no crowding data onto a route with crowding data", () => {
    const ladderCrowdingToggles: LadderCrowdingToggles = { "28": true }
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })

    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const [v1, v2] = vehicles
    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          selectedVehicleId={undefined}
          timepoints={timepoints}
          vehiclesAndGhosts={[
            {
              ...v1,
              crowding: {
                occupancyStatus: "FEW_SEATS_AVAILABLE",
                occupancyPercentage: 0.78,
                load: 14,
                capacity: 18,
              },
            },
            {
              ...v2,
              routeId: "741",
              crowding: null,
            },
          ]}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={ladderCrowdingToggles}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("doesn't display crowding data for a vehicle coming off a route with crowding data onto a route with none", () => {
    const ladderCrowdingToggles: LadderCrowdingToggles = { "28": true }
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })

    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const [v1, v2] = vehicles
    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          selectedVehicleId={undefined}
          timepoints={timepoints}
          vehiclesAndGhosts={[
            {
              ...v1,
              crowding: null,
            },
            {
              ...v2,
              routeId: "741",
              crowding: {
                occupancyStatus: "FEW_SEATS_AVAILABLE",
                occupancyPercentage: 0.78,
                load: 14,
                capacity: 18,
              },
            },
          ]}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={ladderCrowdingToggles}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("displays loading if we are fetching the timepoints", () => {
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = null

    const tree = renderer
      .create(
        <RouteLadder
          route={route}
          timepoints={timepoints}
          vehiclesAndGhosts={undefined}
          selectedVehicleId={undefined}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  test("clicking the close button deselects that route", () => {
    const mockDeselect = jest.fn()
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const wrapper = mount(
      <RouteLadder
        route={route}
        timepoints={timepoints}
        vehiclesAndGhosts={undefined}
        selectedVehicleId={undefined}
        deselectRoute={mockDeselect}
        reverseLadder={() => {}}
        toggleCrowding={() => {}}
        ladderDirections={{}}
        ladderCrowdingToggles={{}}
      />
    )
    wrapper.find(".m-route-ladder__header .m-close-button").simulate("click")

    expect(mockDeselect).toHaveBeenCalledWith("28")
  })

  test("clicking the reverse button reverses the order of the timepoints", () => {
    const mockReverse = jest.fn()
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const wrapper = mount(
      <RouteLadder
        route={route}
        timepoints={timepoints}
        vehiclesAndGhosts={undefined}
        selectedVehicleId={undefined}
        deselectRoute={() => {}}
        reverseLadder={mockReverse}
        toggleCrowding={() => {}}
        ladderDirections={{}}
        ladderCrowdingToggles={{}}
      />
    )
    act(() => {
      wrapper.find(".m-route-ladder__reverse").simulate("click")
    })

    expect(mockReverse).toHaveBeenCalledWith("28")
  })

  test("clicking the crowding toggle toggles crowding", () => {
    const mockToggle = jest.fn()
    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]

    const [v1] = vehicles

    const wrapper = mount(
      <RouteLadder
        route={route}
        timepoints={timepoints}
        vehiclesAndGhosts={[
          {
            ...v1,
            crowding: {
              occupancyStatus: "EMPTY",
              load: 0,
              capacity: 18,
              occupancyPercentage: 0,
            },
          },
        ]}
        selectedVehicleId={undefined}
        deselectRoute={() => {}}
        reverseLadder={() => {}}
        toggleCrowding={mockToggle}
        ladderDirections={{}}
        ladderCrowdingToggles={{}}
      />
    )
    act(() => {
      wrapper.find(".m-route-ladder__crowding-toggle--show").simulate("click")
    })

    expect(mockToggle).toHaveBeenCalledWith("28")
  })

  test("clicking an incoming vehicle selects that vehicle", () => {
    const mockDispatch = jest.fn()

    const route: Route = routeFactory.build({
      id: "28",
      name: "28",
    })
    const timepoints = [
      { id: "MATPN", name: "MATPN Name" },
      { id: "WELLH", name: "WELLH Name" },
      { id: "MORTN", name: "MORTN Name" },
    ]
    const vehicle: Vehicle = vehicleFactory.build({
      id: "v1",
      label: "v1",
      runId: "run1",
      timestamp: 0,
      latitude: 0,
      longitude: 0,
      directionId: 1,
      routeId: "28",
      tripId: "trip",
      headsign: null,
      viaVariant: null,
      operatorId: "op1",
      operatorFirstName: "PATTI",
      operatorLastName: "SMITH",
      operatorLogonTime: new Date("2018-08-15T13:38:21.000Z"),
      bearing: 33,
      blockId: "block-1",
      previousVehicleId: "v2",
      scheduleAdherenceSecs: 0,
      isShuttle: false,
      isOverload: false,
      isOffCourse: false,
      isRevenue: true,
      layoverDepartureTime: null,
      dataDiscrepancies: [],
      stopStatus: {
        stopId: "stop",
        stopName: "stop",
      },
      timepointStatus: {
        timepointId: "MATPN",
        fractionUntilTimepoint: 0.5,
      },
      scheduledLocation: null,
      routeStatus: "pulling_out",
      endOfTripType: "another_trip",
      blockWaivers: [],
      crowding: null,
    })

    const wrapper = mount(
      <StateDispatchProvider state={initialState} dispatch={mockDispatch}>
        <RouteLadder
          route={route}
          timepoints={timepoints}
          vehiclesAndGhosts={[vehicle]}
          selectedVehicleId={undefined}
          deselectRoute={() => {}}
          reverseLadder={() => {}}
          toggleCrowding={() => {}}
          ladderDirections={{}}
          ladderCrowdingToggles={{}}
        />
      </StateDispatchProvider>
    )
    wrapper.find(".m-incoming-box__vehicle").simulate("click")

    expect(mockDispatch).toHaveBeenCalledWith(selectVehicle(vehicle))
  })
})
