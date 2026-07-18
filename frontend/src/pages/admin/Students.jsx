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
import api from "../../services/api";

const initialStudent = {
  full_name: "",
  email: "",
  phone: "",
  roll_number: "",
  semester: "",
  course: "",
  guardian_name: "",
  guardian_phone: "",
  password: "",
  confirm_password: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [newStudent, setNewStudent] = useState(initialStudent);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students");

      if (response.data?.success) {
        setStudents(response.data.students || []);
      } else {
        setError("Could not load students.");
      }
    } catch (error) {
      console.error("Fetch students error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddForm = () => {
    setEditingStudentId(null);
    setNewStudent(initialStudent);
    setShowForm(true);
    setError("");
  };

  const handleEdit = (student) => {
    setEditingStudentId(student.id);

    setNewStudent({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      roll_number: student.roll_number || "",
      semester: student.semester || "",
      course: student.course || "",
      guardian_name: student.guardian_name || "",
      guardian_phone: student.guardian_phone || "",
      password: "",
      confirm_password: "",
    });

    setShowForm(true);
    setError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewStudent((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = () => {
    if (
      !newStudent.full_name.trim() ||
      !newStudent.email.trim() ||
      !newStudent.phone.trim() ||
      !newStudent.roll_number.trim() ||
      !newStudent.semester
    ) {
      setError("Please fill all required fields.");
      return false;
    }

    if (!editingStudentId) {
      if (!newStudent.password || !newStudent.confirm_password) {
        setError("Password and confirm password are required.");
        return false;
      }

      if (newStudent.password !== newStudent.confirm_password) {
        setError("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const handleSaveStudent = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");

      if (editingStudentId) {
        await api.put(`/students/${editingStudentId}`, {
          full_name: newStudent.full_name.trim(),
          email: newStudent.email.trim(),
          phone: newStudent.phone.trim(),
          status: "active",
          roll_number: newStudent.roll_number.trim(),
          semester: newStudent.semester,
          course: newStudent.course.trim(),
          guardian_name: newStudent.guardian_name.trim(),
          guardian_phone: newStudent.guardian_phone.trim(),
        });

        alert("Student updated successfully");
      } else {
        await api.post("/auth/student/register", {
          full_name: newStudent.full_name.trim(),
          email: newStudent.email.trim(),
          phone: newStudent.phone.trim(),
          roll_number: newStudent.roll_number.trim(),
          semester: newStudent.semester,
          password: newStudent.password,
          confirm_password: newStudent.confirm_password,
        });

        alert("Student added successfully");
      }

      setShowForm(false);
      setEditingStudentId(null);
      setNewStudent(initialStudent);

      await fetchStudents();
    } catch (error) {
      console.error("Save student error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Delete ${student.full_name}? This will also delete the student's login account.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/students/${student.id}`);

      setStudents((previous) =>
        previous.filter((item) => item.id !== student.id)
      );

      if (viewStudent?.id === student.id) {
        setViewStudent(null);
      }

      alert("Student deleted successfully");
    } catch (error) {
      console.error("Delete student error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete student."
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase().trim();

    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.roll_number?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
  });

  const activeStudents = students.filter(
    (student) => student.status === "active"
  ).length;

  return (
    <div className="space-y-8">
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
            onClick={openAddForm}
            className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} />
              Add Student
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

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
          <h2 className="text-3xl font-bold mt-2">0</h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <GraduationCap size={34} />
          <p className="mt-4">Active Students</p>
          <h2 className="text-3xl font-bold mt-2">
            {activeStudents}
          </h2>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-5">
            {editingStudentId ? "Edit Student" : "Add Student"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="full_name"
              placeholder="Full Name *"
              value={newStudent.full_name}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={newStudent.email}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="phone"
              placeholder="Phone *"
              value={newStudent.phone}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="roll_number"
              placeholder="Roll Number *"
              value={newStudent.roll_number}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="semester"
              type="number"
              min="1"
              placeholder="Semester *"
              value={newStudent.semester}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="course"
              placeholder="Course"
              value={newStudent.course}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="guardian_name"
              placeholder="Guardian Name"
              value={newStudent.guardian_name}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            <input
              name="guardian_phone"
              placeholder="Guardian Phone"
              value={newStudent.guardian_phone}
              onChange={handleInputChange}
              className="border p-3 rounded-xl"
            />

            {!editingStudentId && (
              <>
                <input
                  name="password"
                  type="password"
                  placeholder="Password *"
                  value={newStudent.password}
                  onChange={handleInputChange}
                  className="border p-3 rounded-xl"
                />

                <input
                  name="confirm_password"
                  type="password"
                  placeholder="Confirm Password *"
                  value={newStudent.confirm_password}
                  onChange={handleInputChange}
                  className="border p-3 rounded-xl"
                />
              </>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSaveStudent}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingStudentId
                  ? "Update Student"
                  : "Save Student"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setEditingStudentId(null);
                setNewStudent(initialStudent);
                setError("");
              }}
              disabled={saving}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-4 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search by name, roll number or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-12 py-4 border rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-5">Student</th>
                <th className="text-left p-5">Roll No</th>
                <th className="text-left p-5">Course</th>
                <th className="text-left p-5">Semester</th>
                <th className="text-left p-5">Status</th>
                <th className="text-center p-5">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="p-5">
                      <p className="font-semibold">
                        {student.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.email}
                      </p>
                    </td>

                    <td className="p-5">
                      {student.roll_number}
                    </td>

                    <td className="p-5">
                      {student.course || "--"}
                    </td>

                    <td className="p-5">
                      {student.semester || "--"}
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {student.status || "inactive"}
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
                          onClick={() => handleDelete(student)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredStudents.length === 0 && (
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
        </div>
      </div>

      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Student Details
            </h2>

            <div className="space-y-3">
              <p>
                <b>Name:</b> {viewStudent.full_name}
              </p>
              <p>
                <b>Email:</b> {viewStudent.email}
              </p>
              <p>
                <b>Phone:</b> {viewStudent.phone || "--"}
              </p>
              <p>
                <b>Roll No:</b> {viewStudent.roll_number}
              </p>
              <p>
                <b>Semester:</b> {viewStudent.semester || "--"}
              </p>
              <p>
                <b>Course:</b> {viewStudent.course || "--"}
              </p>
              <p>
                <b>Guardian:</b>{" "}
                {viewStudent.guardian_name || "--"}
              </p>
              <p>
                <b>Guardian Phone:</b>{" "}
                {viewStudent.guardian_phone || "--"}
              </p>
              <p>
                <b>Status:</b> {viewStudent.status || "--"}
              </p>
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
  );
}