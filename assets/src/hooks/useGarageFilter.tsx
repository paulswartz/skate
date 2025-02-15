import React from "react"
import { useContext, useState } from "react"
import { Route, GarageName } from "../schedule.d"
import { flatten, uniq } from "../helpers/array"
import {
  collapseIcon,
  expandIcon,
  toggleOnIcon,
  toggleOffIcon,
} from "../helpers/icon"
import { tagManagerEvent } from "../helpers/googleTagManager"
import { StateDispatchContext } from "../contexts/stateDispatchContext"
import { toggleShowGaragesFilter } from "../state"

export interface GarageFilterData {
  filteredGarages: GarageName[]
  allGarages: GarageName[]
  toggleGarage: (garage: GarageName) => void
}

export const filterRoutesByGarage = (
  allRoutes: Route[],
  { filteredGarages }: GarageFilterData
): Route[] => {
  if (filteredGarages.length === 0) {
    return allRoutes
  } else {
    return allRoutes.filter(
      (route) =>
        route.garages.find((garage) => filteredGarages.includes(garage)) !==
        undefined
    )
  }
}

export const useGarageFilter = (routes: Route[] | null): GarageFilterData => {
  const [filteredGarages, setFilteredGarages] = useState<GarageName[]>([])

  const toggleGarage = (garage: GarageName): void => {
    if (filteredGarages.includes(garage)) {
      setFilteredGarages(
        filteredGarages.filter((filteredGarage) => filteredGarage !== garage)
      )
    } else {
      setFilteredGarages([...filteredGarages, garage])
    }
  }

  const allGarages = uniq(
    flatten((routes || []).map((route) => route.garages))
  ).sort()

  return {
    filteredGarages,
    allGarages,
    toggleGarage,
  }
}

export const GarageFilter = ({
  filteredGarages,
  allGarages,
  toggleGarage,
}: GarageFilterData) => {
  const [{ showGaragesFilter }, dispatch] = useContext(StateDispatchContext)

  const sortedGarages = allGarages.sort((a, b) => a.localeCompare(b))

  const toggleVisibility = () => dispatch(toggleShowGaragesFilter())

  return (
    <div className="m-garage-filter">
      <button
        className="m-garage-filter__show-hide-button"
        title="Toggle Garage Filter"
        onClick={toggleVisibility}
      >
        <div className="m-garage-filter__header">Filter garages</div>
        <div className="m-garage-filter__show-hide-icon">
          {showGaragesFilter ? collapseIcon() : expandIcon()}
        </div>
      </button>
      {showGaragesFilter ? (
        <ul className="m-garage-filter__garages">
          {sortedGarages.map((garage) => (
            <li key={garage} className="m-garage-filter__garage">
              <button
                title={"Toggle Garage: " + garage}
                onClick={() => {
                  if (!filteredGarages.includes(garage) && window.FS) {
                    window.FS.event("User filtered routes by garage")
                  }
                  if (!filteredGarages.includes(garage)) {
                    tagManagerEvent("filtered_routes_by_garage")
                  }
                  toggleGarage(garage)
                }}
                className="m-garage-filter__button"
              >
                {garage}
                {filteredGarages.includes(garage)
                  ? toggleOnIcon()
                  : toggleOffIcon()}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
