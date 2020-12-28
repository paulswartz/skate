import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  NotificationsContext,
  otherNotificationReadState,
} from "../contexts/notificationsContext"
import {
  openVPPForNotification,
  StateDispatchContext,
} from "../contexts/stateDispatchContext"
import { ellipsisIcon } from "../helpers/icon"
import useCurrentTime from "../hooks/useCurrentTime"
import {
  markAllAsRead,
  toggleReadState,
} from "../hooks/useNotificationsReducer"
import { Notification } from "../realtime.d"
import { closeNotificationDrawer } from "../state"
import CloseButton from "./closeButton"
import NotificationBellIcon from "./notificationBellIcon"
import { NotificationContent } from "./notificationContent"

const NotificationDrawer = () => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const { rememberScrollPosition, scrollPosition } = useContext(
    NotificationsContext
  )

  const [isInitialRender, setIsInitialRender] = useState<boolean>(true)

  useLayoutEffect(() => {
    const restoreScrollPosition = isInitialRender
    setIsInitialRender(false)

    if (restoreScrollPosition && elementRef) {
      const element = elementRef.current
      if (element) {
        element.scrollTop = scrollPosition
      }
    }

    return () => {
      rememberScrollPosition(elementRef.current!.scrollTop)
    }
  }, [])

  return (
    <div className="m-notification-drawer" ref={elementRef}>
      <TitleBar />
      <div className="m-notification-drawer__content">
        <Content />
      </div>
    </div>
  )
}

const TitleBar = () => {
  const [, dispatch] = useContext(StateDispatchContext)
  return (
    <div className="m-notification-drawer__title-bar">
      <NotificationBellIcon />
      <div className="m-notification-drawer__title">Notifications</div>
      <CloseButton
        onClick={() => {
          dispatch(closeNotificationDrawer())
        }}
      />
    </div>
  )
}

const Content = () => {
  const { notifications } = useContext(NotificationsContext)
  const notificationsDispatch = useContext(NotificationsContext).dispatch

  const currentTime = useCurrentTime()

  const [, stateDispatch] = useContext(StateDispatchContext)

  const openVPPForCurrentVehicle = (notification: Notification) => {
    openVPPForNotification(notification, stateDispatch, notificationsDispatch)
  }

  if (notifications.length === 0) {
    return <EmptyMessage />
  }

  const unreadNotificationsCount = notifications.filter(
    (notification) => notification.state === "unread"
  ).length

  return (
    <div className="m-notification-drawer__cards">
      <div className="m-notification-drawer__header">
        <span className="m-notification-drawer__n-unread">
          {unreadNotificationsCount} new
        </span>
        <a
          className="m-notification-drawer__mark-all-read-link"
          onClick={() => notificationsDispatch(markAllAsRead())}
        >
          Mark all as read
        </a>
      </div>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          currentTime={currentTime}
          openVPPForCurrentVehicle={openVPPForCurrentVehicle}
        />
      ))}
    </div>
  )
}

const EmptyMessage = () => (
  <>
    <p>You have no notifications currently.</p>
    <p>
      Here you'll be notified about events like accidents and ghost vehicles on
      any bus routes you have selected on the Route Ladders page.
    </p>
  </>
)

const EllipsisSubmenu = ({
  notification,
  setShowSubmenu,
}: {
  notification: Notification
  setShowSubmenu: Dispatch<SetStateAction<boolean>>
}) => {
  const { dispatch } = useContext(NotificationsContext)
  const otherReadState = otherNotificationReadState(notification.state)
  return (
    <div
      className="m-notification-drawer__submenu"
      onClick={(event) => event.stopPropagation()}
    >
      <a
        onClick={(event) => {
          event.stopPropagation()
          dispatch(toggleReadState(notification))
          setShowSubmenu(false)
        }}
        className={`m-notification-drawer__submenu-mark-${otherReadState}`}
      >
        mark as {otherReadState}
      </a>
    </div>
  )
}

const NotificationCard = ({
  notification,
  currentTime,
  openVPPForCurrentVehicle,
}: {
  notification: Notification
  currentTime: Date
  openVPPForCurrentVehicle: (notification: Notification) => void
}) => {
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false)
  const toggleShowSubmenu = () => setShowSubmenu(!showSubmenu)

  return (
    <button
      className={`m-notification-drawer__card m-notification-drawer__card--${notification.state}`}
      onClick={() => openVPPForCurrentVehicle(notification)}
    >
      <NotificationContent
        notification={notification}
        currentTime={currentTime}
      />
      {showSubmenu && (
        <EllipsisSubmenu
          notification={notification}
          setShowSubmenu={setShowSubmenu}
        />
      )}
      <a
        className="m-notification-drawer__submenu-icon-anchor"
        onClick={(event) => {
          event.stopPropagation()
          toggleShowSubmenu()
        }}
      >
        {ellipsisIcon("m-notification-drawer__submenu-icon")}
      </a>
    </button>
  )
}

export default NotificationDrawer
