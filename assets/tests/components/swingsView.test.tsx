import { mount } from "enzyme"
import React from "react"
import { render } from "@testing-library/react"
import renderer from "react-test-renderer"
import ghostFactory from "../factories/ghost"
import vehicleFactory from "../factories/vehicle"
import routeFactory from "../factories/route"
import swingFactory from "../factories/swing"
import SwingsView from "../../src/components/swingsView"
import { RoutesProvider } from "../../src/contexts/routesContext"
import { StateDispatchProvider } from "../../src/contexts/stateDispatchContext"
import useSwings from "../../src/hooks/useSwings"
import useVehiclesForRunIds from "../../src/hooks/useVehiclesForRunIds"
import useVehiclesForBlockIds from "../../src/hooks/useVehiclesForBlockIds"
import { Route, Swing } from "../../src/schedule"
import { initialState, selectVehicle, toggleSwingsView } from "../../src/state"
import { Vehicle, Ghost, VehicleOrGhost } from "../../src/realtime"
import * as dateTime from "../../src/util/dateTime"
import { runIdToLabel } from "../../src/helpers/vehicleLabel"
import userEvent from "@testing-library/user-event"
import { tagManagerEvent } from "../../src/helpers/googleTagManager"

jest.mock("../../src/hooks/useSwings", () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock("../../src/hooks/useVehiclesForRunIds", () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock("../../src/hooks/useVehiclesForBlockIds", () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock("../../src/helpers/googleTagManager", () => ({
  __esModule: true,
  tagManagerEvent: jest.fn(),
}))

jest.spyOn(dateTime, "now").mockImplementation(() => {
  return new Date(18000 * 1000)
})

const vehicle: Vehicle = vehicleFactory.build({
  runId: "123-456",
  blockId: "A12-34",
})

const ghost: Ghost = ghostFactory.build({ runId: "124-456" })

const routes: Route[] = [
  routeFactory.build({
    id: "1",
    name: "Name 1",
    directionNames: {
      0: "Someplace",
      1: "Some Otherplace",
    },
  }),
  routeFactory.build({
    id: "2",
    name: "Name 3",
    directionNames: {
      0: "Someplace",
      1: "Some Otherplace",
    },
  }),
  routeFactory.build({
    id: "3",
    name: "Name 3",
    directionNames: {
      0: "Someplace",
      1: "Some Otherplace",
    },
  }),
]

describe("SwingsView", () => {
  test("renders loading message", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce(() => null)
    const tree = renderer
      .create(
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  test("omits swings more than 15 minutes in the past", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 18000 - 900 }),
    ])

    const tree = renderer
      .create(
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  test("includes swings less than 15 minutes in the past", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 18000 - 900 + 1 }),
    ])

    const tree = renderer
      .create(
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  test("can click to show past swings", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build(),
    ])

    const wrapper = mount(
      <RoutesProvider routes={routes}>
        <SwingsView />
      </RoutesProvider>
    )

    wrapper.find(".m-swings-view__show-past").first().simulate("click")

    expect(wrapper.find(".m-swings-view__table-row-inactive").length).toEqual(1)
  })

  test("can hide past swings after showing them", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build(),
    ])

    const wrapper = mount(
      <RoutesProvider routes={routes}>
        <SwingsView />
      </RoutesProvider>
    )

    wrapper.find(".m-swings-view__show-past").first().simulate("click")
    wrapper.find(".m-swings-view__show-past").first().simulate("click")

    expect(wrapper.find(".m-swings-view__table-row-inactive").length).toEqual(0)
  })

  test("renders future swings, active and inactive", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 19000 }),
      swingFactory.build({
        blockId: "B12-34",
        fromRouteId: "2",
        fromRunId: "124-456",
        fromTripId: "1235",
        toRouteId: "2",
        toRunId: "124-789",
        toTripId: "5679",
        time: 20000,
      }),
      swingFactory.build({
        blockId: "C12-34",
        fromRouteId: "3",
        fromRunId: "125-456",
        fromTripId: "1236",
        toRouteId: "3",
        toRunId: "125-789",
        toTripId: "5680",
        time: 21000,
      }),
    ])
    ;(useVehiclesForRunIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle, ghost]
    )
    ;(useVehiclesForBlockIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )

    const tree = renderer
      .create(
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  test("ignores vehicles without run ID (for linking to VPP)", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 19000 }),
    ])
    ;(useVehiclesForRunIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [{ ...vehicle, runId: null }]
    )
    ;(useVehiclesForBlockIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [{ ...vehicle, runId: null }]
    )

    const tree = renderer
      .create(
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  test("opens VPP when clicking an active swing-off and sends Fullstory event", async () => {
    const originalFS = window.FS
    const originalUsername = window.username
    window.FS = { event: jest.fn(), identify: jest.fn() }
    window.username = "username"

    afterEach(() => {
      window.FS = originalFS
      window.username = originalUsername
    })
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 19000 }),
    ])
    ;(useVehiclesForRunIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )
    ;(useVehiclesForBlockIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )

    const dispatch = jest.fn()
    const user = userEvent.setup()
    const result = render(
      <StateDispatchProvider state={initialState} dispatch={dispatch}>
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      </StateDispatchProvider>
    )

    await user.click(result.getByText(runIdToLabel(vehicle.runId)))
    expect(dispatch).toHaveBeenCalledWith(selectVehicle(vehicle))
    expect(window.FS!.event).toHaveBeenCalledWith(
      "Clicked on swing-off from swings view"
    )
    expect(tagManagerEvent).toHaveBeenCalledWith("clicked_swing_off")
  })

  test("opens VPP when clicking an active swing-on and sends Fullstory event", async () => {
    const originalFS = window.FS
    const originalUsername = window.username
    window.FS = { event: jest.fn(), identify: jest.fn() }
    window.username = "username"

    afterEach(() => {
      window.FS = originalFS
      window.username = originalUsername
    })
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({
        fromRunId: "123-789",
        toRunId: "123-456",
        time: 19000,
      }),
    ])
    ;(useVehiclesForRunIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )
    ;(useVehiclesForBlockIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )

    const dispatch = jest.fn()
    const user = userEvent.setup()
    const result = render(
      <StateDispatchProvider state={initialState} dispatch={dispatch}>
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      </StateDispatchProvider>
    )

    await user.click(result.getByText(runIdToLabel(vehicle.runId)))
    expect(dispatch).toHaveBeenCalledWith(selectVehicle(vehicle))
    expect(window.FS!.event).toHaveBeenCalledWith(
      "Clicked on swing-on from swings view"
    )
    expect(tagManagerEvent).toHaveBeenCalledWith("clicked_swing_on")
  })

  test("links to both swing-on and swing-off if both are active", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 19000 }),
    ])

    const vehicle2 = vehicleFactory.build({ runId: "123-789" })
    ;(useVehiclesForRunIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle, vehicle2]
    )
    ;(useVehiclesForBlockIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )

    const tree = renderer.create(
      <StateDispatchProvider state={initialState} dispatch={jest.fn()}>
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      </StateDispatchProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test("can close the swings view", () => {
    ;(useSwings as jest.Mock).mockImplementationOnce((): Swing[] => [
      swingFactory.build({ time: 19000 }),
    ])
    ;(useVehiclesForRunIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )
    ;(useVehiclesForBlockIds as jest.Mock).mockImplementationOnce(
      (): VehicleOrGhost[] => [vehicle]
    )

    const dispatch = jest.fn()
    const wrapper = mount(
      <StateDispatchProvider state={initialState} dispatch={dispatch}>
        <RoutesProvider routes={routes}>
          <SwingsView />
        </RoutesProvider>
      </StateDispatchProvider>
    )

    wrapper.find(".m-close-button").first().simulate("click")
    expect(dispatch).toHaveBeenCalledWith(toggleSwingsView())
  })
})
