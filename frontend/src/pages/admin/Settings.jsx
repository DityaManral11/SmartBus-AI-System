import {
    Settings,
    School,
    User,
    Mail,
    Phone,
    Bell,
    Shield,
    Save,
    LogOut,
    RotateCcw,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function SettingsPage() {

    const [settings, setSettings] = useState({

        schoolName: "ABC Public School",

        adminName: "Admin",

        email: "admin@smartbus.com",

        phone: "+91 9876543210",

        notifications: true,

        gps: true,

        twoFactor: false,

        password: "",

        confirmPassword: "",

    });

    useEffect(() => {

        const savedSettings =
            JSON.parse(
                localStorage.getItem("settings")
            );

        if (savedSettings) {

            setSettings(savedSettings);

        } else {

            const users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];

            const admin =
                users.find(
                    (u) =>
                        u.role === "admin"
                );

            if (admin) {

                setSettings((prev) => ({

                    ...prev,

                    adminName:
                        admin.name || prev.adminName,

                    email:
                        admin.email || prev.email,

                    phone:
                        admin.phone || prev.phone,

                }));

            }

        }

    }, []);

    const handleChange = (e) => {

        const { name, value, type, checked } =
            e.target;

        setSettings((prev) => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,

        }));

    };

    const handleSave = () => {

    if (
        settings.password &&
        settings.password !== settings.confirmPassword
    ) {

        alert("Passwords do not match.");

        return;

    }

    localStorage.setItem(
        "settings",
        JSON.stringify(settings)
    );

    if (settings.password) {

        const users =
            JSON.parse(
                localStorage.getItem("users")
            ) || [];

        const updatedUsers = users.map((user) => {

            if (
                user.role === "admin"
            ) {

                return {

                    ...user,

                    password:
                        settings.password,

                };

            }

            return user;

        });

        localStorage.setItem(
            "users",
            JSON.stringify(updatedUsers)
        );

    }

    alert("Settings saved successfully.");

};

const handleLogout = () => {

    if (
        !window.confirm(
            "Are you sure you want to logout?"
        )
    )
        return;

    localStorage.removeItem("currentUser");

    window.location.href = "/login";

};

const handleReset = () => {

    if (
        !window.confirm(
            "Reset all settings?"
        )
    )
        return;

    const defaultSettings = {

        schoolName:
            "ABC Public School",

        adminName:
            "Admin",

        email:
            "admin@smartbus.com",

        phone:
            "+91 9876543210",

        notifications: true,

        gps: true,

        twoFactor: false,

        password: "",

        confirmPassword: "",

    };

    setSettings(defaultSettings);

    localStorage.setItem(
        "settings",
        JSON.stringify(defaultSettings)
    );

    alert("Settings reset successfully.");

};

return (

    <div className="space-y-8">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

            <h1 className="text-4xl font-bold flex items-center gap-3">

                <Settings size={40} />

                Settings

            </h1>

            <p className="mt-3 text-blue-100">

                Manage your SmartBus system settings.

            </p>

        </div>

        {/* School Information */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold mb-6">

                School Information

            </h2>

            <div className="grid md:grid-cols-2 gap-6">

                <div>

                    <label className="font-semibold mb-2 block">

                        School Name

                    </label>

                    <div className="relative">

                        <School className="absolute left-4 top-4 text-gray-400" />

                        <input

                            type="text"

                            name="schoolName"

                            value={settings.schoolName}

                            onChange={handleChange}

                            className="w-full border rounded-2xl pl-12 py-4 focus:ring-2 focus:ring-cyan-500 outline-none"

                        />

                    </div>

                </div>

                <div>

                    <label className="font-semibold mb-2 block">

                        Admin Name

                    </label>

                    <div className="relative">

                        <User className="absolute left-4 top-4 text-gray-400" />

                        <input

                            type="text"

                            name="adminName"

                            value={settings.adminName}

                            onChange={handleChange}

                            className="w-full border rounded-2xl pl-12 py-4 focus:ring-2 focus:ring-cyan-500 outline-none"

                        />

                    </div>

                </div>

                <div>

                    <label className="font-semibold mb-2 block">

                        Email

                    </label>

                    <div className="relative">

                        <Mail className="absolute left-4 top-4 text-gray-400" />

                        <input

                            type="email"

                            name="email"

                            value={settings.email}

                            onChange={handleChange}

                            className="w-full border rounded-2xl pl-12 py-4 focus:ring-2 focus:ring-cyan-500 outline-none"

                        />

                    </div>

                </div>

                <div>

                    <label className="font-semibold mb-2 block">

                        Phone

                    </label>

                    <div className="relative">

                        <Phone className="absolute left-4 top-4 text-gray-400" />

                        <input

                            type="text"

                            name="phone"

                            value={settings.phone}

                            onChange={handleChange}

                            className="w-full border rounded-2xl pl-12 py-4 focus:ring-2 focus:ring-cyan-500 outline-none"

                        />

                    </div>

                </div>

            </div>

        </div>

        {/* System Settings */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold mb-6">

                System Settings

            </h2>

            <div className="space-y-5">

                <div className="flex justify-between items-center border rounded-2xl p-5">

                    <div className="flex items-center gap-3">

                        <Bell className="text-blue-600" />

                        <span>Notifications</span>

                    </div>

                    <input

                        type="checkbox"

                        name="notifications"

                        checked={settings.notifications}

                        onChange={handleChange}

                    />

                </div>

                <div className="flex justify-between items-center border rounded-2xl p-5">

                    <div className="flex items-center gap-3">

                        <Shield className="text-green-600" />

                        <span>GPS Tracking Enabled</span>

                    </div>

                    <input

                        type="checkbox"

                        name="gps"

                        checked={settings.gps}

                        onChange={handleChange}

                    />

                </div>

                <div className="flex justify-between items-center border rounded-2xl p-5">

                    <div className="flex items-center gap-3">

                        <Shield className="text-red-600" />

                        <span>Two Factor Authentication</span>

                    </div>

                    <input

                        type="checkbox"

                        name="twoFactor"

                        checked={settings.twoFactor}

                        onChange={handleChange}

                    />

                </div>

            </div>

        </div>

                {/* Security */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold mb-6">

                Security

            </h2>

            <div className="grid md:grid-cols-2 gap-6">

                <div>

                    <label className="font-semibold mb-2 block">

                        New Password

                    </label>

                    <input
                        type="password"
                        name="password"
                        value={settings.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        className="w-full border rounded-2xl px-4 py-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />

                </div>

                <div>

                    <label className="font-semibold mb-2 block">

                        Confirm Password

                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={settings.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="w-full border rounded-2xl px-4 py-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />

                </div>

            </div>

        </div>

        {/* Action Buttons */}

        <div className="flex flex-wrap gap-4">

            <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:scale-105 transition"
            >

                <Save size={20} />

                Save Settings

            </button>

            <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-2xl transition"
            >

                <RotateCcw size={20} />

                Reset

            </button>

            

        </div>

    </div>

);

}