import React, { ReactElement, useContext } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { StateDispatchContext } from "../contexts/stateDispatchContext"
import {
  ladderIcon,
  lateIcon,
  mapIcon,
  questionMarkIcon,
  refreshIcon,
  searchIcon,
  swingIcon,
} from "../helpers/icon"
import { reload } from "../models/browser"
import {
  toggleNotificationDrawer,
  toggleSwingsView,
  toggleLateView,
  OpenView,
} from "../state"
import NotificationBellIcon from "./notificationBellIcon"
import featureIsEnabled from "../laboratoryFeatures"
import { displayHelp } from "../helpers/appCue"
import { openDrift } from "../helpers/drift"
import { tagManagerEvent } from "../helpers/googleTagManager"

interface Props {
  pickerContainerIsVisible: boolean
  openView: OpenView
  dispatcherFlag: boolean
}

const TabBar = ({
  pickerContainerIsVisible,
  openView,
  dispatcherFlag,
}: Props): ReactElement<HTMLDivElement> => {
  const location = useLocation()
  const [, dispatch] = useContext(StateDispatchContext)

  return (
    <div
      className={`m-tab-bar ${pickerContainerIsVisible ? "visible" : "hidden"}`}
    >
      <button className="m-tab-bar__logo" onClick={() => reload()}>
        {skateLogo}
      </button>
      <ul className="m-tab-bar__links">
        <li>
          <NavLink
            activeClassName="m-tab-bar__link--active"
            className="m-tab-bar__link"
            exact={true}
            title="Routes"
            to="/"
          >
            {ladderIcon("m-tab-bar__icon")}
          </NavLink>
        </li>
        <li>
          <NavLink
            activeClassName="m-tab-bar__link--active"
            className="m-tab-bar__link"
            exact={true}
            title="Shuttle Map"
            to="/shuttle-map"
          >
            {mapIcon("m-tab-bar__icon")}
          </NavLink>
        </li>
        <li>
          <NavLink
            activeClassName="m-tab-bar__link--active"
            className="m-tab-bar__link"
            title="Settings"
            to="/settings"
          >
            {settingsIcon}
          </NavLink>
        </li>
        <li>
          <NavLink
            activeClassName="m-tab-bar__link--active"
            className="m-tab-bar__link"
            title="Search"
            to="/search"
          >
            {searchIcon("m-tab-bar__icon")}
          </NavLink>
        </li>
        <li>
          {/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <a
            className={
              "m-tab-bar__swings m-tab-bar__link" +
              (openView === OpenView.Swings ? " m-tab-bar__link--active" : "")
            }
            onClick={() => {
              if (window.FS) {
                window.FS.event("Swings view toggled")
              }
              tagManagerEvent("swings_view_toggled")
              dispatch(toggleSwingsView())
            }}
          >
            {swingIcon("m-tab-bar__icon")}
          </a>
          {/* eslint-enable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        </li>
        {featureIsEnabled("late_view") || dispatcherFlag ? (
          <li>
            {/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <a
              className={
                "m-tab-bar__late_view m-tab-bar__link" +
                (openView === OpenView.Late ? " m-tab-bar__link--active" : "")
              }
              onClick={() => {
                if (window.FS) {
                  window.FS.event("Late view toggled")
                }
                tagManagerEvent("late_view_toggled")
                dispatch(toggleLateView())
              }}
              data-testid="late-view-icon"
            >
              {lateIcon("m-tab-bar__icon")}
            </a>
            {/* eslint-enable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          </li>
        ) : null}
      </ul>

      <div className="m-tab-bar__bottom-buttons">
        <button
          className="m-tab-bar__notifications"
          onClick={() => {
            dispatch(toggleNotificationDrawer())
          }}
        >
          <NotificationBellIcon extraClasses={["m-tab-bar__icon"]} />
        </button>
        <button className="m-tab-bar__drift" onClick={openDrift}>
          {driftIcon}
        </button>
        <button
          className="m-tab-bar__help"
          onClick={() => displayHelp(location)}
        >
          {questionMarkIcon("m-tab-bar__icon")}
        </button>
        <button className="m-tab-bar__refresh" onClick={() => reload()}>
          {refreshIcon("m-tab-bar__icon")}
        </button>
      </div>
    </div>
  )
}

const skateLogo = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 55.49 30.12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="m-tab-bar__icon"
      d="m16.35 19.85a5.28 5.28 0 0 1 1.32 3.46 5.73 5.73 0 0 1 -1 3.17 6.92 6.92 0 0 1 -2.81 2.41 10.13 10.13 0 0 1 -4.56.92 10.37 10.37 0 0 1 -4.3-.81 7.76 7.76 0 0 1 -2.8-2.08 10.1 10.1 0 0 1 -1.58-2.64l3.08-1.14a6.88 6.88 0 0 0 1.87 2.63 5.43 5.43 0 0 0 3.72 1.14 5.7 5.7 0 0 0 3.71-1.06 3.06 3.06 0 0 0 1.3-2.42c0-1.45-1-2.42-3.14-2.91l-3.7-.92a8.1 8.1 0 0 1 -4.37-2.43 5.57 5.57 0 0 1 -1.39-3.67 5.38 5.38 0 0 1 1.05-3.28 7 7 0 0 1 2.87-2.22 10 10 0 0 1 4.13-.81 8 8 0 0 1 4.91 1.4 7.88 7.88 0 0 1 2.73 3.79l-3 .85a13.84 13.84 0 0 0 -.66-1.23 4 4 0 0 0 -1.37-1.35 4.8 4.8 0 0 0 -2.61-.65 5.67 5.67 0 0 0 -3.35 1 2.74 2.74 0 0 0 -.4 4.36 5.88 5.88 0 0 0 2.8 1.39l3.25.8a7.93 7.93 0 0 1 4.3 2.3zm21.65-12.4h-4.17l-8.9 9.87h-.4v-17.17h-3.36v29.21h3.36v-7.66l2.58-2.78 7.89 10.44h3.94l-9.56-12.58zm16.67 15.67a6.09 6.09 0 0 1 -3.51 5.76 8.26 8.26 0 0 1 -3.63.78 8.39 8.39 0 0 1 -3.66-.78 6.08 6.08 0 0 1 -3.56-5.76 5.93 5.93 0 0 1 .9-3.3 6.05 6.05 0 0 1 2.43-2.16 5.21 5.21 0 0 1 -2.07-1.93 5.56 5.56 0 0 1 -.76-3 5.81 5.81 0 0 1 .87-3.26 5.46 5.46 0 0 1 2.39-2 9.14 9.14 0 0 1 6.87 0 5.35 5.35 0 0 1 2.37 2 5.8 5.8 0 0 1 .86 3.26 5.55 5.55 0 0 1 -.76 3 5.14 5.14 0 0 1 -2.08 1.92 6.15 6.15 0 0 1 2.44 2.16 6 6 0 0 1 .9 3.31zm-10.61-10.25a3.17 3.17 0 0 0 1 2.46 3.44 3.44 0 0 0 2.44 1 3.38 3.38 0 0 0 2.4-.94 3.23 3.23 0 0 0 1-2.44 3 3 0 0 0 -1-2.34 3.59 3.59 0 0 0 -2.45-.89 3.62 3.62 0 0 0 -2.38.84 2.88 2.88 0 0 0 -1.01 2.31zm7.27 10.13a3.92 3.92 0 0 0 -.52-2 4 4 0 0 0 -1.41-1.43 3.88 3.88 0 0 0 -3.88 0 3.93 3.93 0 0 0 -1.9 3.43 3.74 3.74 0 0 0 .52 2 3.79 3.79 0 0 0 1.41 1.4 3.89 3.89 0 0 0 2 .51 3.6 3.6 0 0 0 2.72-1.12 3.76 3.76 0 0 0 1.06-2.79z"
    />
  </svg>
)

const settingsIcon = (
  <svg
    width="21px"
    height="21px"
    viewBox="0 0 21 21"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="m-tab-bar__icon"
      d="M13.7143021,10.2857265 C13.7143021,8.39733144 12.1741217,6.85715103 10.2857265,6.85715103 C8.39733144,6.85715103 6.85715103,8.39733144 6.85715103,10.2857265 C6.85715103,12.1741217 8.39733144,13.7143021 10.2857265,13.7143021 C12.1741217,13.7143021 13.7143021,12.1741217 13.7143021,10.2857265 Z M20.5714531,8.82590338 L20.5714531,11.7991212 C20.5714531,12.0000143 20.4107386,12.241086 20.1964526,12.2812646 L17.7187711,12.6562651 C17.5714495,13.084837 17.410735,13.4866232 17.1964491,13.8750165 C17.6518068,14.5312673 18.1339502,15.1205537 18.6294865,15.723233 C18.7098437,15.8169831 18.7634152,15.937519 18.7634152,16.0580549 C18.7634152,16.1785907 18.7232366,16.2723408 18.6428794,16.3660909 C18.3214504,16.7946629 16.5134125,18.7634152 16.0580549,18.7634152 C15.937519,18.7634152 15.8169831,18.7098437 15.7098402,18.6428794 L13.8616237,17.1964491 C13.4732303,17.3973422 13.0580513,17.5714495 12.6428722,17.7053782 C12.5491221,18.5223435 12.4687649,19.3928803 12.2544789,20.1964526 C12.2009074,20.4107386 12.0134072,20.5714531 11.7723355,20.5714531 L8.79911763,20.5714531 C8.55804592,20.5714531 8.34375995,20.3973457 8.3169742,20.1696669 L7.94197375,17.7053782 C7.52679469,17.5714495 7.12500849,17.410735 6.73661517,17.2098419 L4.84822007,18.6428794 C4.75446995,18.7232366 4.6339341,18.7634152 4.51339824,18.7634152 C4.39286238,18.7634152 4.27232652,18.7098437 4.17857641,18.6160936 C3.46875414,17.9732357 2.53125302,17.1428776 1.96875235,16.3660909 C1.90178798,16.2723408 1.87500224,16.1651978 1.87500224,16.0580549 C1.87500224,15.937519 1.91518085,15.8437689 1.98214522,15.7500188 C2.43750291,15.1339466 2.93303921,14.5446602 3.3883969,13.9151952 C3.16071805,13.4866232 2.97321783,13.0446584 2.8392891,12.5893007 L0.38839332,12.2276931 C0.160714477,12.1875145 0,11.9732286 0,11.7455497 L0,8.77233189 C0,8.57143879 0.160714477,8.33036707 0.361607574,8.29018845 L2.85268197,7.91518801 C2.9866107,7.48661607 3.16071805,7.08482987 3.37500402,6.68304368 C2.91964634,6.04018577 2.43750291,5.43750648 1.9419666,4.83482719 C1.86160936,4.74107708 1.80803787,4.6339341 1.80803787,4.51339824 C1.80803787,4.39286238 1.86160936,4.29911227 1.92857373,4.20536216 C2.25000268,3.76339734 4.05804055,1.80803787 4.51339824,1.80803787 C4.6339341,1.80803787 4.75446995,1.86160936 4.86161294,1.9419666 L6.70982943,3.37500402 C7.09822275,3.17411093 7.51340181,3 7.92858088,2.86607485 C8.02233099,2.04910959 8.10268823,1.17857283 8.3169742,0.375000447 C8.37054569,0.160714477 8.55804592,0 8.79911763,0 L11.7723355,0 C12.0134072,0 12.2276931,0.17410735 12.2544789,0.401786193 L12.6294793,2.86607485 C13.0446584,3 13.4464446,3.16071805 13.8348379,3.36161115 L15.7366259,1.92857373 C15.8169831,1.84821649 15.937519,1.80803787 16.0580549,1.80803787 C16.1785907,1.80803787 16.2991266,1.86160936 16.3928767,1.9419666 C17.102699,2.59821738 18.0402001,3.42857552 18.6027007,4.21875503 C18.6696651,4.29911227 18.6964509,4.40625525 18.6964509,4.51339824 C18.6964509,4.6339341 18.6562722,4.72768421 18.5893079,4.82143432 C18.1339502,5.43750648 17.6384139,6.0267929 17.1830562,6.65625793 C17.410735,7.08482987 17.5982353,7.52679469 17.732164,7.9687595 L20.1830598,8.34375995 C20.4107386,8.38393857 20.5714531,8.59822454 20.5714531,8.82590338 Z"
    />
  </svg>
)

const driftIcon = (
  <svg
    width="25"
    height="23"
    viewBox="0 0 25 23"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="m-tab-bar__icon"
      d="M24.516 9.953C24.516 4.453 19.04 0 12.258 0 5.476 0 0 4.452 0 9.953c0 3.318 1.986 6.24 5.05 8.053-.34 2.552-1.815 4.055-1.844 4.084-.14.14-.17.368-.113.567a.524.524 0 0 0 .482.312c2.95 0 5.335-1.93 6.612-3.206.652.086 1.362.142 2.07.142 6.783 0 12.26-4.452 12.26-9.953z"
    />
  </svg>
)

export default TabBar
