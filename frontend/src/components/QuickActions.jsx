import {
  Bus,
  Users,
  Route,
  UserCog,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Add Bus",
      icon: <Bus size={28} />,
      color: "bg-blue-500",
      path: "/admin/buses",
    },
    {
      title: "Add Driver",
      icon: <UserCog size={28} />,
      color: "bg-green-500",
      path: "/admin/drivers",
    },
    {
      title: "Add Student",
      icon: <Users size={28} />,
      color: "bg-orange-500",
      path: "/admin/students",
    },
    {
      title: "Add Route",
      icon: <Route size={28} />,
      color: "bg-purple-500",
      path: "/admin/routes",
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.path)}
            className={`${item.color} text-white rounded-2xl p-6 hover:scale-105 transition duration-300`}
          >
            <div className="flex flex-col items-center gap-3">
              {item.icon}
              <span className="font-semibold">
                {item.title}
              </span>
            </div>
          </button>
        ))}

      </div>

    </div>
  );
}