import { CalendarDays, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import ScheduleTable from "../../components/ScheduleTable";
import AddScheduleModal from "../../components/AddScheduleModal";

export default function Schedules() {

    const [open, setOpen] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [editSchedule, setEditSchedule] = useState(null);
    const [viewSchedule, setViewSchedule] = useState(null);
    const [drivers, setDrivers] = useState([]);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    useEffect(() => {

        const buses =
            JSON.parse(
                localStorage.getItem("buses")
            ) || [];

        const users =
            JSON.parse(localStorage.getItem("users")) || [];

        const driverList = users.filter(
            (user) => user.role === "driver"
        );

        setDrivers(driverList);

        const savedSchedules =
            JSON.parse(
                localStorage.getItem("schedules")
            ) || [];

        const updatedSchedules = buses.map((bus) => {
            const existing = savedSchedules.find(
                (s) => s.busNo === bus.busNo
            );

            const driverUser = users.find(
                (u) => u.email === bus.driver
            );

            return {
                busNo: bus.busNo,
                driver: driverUser ? driverUser.name : bus.driver,
                route: bus.route,
                departure: existing?.departure || "",
                arrival: existing?.arrival || "",
                status: existing?.status ||
                    (bus.status === "Maintenance"
                        ? "Inactive"
                        : "Active"),
            };
        });

        setSchedules(updatedSchedules);

        localStorage.setItem(
            "schedules",
            JSON.stringify(updatedSchedules)
        );

    }, []);

    const filteredSchedules =
        schedules.filter((schedule) => {

            const matchesSearch =

                schedule.busNo
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                schedule.driver
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                schedule.route
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =

                statusFilter === "All"
                    ? true
                    : schedule.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );

        });

    const activeSchedules =
        schedules.filter(
            (s) =>
                s.status === "Active"
        ).length;

    const inactiveSchedules =
        schedules.filter(
            (s) =>
                s.status === "Inactive"
        ).length;

    return (

        <div className="space-y-8">
            {/* Header */}

            <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

                <div className="flex items-center justify-between flex-wrap gap-4">

                    <div>

                        <h1 className="text-4xl font-bold flex items-center gap-3">

                            <CalendarDays size={38} />

                            Schedule Management

                        </h1>

                        <p className="mt-2 text-blue-100">

                            Manage all bus schedules.

                        </p>

                    </div>


                </div>

            </div>

            {/* Stats */}

            <div className="grid md:grid-cols-3 gap-6">

                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

                    <p>Total Schedules</p>

                    <h2 className="text-4xl font-bold mt-3">

                        {schedules.length}

                    </h2>

                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

                    <p>Active</p>

                    <h2 className="text-4xl font-bold mt-3">

                        {activeSchedules}

                    </h2>

                </div>

                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

                    <p>Inactive</p>

                    <h2 className="text-4xl font-bold mt-3">

                        {inactiveSchedules}

                    </h2>

                </div>

            </div>

            {/* Search & Filter */}

            <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="grid md:grid-cols-2 gap-4">

                    <input
                        type="text"
                        placeholder="Search Bus / Driver / Route..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="border rounded-xl p-4 outline-none"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className="border rounded-xl p-4"
                    >

                        <option value="All">
                            All Status
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>

                    </select>

                </div>

            </div>

            {/* Schedule Table */}

            <ScheduleTable
                schedules={filteredSchedules}
                setSchedules={setSchedules}
                setOpen={setOpen}
                setEditSchedule={setEditSchedule}
                setViewSchedule={setViewSchedule}
            />

            <AddScheduleModal
                open={open}
                setOpen={setOpen}
                schedules={schedules}
                setSchedules={setSchedules}
                editSchedule={editSchedule}
                setEditSchedule={setEditSchedule}
                drivers={drivers}
            />

            {/* View Schedule Modal */}

            {viewSchedule && (

                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

                    <div className="bg-white w-[550px] rounded-3xl shadow-2xl p-8">

                        <h2 className="text-3xl font-bold mb-6">

                            Schedule Details

                        </h2>

                        <div className="space-y-5">

                            <div className="flex justify-between border-b pb-3">

                                <span className="font-semibold">

                                    Bus Number

                                </span>

                                <span>

                                    {viewSchedule.busNo}

                                </span>

                            </div>

                            <div className="flex justify-between border-b pb-3">

                                <span className="font-semibold">

                                    Driver

                                </span>

                                <span>

                                    {viewSchedule.driver}

                                </span>

                            </div>

                            <div className="flex justify-between border-b pb-3">

                                <span className="font-semibold">

                                    Route

                                </span>

                                <span>

                                    {viewSchedule.route}

                                </span>

                            </div>

                            <div className="flex justify-between border-b pb-3">

                                <span className="font-semibold">

                                    Departure

                                </span>

                                <span>

                                    {viewSchedule.departure}

                                </span>

                            </div>

                            <div className="flex justify-between border-b pb-3">

                                <span className="font-semibold">

                                    Arrival

                                </span>

                                <span>

                                    {viewSchedule.arrival}

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="font-semibold">

                                    Status

                                </span>

                                <span
                                    className={`px-3 py-1 rounded-full text-white ${viewSchedule.status === "Active"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                        }`}
                                >

                                    {viewSchedule.status}

                                </span>

                            </div>

                        </div>

                        <div className="flex justify-end mt-8">

                            <button
                                onClick={() =>
                                    setViewSchedule(null)
                                }
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 transition"
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

