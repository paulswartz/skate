import {
  makeMockOneShotChannel,
  makeMockSocket,
} from "../testHelpers/socketHelpers"
import vehicleDataFactory from "../factories/vehicle_data"
import { renderHook } from "@testing-library/react-hooks"
import useVehicleForId from "../../src/hooks/useVehicleForId"

describe("useVehicleForId", () => {
  test("parses vehicle data from channel", () => {
    const vehicleData = vehicleDataFactory.build()
    const mockSocket = makeMockSocket()
    const mockChannel = makeMockOneShotChannel(vehicleData)
    mockSocket.channel.mockImplementationOnce(() => mockChannel)

    const { result } = renderHook(({ id }) => useVehicleForId(mockSocket, id), {
      initialProps: { id: vehicleData.id },
    })

    expect(result.current).toMatchObject({ id: vehicleData.id })
  })
})
