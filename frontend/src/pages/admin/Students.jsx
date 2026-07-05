import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Bus,
  MapPinned,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Students() {
  const [buses, setBuses] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  useEffect(() => {

    const savedBuses =
      JSON.parse(localStorage.getItem("buses")) || [];

    setBuses(savedBuses);

    const allPickupPoints = savedBuses.flatMap((bus) =>
      (bus.pickupPoints || "")
        .split(",")
        .map((point) => point.trim())
        .filter((point) => point !== "")
    );

    setPickupPoints([...new Set(allPickupPoints)]);

    setPickupPoints([...new Set(allPickupPoints)]);
    const points = [];

    savedBuses.forEach((bus) => {
      if (bus.pickupPoints) {
        bus.pickupPoints
          .split(",")
          .forEach((point) => points.push(point.trim()));
      }
    });

    setPickupPoints([...new Set(points)]);
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const studentList = users.filter(
      (user) => user.role === "student"
    );

    setStudents(studentList);


  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editEmail, setEditEmail] = useState(null);

  const handleEdit = (student) => {
    setNewStudent({
      name: student.name,
      email: student.email,
      phone: student.phone,
      rollNo: student.rollNo,
      semester: student.semester,
      bus: student.bus || "",
      pickup: student.pickup || "",
      password: student.password,
    });

    setEditEmail(student.email);
    setShowForm(true);
  };

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    rollNo: "",
    semester: "",
    bus: "",
    pickup: "",
    password: "",
  });

  const handleDelete = (email) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.filter(
      (user) => user.email !== email
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setStudents(
      updatedUsers.filter((user) => user.role === "student")
    );
  };

  const handleAddStudent = () => {
    if (
      !newStudent.name ||
      !newStudent.email ||
      !newStudent.phone ||
      !newStudent.rollNo ||
      !newStudent.semester ||
      !newStudent.password
    ) {
      alert("Please fill all fields.");
      return;
    }


    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (editEmail) {
      const updatedUsers = users.map((user) =>
        user.email === editEmail
          ? {
            ...newStudent,
            role: "student",
          }
          : user
      );



      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setStudents(updatedUsers.filter((u) => u.role === "student"));

      alert("Student Updated Successfully");

      setEditEmail(null);

    } else {
      users.push({
        id: Date.now(),
        ...newStudent,
        role: "student",
        status: "Present",
      });

      localStorage.setItem("users", JSON.stringify(users));
      setStudents(users.filter((u) => u.role === "student"));

      alert("Student Added Successfully");
    }

    setNewStudent({
      name: "",
      email: "",
      phone: "",
      rollNo: "",
      semester: "",
      bus: "",
      pickup: "",
      password: "",
    });

    setShowForm(false);
    setEditEmail(null);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div>

            <h1 className="text-4xl font-bold flex items-center gap-3">

              <GraduationCap size={38} />

              Students

            </h1>

            <p className="mt-2 text-blue-100">

              Manage all registered students.

            </p>

          </div>

          <button
            onClick={() => {
              setEditEmail(null);

              setNewStudent({
                name: "",
                email: "",
                phone: "",
                rollNo: "",
                semester: "",
                bus: "",
                pickup: "",
                password: "",
              });

              setShowForm(true);
            }}
            className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} />
              Add Student
            </div>
          </button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <GraduationCap size={34} />

          <p className="mt-4">Total Students</p>

          <h2 className="text-3xl font-bold mt-2">
            {students.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={34} />

          <p className="mt-4">Assigned Bus</p>

          <h2 className="text-3xl font-bold mt-2">
            {students.filter((s) => s.bus).length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <GraduationCap size={34} />

          <p className="mt-4">Active Students</p>

          <h2 className="text-3xl font-bold mt-2">
            {students.length}
          </h2>

        </div>

      </div>

      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            {editEmail ? "Edit Student" : "Add Student"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              placeholder="Full Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  name: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  email: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Phone"
              value={newStudent.phone}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  phone: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Roll No"
              value={newStudent.rollNo}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  rollNo: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Semester"
              value={newStudent.semester}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  semester: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Password"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  password: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            />

            <select
              value={newStudent.bus}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  bus: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            >
              <option value="">Select Bus</option>

              {buses.map((bus) => (
                <option
                  key={bus.busNo}
                  value={bus.busNo}
                >
                  {bus.busNo}
                </option>
              ))}
            </select>

            <select
              value={newStudent.pickup}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  pickup: e.target.value,
                })
              }
              className="border p-3 rounded-xl"
            >
              <option value="">Select Pickup Point</option>

              {pickupPoints.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>

          </div>


          <button
            onClick={handleAddStudent}
            className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            {editEmail ? "Update Student" : "Save Student"}
          </button>


        </div>
      )}

      {/* Search */}

      <div className="bg-white rounded-3xl shadow-xl p-5">

        <div className="relative">

          <Search
            className="absolute left-4 top-4 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 py-4 border rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none"
          />

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-5">Student</th>

                <th className="text-left p-5">Roll No</th>

                <th className="text-left p-5">Bus</th>

                <th className="text-left p-5">Pickup Point</th>

                <th className="text-left p-5">Status</th>

                <th className="text-center p-5">Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.map((student) => (

                <tr
                  key={student.email}
                  className="border-t hover:bg-slate-50 transition"
                >

                  <td className="p-5 font-semibold">

                    {student.name}

                  </td>

                  <td className="p-5">

                    {student.rollNo}

                  </td>

                  <td className="p-5">
                    {student.bus || "Not Assigned"}
                  </td>

                  <td className="p-5">

                    <div className="flex items-center gap-2">
                      <MapPinned size={16} />
                      {student.pickup || "--"}
                    </div>

                  </td>

                  <td className="p-5">

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                      Active
                    </span>

                  </td>

                  <td className="p-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => setViewStudent(student)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                      >

                        <Pencil size={18} />

                      </button>

                      <button
                        onClick={() => handleDelete(student.email)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {filteredStudents.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No students found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

          {viewStudent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

              <div className="bg-white rounded-3xl p-8 w-[450px] shadow-2xl">

                <h2 className="text-3xl font-bold mb-6 text-center">
                  Student Details
                </h2>

                <div className="space-y-3">

                  <p><b>Name:</b> {viewStudent.name}</p>

                  <p><b>Email:</b> {viewStudent.email}</p>

                  <p><b>Phone:</b> {viewStudent.phone}</p>

                  <p><b>Roll No:</b> {viewStudent.rollNo}</p>

                  <p><b>Semester:</b> {viewStudent.semester}</p>

                  <p><b>Bus:</b> {viewStudent.bus || "Not Assigned"}</p>

                  <p><b>Pickup:</b> {viewStudent.pickup || "Not Assigned"}</p>

                </div>

                <button
                  onClick={() => setViewStudent(null)}
                  className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl"
                >
                  Close
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );


}