import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Bus,
  MapPinned,
  X,
  LoaderCircle,
  Unlink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [buses, setBuses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [search, setSearch] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [newStudent, setNewStudent] = useState(initialStudent);

  const [showBusModal, setShowBusModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busSaving, setBusSaving] = useState(false);

  const [error, setError] = useState("");
  const [busError, setBusError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsResponse, busesResponse, assignmentsResponse] =
        await Promise.all([
          api.get("/students"),
          api.get("/buses"),
          api.get("/student-bus"),
        ]);

      if (studentsResponse.data?.success) {
        setStudents(studentsResponse.data.students || []);
      } else {
        setStudents(
          Array.isArray(studentsResponse.data)
            ? studentsResponse.data
            : studentsResponse.data?.students || []
        );
      }

      if (busesResponse.data?.success) {
        setBuses(busesResponse.data.buses || []);
      } else {
        setBuses(
          Array.isArray(busesResponse.data)
            ? busesResponse.data
            : busesResponse.data?.buses || []
        );
      }

      if (assignmentsResponse.data?.success) {
        setAssignments(assignmentsResponse.data.assignments || []);
      } else {
        setAssignments(
          Array.isArray(assignmentsResponse.data)
            ? assignmentsResponse.data
            : assignmentsResponse.data?.assignments || []
        );
      }
    } catch (error) {
      console.error("Fetch students page data error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load students, buses or assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const assignmentByStudentId = useMemo(() => {
    const map = new Map();

    assignments.forEach((assignment) => {
      map.set(Number(assignment.student_id), assignment);
    });

    return map;
  }, [assignments]);

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

      if (
        newStudent.password.length < 6 ||
        newStudent.password.length > 8
      ) {
        setError("Password must be between 6 and 8 characters.");
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

        setSuccessMessage("Student updated successfully.");
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

        setSuccessMessage("Student added successfully.");
      }

      setShowForm(false);
      setEditingStudentId(null);
      setNewStudent(initialStudent);

      await fetchData();
    } catch (error) {
      console.error("Save student error:", error);

      setError(
        error.response?.data?.message || "Unable to save student."
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

      setSuccessMessage("Student deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Delete student error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete student."
      );
    }
  };

  const openBusModal = (student) => {
    const currentAssignment = assignmentByStudentId.get(
      Number(student.id)
    );

    setSelectedStudent(student);
    setSelectedBusId(
      currentAssignment ? String(currentAssignment.bus_id) : ""
    );
    setBusError("");
    setShowBusModal(true);
  };

  const closeBusModal = () => {
    if (busSaving) return;

    setShowBusModal(false);
    setSelectedStudent(null);
    setSelectedBusId("");
    setBusError("");
  };

  const handleBusAssignment = async (event) => {
    event.preventDefault();

    if (!selectedStudent || !selectedBusId) {
      setBusError("Please select a bus.");
      return;
    }

    const currentAssignment = assignmentByStudentId.get(
      Number(selectedStudent.id)
    );

    try {
      setBusSaving(true);
      setBusError("");

      if (currentAssignment) {
        await api.put(
          `/student-bus/${currentAssignment.assignment_id}`,
          {
            bus_id: Number(selectedBusId),
            pickup_stop_id:
              currentAssignment.pickup_stop_id || null,
          }
        );

        setSuccessMessage(
          "Student bus assignment updated successfully."
        );
      } else {
        await api.post("/student-bus", {
          student_id: Number(selectedStudent.id),
          bus_id: Number(selectedBusId),
          pickup_stop_id: null,
        });

        setSuccessMessage(
          "Student assigned to bus successfully."
        );
      }

      closeBusModal();
      await fetchData();
    } catch (error) {
      console.error("Student bus assignment error:", error);

      setBusError(
        error.response?.data?.message ||
          "Unable to assign bus to student."
      );
    } finally {
      setBusSaving(false);
    }
  };

  const handleRemoveBus = async (student) => {
    const currentAssignment = assignmentByStudentId.get(
      Number(student.id)
    );

    if (!currentAssignment) return;

    const confirmed = window.confirm(
      `Remove ${student.full_name} from ${currentAssignment.bus_number}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(
        `/student-bus/${currentAssignment.assignment_id}`
      );

      setSuccessMessage(
        "Student removed from bus successfully."
      );

      await fetchData();
    } catch (error) {
      console.error("Remove student bus error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to remove student from bus."
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase().trim();
    const assignment = assignmentByStudentId.get(
      Number(student.id)
    );

    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.roll_number?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.course?.toLowerCase().includes(query) ||
      assignment?.bus_number?.toLowerCase().includes(query) ||
      assignment?.bus_name?.toLowerCase().includes(query)
    );
  });

  const activeStudents = students.filter(
    (student) => student.status === "active"
  ).length;

  const assignedStudents = assignments.length;

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
              Manage students and assign buses.
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

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {successMessage}
        </div>
      )}

      {error && !showForm && (
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
          <h2 className="text-3xl font-bold mt-2">
            {assignedStudents}
          </h2>
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

          {error && (
            <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

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
                  minLength={6}
                  maxLength={8}
                  placeholder="Password (6-8 characters) *"
                  value={newStudent.password}
                  onChange={handleInputChange}
                  className="border p-3 rounded-xl"
                />

                <input
                  name="confirm_password"
                  type="password"
                  minLength={6}
                  maxLength={8}
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
            placeholder="Search by name, roll number, email or assigned bus..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-12 py-4 border rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-5">Student</th>
                <th className="text-left p-5">Roll No</th>
                <th className="text-left p-5">Course</th>
                <th className="text-left p-5">Semester</th>
                <th className="text-left p-5">Assigned Bus</th>
                <th className="text-left p-5">Status</th>
                <th className="text-center p-5">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const assignment = assignmentByStudentId.get(
                    Number(student.id)
                  );

                  return (
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
                        {assignment ? (
                          <div>
                            <p className="flex items-center gap-2 font-semibold text-slate-800">
                              <MapPinned
                                size={17}
                                className="text-cyan-600"
                              />
                              {assignment.bus_name ||
                                assignment.bus_number}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {assignment.bus_number}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            Not Assigned
                          </span>
                        )}
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
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openBusModal(student)}
                            className="p-2 rounded-lg bg-cyan-100 text-cyan-700 hover:bg-cyan-600 hover:text-white transition"
                            title={
                              assignment
                                ? "Change assigned bus"
                                : "Assign bus"
                            }
                          >
                            <Bus size={18} />
                          </button>

                          {assignment && (
                            <button
                              onClick={() =>
                                handleRemoveBus(student)
                              }
                              className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white transition"
                              title="Remove assigned bus"
                            >
                              <Unlink size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => setViewStudent(student)}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                            title="View student"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                            title="Edit student"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(student)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                            title="Delete student"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
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
                <b>Semester:</b>{" "}
                {viewStudent.semester || "--"}
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
              <p>
                <b>Assigned Bus:</b>{" "}
                {assignmentByStudentId.get(
                  Number(viewStudent.id)
                )?.bus_number || "Not Assigned"}
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

      {showBusModal && selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBusModal();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {assignmentByStudentId.get(
                    Number(selectedStudent.id)
                  )
                    ? "Change Assigned Bus"
                    : "Assign Bus"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedStudent.full_name} •{" "}
                  {selectedStudent.roll_number}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBusModal}
                disabled={busSaving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            {busError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {busError}
              </div>
            )}

            <form
              onSubmit={handleBusAssignment}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="bus_id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Select Bus
                </label>

                <select
                  id="bus_id"
                  value={selectedBusId}
                  onChange={(event) => {
                    setSelectedBusId(event.target.value);
                    setBusError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  required
                >
                  <option value="">Choose a bus</option>

                  {buses.map((busItem) => (
                    <option
                      key={busItem.id || busItem.bus_id}
                      value={busItem.id || busItem.bus_id}
                    >
                      {busItem.bus_name || "Unnamed Bus"} —{" "}
                      {busItem.bus_number} ({busItem.capacity} seats)
                    </option>
                  ))}
                </select>

                {buses.length === 0 && (
                  <p className="mt-2 text-sm text-orange-600">
                    No buses are available.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeBusModal}
                  disabled={busSaving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    busSaving ||
                    !selectedBusId ||
                    buses.length === 0
                  }
                  className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busSaving && (
                    <LoaderCircle
                      className="animate-spin"
                      size={18}
                    />
                  )}

                  {busSaving
                    ? "Saving..."
                    : assignmentByStudentId.get(
                        Number(selectedStudent.id)
                      )
                      ? "Change Bus"
                      : "Assign Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}