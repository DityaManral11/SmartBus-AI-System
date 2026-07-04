import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  MapPinned,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Students() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [assignedBus, setAssignedBus] = useState(null);


  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || null;

    console.log("Current User:", currentUser);

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    console.log("All Buses:", buses);

    const assignedBus = buses.find(
      (b) => b.driver === currentUser.email
    );

    setAssignedBus(assignedBus);

    console.log("Assigned Bus:", assignedBus);

    if (!assignedBus) {
      setStudents([]);
      return;
    }

    const busStudents = users.filter(
      (u) =>
        u.role === "student" &&
        u.bus === assignedBus.busNo
    );

    console.log("Bus Students:", busStudents);

    setStudents(busStudents);
  }, []);

  const toggleAttendance = (email) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((user) => {
      if (user.email === email) {
        return {
          ...user,
          status: user.status === "Present" ? "Absent" : "Present",
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setStudents(
      updatedUsers.filter(
        (u) =>
          u.role === "student" &&
          u.bus === assignedBus.busNo
      )
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  console.log("Students State:", students);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Users size={38} />
          Students
        </h1>

        <p className="mt-3 text-blue-100">
          View students assigned to your bus.
        </p>

      </div>

      {/* Search */}

      <div className="bg-white rounded-3xl shadow-xl p-5">

        <div className="relative">

          <Search
            className="absolute left-4 top-4 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

        </div>

      </div>

      {/* Student Cards */}

      <div className="grid lg:grid-cols-2 gap-6">

        {filteredStudents.map((student) => (

          <div
            key={student.id}
            className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition"
          >

            <div className="flex justify-between items-start">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">

                  {student.name.charAt(0)}

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    {student.name}
                  </h2>

                  <p className="text-gray-500">
                    {student.rollNo}
                  </p>

                </div>

              </div>

              <button
                onClick={() => toggleAttendance(student.email)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition ${student.status === "Present"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {student.status === "Present" ? (
                  <>
                    <CheckCircle size={16} />
                    Present
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Absent
                  </>
                )}
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <div className="flex items-center gap-3">

                <MapPinned className="text-blue-600" size={18} />

                <span>{student.pickup}</span>

              </div>

              <div className="flex items-center gap-3">

                <Phone className="text-green-600" size={18} />

                <span>{student.phone}</span>

              </div>

            </div>

            <button className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-[1.02] transition">

              Call Student

            </button>

          </div>

        ))}

      </div>

    </div>
  );
}