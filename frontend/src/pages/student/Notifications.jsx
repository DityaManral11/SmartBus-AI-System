import {
  Bell,
  Bus,
  MapPinned,
  Clock,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  Trash2,
  RefreshCw,
  MailCheck,
  Info,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../services/api";

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        "{}"
    );
  } catch (error) {
    console.error(
      "Could not parse logged-in user:",
      error
    );

    return {};
  }
}

function formatNotificationTime(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getNotificationDesign(title = "", message = "") {
  const text = `${title} ${message}`.toLowerCase();

  if (
    text.includes("maintenance") ||
    text.includes("emergency") ||
    text.includes("alert") ||
    text.includes("cancel")
  ) {
    return {
      icon: AlertTriangle,
      gradient:
        "from-red-500 to-pink-500",
      border: "border-red-500",
      iconBackground: "bg-red-100",
      iconText: "text-red-600",
    };
  }

  if (
    text.includes("route") ||
    text.includes("location") ||
    text.includes("stop")
  ) {
    return {
      icon: MapPinned,
      gradient:
        "from-purple-600 to-pink-500",
      border: "border-purple-500",
      iconBackground: "bg-purple-100",
      iconText: "text-purple-600",
    };
  }

  if (
    text.includes("schedule") ||
    text.includes("pickup") ||
    text.includes("arrival") ||
    text.includes("departure") ||
    text.includes("timing")
  ) {
    return {
      icon: Clock,
      gradient:
        "from-orange-500 to-yellow-500",
      border: "border-orange-500",
      iconBackground: "bg-orange-100",
      iconText: "text-orange-600",
    };
  }

  if (
    text.includes("holiday") ||
    text.includes("calendar")
  ) {
    return {
      icon: CalendarDays,
      gradient:
        "from-green-500 to-emerald-500",
      border: "border-green-500",
      iconBackground: "bg-green-100",
      iconText: "text-green-600",
    };
  }

  if (
    text.includes("bus") ||
    text.includes("driver") ||
    text.includes("assigned")
  ) {
    return {
      icon: Bus,
      gradient:
        "from-blue-600 to-cyan-500",
      border: "border-blue-500",
      iconBackground: "bg-blue-100",
      iconText: "text-blue-600",
    };
  }

  return {
    icon: Info,
    gradient: "from-slate-600 to-slate-500",
    border: "border-cyan-500",
    iconBackground: "bg-cyan-100",
    iconText: "text-cyan-600",
  };
}

export default function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const currentUser = useMemo(
    () => getStoredUser(),
    []
  );

  const userId =
    currentUser.user_id ||
    currentUser.userId ||
    currentUser.id;

  const fetchNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          setNotifications([]);

          setError(
            "User information was not found. Please log in again."
          );

          return;
        }

        const response = await api.get(
          `/notifications/user/${userId}`
        );

        if (!response.data?.success) {
          setNotifications([]);

          setError(
            response.data?.message ||
              "Could not load notifications."
          );

          return;
        }

        setNotifications(
          Array.isArray(
            response.data.notifications
          )
            ? response.data.notifications
            : []
        );
      } catch (error) {
        console.error(
          "Fetch notifications error:",
          error
        );

        setNotifications([]);

        if (error.response?.status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else {
          setError(
            error.response?.data?.message ||
              "Unable to load notifications."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const totalNotifications =
    notifications.length;

  const readNotifications =
    notifications.filter(
      (notification) =>
        Boolean(Number(notification.is_read))
    ).length;

  const unreadNotifications =
    totalNotifications - readNotifications;

  const handleMarkAsRead = async (
    notification
  ) => {
    const isRead = Boolean(
      Number(notification.is_read)
    );

    if (isRead || updatingId === notification.id) {
      return;
    }

    try {
      setUpdatingId(notification.id);
      setError("");

      const response = await api.put(
        `/notifications/${notification.id}/read`
      );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Could not update notification."
        );

        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: 1,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Could not mark notification as read."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (
      !userId ||
      unreadNotifications === 0 ||
      markingAll
    ) {
      return;
    }

    try {
      setMarkingAll(true);
      setError("");

      const response = await api.put(
        `/notifications/user/${userId}/read-all`
      );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Could not update notifications."
        );

        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Could not mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (
    notificationId
  ) => {
    if (deletingId === notificationId) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this notification?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(notificationId);
      setError("");

      const response = await api.delete(
        `/notifications/${notificationId}`
      );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Could not delete notification."
        );

        return;
      }

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Could not delete notification."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Bell size={42} />

            <div>
              <h1 className="text-4xl font-bold">
                Notifications
              </h1>

              <p className="mt-2 text-blue-100">
                Stay updated with your latest bus
                notifications.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-60 transition font-semibold"
            >
              <RefreshCw
                size={19}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={
                markingAll ||
                unreadNotifications === 0
              }
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-60 transition font-semibold"
            >
              <MailCheck size={19} />

              {markingAll
                ? "Updating..."
                : "Mark All Read"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 flex items-start gap-4">
          <AlertTriangle
            className="text-red-600 shrink-0 mt-0.5"
            size={25}
          />

          <div className="flex-1">
            <h3 className="font-bold text-red-800">
              Notification Error
            </h3>

            <p className="mt-1 text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bell size={35} />

          <p className="mt-4 text-white/80">
            Total Notifications
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalNotifications}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <CheckCircle size={35} />

          <p className="mt-4 text-white/80">
            Read
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {readNotifications}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <AlertTriangle size={35} />

          <p className="mt-4 text-white/80">
            Unread
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {unreadNotifications}
          </h2>
        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Loading Notifications
          </h2>

          <p className="mt-2 text-slate-500">
            Fetching your latest updates...
          </p>
        </div>
      )}

      {/* Empty State */}

      {!loading &&
        notifications.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell
                size={38}
                className="text-blue-600"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              No Notifications Yet
            </h2>

            <p className="mt-2 text-slate-500 max-w-xl mx-auto">
              Bus assignments, schedule changes,
              route updates and transport alerts will
              appear here.
            </p>
          </div>
        )}

      {/* Notifications List */}

      {!loading &&
        notifications.length > 0 && (
          <div className="space-y-5">
            {notifications.map(
              (notification) => {
                const design =
                  getNotificationDesign(
                    notification.title,
                    notification.message
                  );

                const Icon = design.icon;

                const isRead = Boolean(
                  Number(notification.is_read)
                );

                const isUpdating =
                  updatingId === notification.id;

                const isDeleting =
                  deletingId === notification.id;

                return (
                  <div
                    key={notification.id}
                    onClick={() =>
                      handleMarkAsRead(notification)
                    }
                    className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-8 ${
                      design.border
                    } ${
                      !isRead
                        ? "ring-2 ring-blue-100 cursor-pointer"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                      <div className="flex items-start gap-5">
                        <div
                          className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-r ${design.gradient} text-white shadow-lg`}
                        >
                          <Icon size={30} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-800">
                              {notification.title ||
                                "Notification"}
                            </h2>

                            {!isRead && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                New
                              </span>
                            )}
                          </div>

                          <p className="text-slate-600 mt-2 leading-relaxed">
                            {notification.message}
                          </p>

                          <p className="text-sm text-gray-400 mt-3">
                            {formatNotificationTime(
                              notification.created_at
                            )}
                          </p>

                          {!isRead && (
                            <p className="mt-3 text-sm font-semibold text-blue-600">
                              {isUpdating
                                ? "Marking as read..."
                                : "Click to mark as read"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:pl-4">
                        <span
                          title={
                            isRead ? "Read" : "Unread"
                          }
                          className={`w-3 h-3 rounded-full ${
                            isRead
                              ? "bg-green-500"
                              : "bg-red-500 animate-pulse"
                          }`}
                        />

                        <button
                          type="button"
                          title="Delete notification"
                          disabled={isDeleting}
                          onClick={(event) => {
                            event.stopPropagation();

                            handleDeleteNotification(
                              notification.id
                            );
                          }}
                          className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                        >
                          {isDeleting ? (
                            <RefreshCw
                              size={20}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {/* Footer Notice */}

      <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex items-start gap-4">
        <CheckCircle className="text-green-600 mt-1 shrink-0" />

        <div>
          <h3 className="font-bold text-lg text-green-800">
            Notification Center
          </h3>

          <p className="text-gray-600 mt-2">
            You will receive updates related to bus
            timings, schedule changes, emergency
            alerts and important college transport
            announcements here.
          </p>
        </div>
      </div>
    </div>
  );
}