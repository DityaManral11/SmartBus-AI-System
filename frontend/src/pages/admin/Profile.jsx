import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
} from "lucide-react";

import api from "../../services/api";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/settings");

      const data = res.data.settings;

      setProfile({
        full_name: data.adminName,
        email: data.email,
        phone: data.phone,
        role: "admin",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/admin/settings", {
        schoolName: "ABC Public School",
        adminName: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        notifications: true,
        gps: true,
        twoFactor: false,
      });

      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-xl font-semibold">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <User size={38} />
          My Profile
        </h1>

        <p className="mt-2 text-blue-100">
          Manage your administrator profile.
        </p>
      </div>

      {/* Card */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <div className="flex flex-col items-center mb-8">

          <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">

            {profile.full_name.charAt(0).toUpperCase()}

          </div>

          <h2 className="text-2xl font-bold mt-4">
            {profile.full_name}
          </h2>

          <span className="text-blue-600 font-medium capitalize">
            {profile.role}
          </span>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Name */}

          <div>

            <label className="font-semibold mb-2 block">
              Full Name
            </label>

            <div className="relative">

              <User className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="w-full border rounded-2xl pl-12 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* Email */}

          <div>

            <label className="font-semibold mb-2 block">
              Email
            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-4 text-gray-400" />

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border rounded-2xl pl-12 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* Phone */}

          <div>

            <label className="font-semibold mb-2 block">
              Phone
            </label>

            <div className="relative">

              <Phone className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border rounded-2xl pl-12 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* Role */}

          <div>

            <label className="font-semibold mb-2 block">
              Role
            </label>

            <div className="relative">

              <Shield className="absolute left-4 top-4 text-gray-400" />

              <input
                value="Administrator"
                disabled
                className="w-full border rounded-2xl pl-12 py-4 bg-gray-100"
              />

            </div>

          </div>

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:scale-105 transition"
        >

          <Save size={20} />

          {saving ? "Saving..." : "Save Profile"}

        </button>

      </div>
    </div>
  );
}