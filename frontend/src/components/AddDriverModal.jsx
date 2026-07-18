import { useEffect, useState } from "react";
import api from "../services/api";

const emptyDriver = {
  full_name: "",
  phone: "",
  email: "",
  license_number: "",
  password: "",
  confirm_password: "",
  status: "active",
  experience_years: 0,
};

export default function AddDriverModal({
  open,
  setOpen,
  editDriver,
  setEditDriver,
  onSaved,
}) {
  const [driver, setDriver] = useState(emptyDriver);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editDriver) {
      setDriver({
        full_name: editDriver.full_name || "",
        phone: editDriver.phone || "",
        email: editDriver.email || "",
        license_number: editDriver.license_number || "",
        password: "",
        confirm_password: "",
        status: editDriver.status || "active",
        experience_years: editDriver.experience_years || 0,
      });
    } else {
      setDriver(emptyDriver);
    }

    setError("");
  }, [editDriver, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDriver((previousDriver) => ({
      ...previousDriver,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (loading) return;

    setOpen(false);
    setEditDriver(null);
    setDriver(emptyDriver);
    setError("");
  };

  const handleSave = async () => {
    if (
      !driver.full_name.trim() ||
      !driver.phone.trim() ||
      !driver.email.trim() ||
      !driver.license_number.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const experience = Number(driver.experience_years);

    if (!Number.isInteger(experience) || experience < 0) {
      setError("Experience years must be a non-negative whole number.");
      return;
    }

    if (!editDriver) {
      if (!driver.password || !driver.confirm_password) {
        setError("Password and confirm password are required.");
        return;
      }

      if (driver.password !== driver.confirm_password) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      if (editDriver) {
        const payload = {
          full_name: driver.full_name.trim(),
          email: driver.email.trim(),
          phone: driver.phone.trim(),
          status: driver.status,
          license_number: driver.license_number.trim(),
          experience_years: experience,
          total_trips: Number(editDriver.total_trips || 0),
          total_distance: Number(editDriver.total_distance || 0),
          rating: Number(editDriver.rating || 0),
        };

        const response = await api.put(`/drivers/${editDriver.id}`, payload);
        alert(response.data?.message || "Driver updated successfully.");
      } else {
        const payload = {
          full_name: driver.full_name.trim(),
          email: driver.email.trim(),
          phone: driver.phone.trim(),
          password: driver.password,
          confirm_password: driver.confirm_password,
          license_number: driver.license_number.trim(),
          experience_years: Number(driver.experience_years),
        };

        const response = await api.post("/auth/driver/register", payload);
        alert(response.data?.message || "Driver added successfully.");
      }

      await onSaved();
      handleClose();
    } catch (error) {
      console.error("Save driver error:", error);
      setError(
        error.response?.data?.message ||
          "Could not save driver. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-3xl font-bold">
          {editDriver ? "Edit Driver" : "Add Driver"}
        </h2>

        {error && (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input type="text" name="full_name" placeholder="Driver Name" value={driver.full_name} onChange={handleChange} className="w-full rounded-xl border p-3" />
          <input type="text" name="phone" placeholder="Phone Number" value={driver.phone} onChange={handleChange} className="w-full rounded-xl border p-3" />
          <input type="email" name="email" placeholder="Email Address" value={driver.email} onChange={handleChange} className="w-full rounded-xl border p-3" />
          <input type="text" name="license_number" placeholder="License Number" value={driver.license_number} onChange={handleChange} className="w-full rounded-xl border p-3" />
          <input type="number" name="experience_years" placeholder="Experience in Years" min="0" step="1" value={driver.experience_years} onChange={handleChange} className="w-full rounded-xl border p-3" />

          {!editDriver && (
            <>
              <input type="password" name="password" placeholder="Password" value={driver.password} onChange={handleChange} className="w-full rounded-xl border p-3" />
              <input type="password" name="confirm_password" placeholder="Confirm Password" value={driver.confirm_password} onChange={handleChange} className="w-full rounded-xl border p-3" />
            </>
          )}

          {editDriver && (
            <select name="status" value={driver.status} onChange={handleChange} className="w-full rounded-xl border p-3">
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={handleClose} disabled={loading} className="rounded-xl bg-gray-200 px-5 py-3 disabled:opacity-60">
            Cancel
          </button>

          <button type="button" onClick={handleSave} disabled={loading} className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Saving..." : editDriver ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}