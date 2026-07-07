import {
  Bell,
  Bus,
  MapPinned,
  Clock,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Notifications() {

  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const schedules =
      JSON.parse(localStorage.getItem("schedules")) || [];

    setStudent(currentUser);

    const assignedBus = buses.find(
      (b) => b.busNo === currentUser.bus
    );

    setBus(assignedBus);

    const busSchedule = schedules.find(
      (s) => s.busNo === assignedBus?.busNo
    );

    setSchedule(busSchedule);

    const list = [];

    if (assignedBus) {

      list.push({
        id: 1,
        title: "Assigned Bus",
        message: `Your assigned bus is ${assignedBus.busNo}.`,
        time: "Today",
        icon: Bus,
        color: "from-blue-600 to-cyan-500",
        read: false,
      });

      list.push({
        id: 2,
        title: "Today's Pickup",
        message: `Pickup time is ${busSchedule?.departure || "N/A"}.`,
        time: "Today",
        icon: Clock,
        color: "from-orange-500 to-yellow-500",
        read: false,
      });

      list.push({
        id: 3,
        title: "Route",
        message: `Today's route is ${assignedBus.route}.`,
        time: "Today",
        icon: MapPinned,
        color: "from-purple-600 to-pink-500",
        read: true,
      });

      if (assignedBus.status === "Maintenance") {

        list.push({
          id: 4,
          title: "Bus Maintenance",
          message: "Your assigned bus is under maintenance.",
          time: "Today",
          icon: AlertTriangle,
          color: "from-red-500 to-pink-500",
          read: false,
        });

      }

      if (
        new Date().getDay() === 0 ||
        new Date().getDay() === 6
      ) {

        list.push({
          id: 5,
          title: "Holiday",
          message: "No bus service today.",
          time: "Today",
          icon: CalendarDays,
          color: "from-green-500 to-emerald-500",
          read: true,
        });

      }

    }

    setNotifications(list);

  }, []);
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <div className="flex items-center gap-4">

          <Bell size={42} />

          <div>

            <h1 className="text-4xl font-bold">
              Notifications
            </h1>

            <p className="mt-2 text-blue-100">
              Stay updated with your latest bus notifications.
            </p>

          </div>

        </div>

      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Bell size={35} />

          <p className="mt-4 text-white/80">
            Total Notifications
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {notifications.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <CheckCircle size={35} />

          <p className="mt-4 text-white/80">
            Read
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {notifications.filter(n => n.read).length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <AlertTriangle size={35} />

          <p className="mt-4 text-white/80">
            Unread
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {notifications.filter(n => !n.read).length}
          </h2>

        </div>

      </div>

      {/* Notifications List */}

      <div className="space-y-5">

        {notifications.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-8 border-cyan-500"
            >

              <div className="flex items-start justify-between">

                <div className="flex gap-5">

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${item.color} text-white shadow-lg`}
                  >
                    <Icon size={30} />
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-slate-800">
                      {item.title}
                    </h2>

                    <p className="text-slate-500 mt-2">
                      {item.message}
                    </p>

                    <p className="text-sm text-gray-400 mt-3">
                      {item.time}
                    </p>

                  </div>

                </div>

                <span
                  className={`w-3 h-3 rounded-full mt-2 ${item.read
                      ? "bg-green-500"
                      : "bg-red-500 animate-pulse"
                    }`}
                />

              </div>

            </div>

          );

        })}

      </div>

      {/* Footer Notice */}

      <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex items-start gap-4">

        <CheckCircle className="text-green-600 mt-1" />

        <div>

          <h3 className="font-bold text-lg">
            Notification Center
          </h3>

          <p className="text-gray-600 mt-2">
            You will receive updates related to bus timings,
            schedule changes, emergency alerts and important
            college transport announcements here.
          </p>

        </div>

      </div>

    </div>
  );
}