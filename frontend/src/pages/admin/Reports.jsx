import {
    FileText,
    Download,
    Eye,
    Trash2,
    Search,
    Plus,
} from "lucide-react";

import { useEffect, useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {

    const [search, setSearch] = useState("");

    const [students, setStudents] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [reports, setReports] = useState([]);

    useEffect(() => {

        const users =
            JSON.parse(localStorage.getItem("users")) || [];

        const driversData =
            JSON.parse(localStorage.getItem("drivers")) || [];

        const busesData =
            JSON.parse(localStorage.getItem("buses")) || [];

        const routes = [
            ...new Set(
                busesData
                    .map((b) => b.route)
                    .filter(Boolean)
            ),
        ];

        const studentsData =
            users.filter(
                (u) => u.role === "student"
            );

        setStudents(studentsData);

        setDrivers(driversData);

        setBuses(busesData);

        const savedReports =
            JSON.parse(
                localStorage.getItem("reports")
            );

        if (savedReports) {

            setReports(savedReports);

        } else {

            const defaultReports = [

                {
                    id: 1,
                    name: "Students Report",
                    category: "Student",
                    type: "PDF",
                    total: studentsData.length,
                    date: new Date().toLocaleDateString(),
                    status: "Ready",
                },

                {
                    id: 2,
                    name: "Drivers Report",
                    category: "Driver",
                    type: "PDF",
                    total: driversData.length,
                    date: new Date().toLocaleDateString(),
                    status: "Ready",
                },

                {
                    id: 3,
                    name: "Buses Report",
                    category: "Bus",
                    type: "PDF",
                    total: busesData.length,
                    date: new Date().toLocaleDateString(),
                    status: "Ready",
                },

                {
                    id: 4,
                    name: "Routes Report",
                    category: "Route",
                    type: "PDF",
                    total: routes.length,
                    date: new Date().toLocaleDateString(),
                    status: "Ready",
                },

            ];

            setReports(defaultReports);

            localStorage.setItem(
                "reports",
                JSON.stringify(defaultReports)
            );

        }

    }, []);

    const handleGenerateReport = () => {

        const routes = [
            ...new Set(
                buses
                    .map((b) => b.route)
                    .filter(Boolean)
            ),
        ];

        const newReports = [

            {
                id: Date.now() + 1,
                name: "Students Report",
                category: "Student",
                type: "PDF",
                total: students.length,
                date: new Date().toLocaleDateString(),
                status: "Ready",
            },

            {
                id: Date.now() + 2,
                name: "Drivers Report",
                category: "Driver",
                type: "PDF",
                total: drivers.length,
                date: new Date().toLocaleDateString(),
                status: "Ready",
            },

            {
                id: Date.now() + 3,
                name: "Buses Report",
                category: "Bus",
                type: "PDF",
                total: buses.length,
                date: new Date().toLocaleDateString(),
                status: "Ready",
            },

            {
                id: Date.now() + 4,
                name: "Routes Report",
                category: "Route",
                type: "PDF",
                total: routes.length,
                date: new Date().toLocaleDateString(),
                status: "Ready",
            },

        ];

        setReports(newReports);

        localStorage.setItem(
            "reports",
            JSON.stringify(newReports)
        );

    };

    const handleDelete = (id) => {

        if (!window.confirm("Delete this report?"))
            return;

        const updated =
            reports.filter((report) => report.id !== id);

        setReports(updated);

        localStorage.setItem(
            "reports",
            JSON.stringify(updated)
        );

    };

    const handleView = (report) => {

        alert(

            `Report : ${report.name}

Type : ${report.type}

Total Records : ${report.total}

Generated : ${report.date}

Status : ${report.status}`

        );

    };

    const handleDownload = (report) => {

        const doc = new jsPDF();

        doc.setFontSize(20);

        doc.text(
            "SMART BUS MANAGEMENT SYSTEM",
            14,
            18
        );

        doc.setFontSize(11);

        doc.text(
            `Generated : ${new Date().toLocaleString()}`,
            14,
            28
        );

        // ===========================
        // STUDENTS REPORT
        // ===========================

        if (report.category === "Student") {

            autoTable(doc, {

                startY: 40,

                head: [[
                    "Name",
                    "Email",
                    "Phone"
                ]],

                body: students.map((student) => [

                    student.name,

                    student.email,

                    student.phone || "-",

                ]),

            });

            doc.save("Students_Report.pdf");

            return;

        }

        // ===========================
        // DRIVERS REPORT
        // ===========================

        if (report.category === "Driver") {

            autoTable(doc, {

                startY: 40,

                head: [[
                    "Name",
                    "Email",
                    "Phone",
                    "License"
                ]],

                body: drivers.map((driver) => [

                    driver.name,

                    driver.email,

                    driver.phone || "-",

                    driver.license || "-",

                ]),

            });

            doc.save("Drivers_Report.pdf");

            return;

        }

        // ===========================
        // BUSES REPORT
        // ===========================

        if (report.category === "Bus") {

            autoTable(doc, {

                startY: 40,

                head: [[
                    "Bus No",
                    "Driver",
                    "Route",
                    "Status"
                ]],

                body: buses.map((bus) => [

                    bus.busNo,

                    bus.driver,

                    bus.route,

                    bus.status,

                ]),

            });

            doc.save("Buses_Report.pdf");

            return;

        }

        // ===========================
        // ROUTES REPORT
        // ===========================

        if (report.category === "Route") {

            const routes = [];

            buses.forEach((bus) => {

                if (!bus.route) return;

                const existing = routes.find(
                    (r) => r.route === bus.route
                );

                if (existing) {

                    existing.total++;

                } else {

                    routes.push({

                        route: bus.route,

                        pickupPoints:
                            bus.pickupPoints || "-",

                        total: 1,

                    });

                }

            });

            autoTable(doc, {

                startY: 40,

                head: [[
                    "Route",
                    "Pickup Points",
                    "Assigned Buses"
                ]],

                body: routes.map((route) => [

                    route.route,

                    route.pickupPoints,

                    route.total,

                ]),

            });

            doc.save("Routes_Report.pdf");

            return;

        }

    };

    const exportCSV = () => {

        const rows = reports.map((report) => ({

            Report: report.name,

            Type: report.type,

            Records: report.total,

            Date: report.date,

            Status: report.status,

        }));

        const headers =
            Object.keys(rows[0]).join(",");

        const values = rows
            .map((row) =>
                Object.values(row).join(",")
            )
            .join("\n");

        const csv =
            headers + "\n" + values;

        const blob = new Blob([csv], {
            type: "text/csv",
        });

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download = "Reports.csv";

        a.click();

        URL.revokeObjectURL(url);

    };

    const filteredReports = reports.filter((report) =>
        report.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (

        <div className="space-y-8">

            {/* Header */}

            <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

                <div className="flex justify-between items-center flex-wrap gap-4">

                    <div>

                        <h1 className="text-4xl font-bold flex items-center gap-3">

                            <FileText size={40} />

                            Reports

                        </h1>

                        <p className="mt-2 text-blue-100">

                            Generate and manage Smart Bus reports.

                        </p>

                    </div>

                    <div className="flex gap-3">

                        <button

                            onClick={handleGenerateReport}

                            className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"

                        >

                            <div className="flex items-center gap-2">

                                <Plus size={18} />

                                Generate Report

                            </div>

                        </button>

                        <button

                            onClick={exportCSV}

                            className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition"

                        >

                            Export CSV

                        </button>

                    </div>

                </div>

            </div>

            {/* Stats */}

            <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white">

                    <p>Total Reports</p>

                    <h2 className="text-3xl font-bold mt-2">

                        {reports.length}

                    </h2>

                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white">

                    <p>Students</p>

                    <h2 className="text-3xl font-bold mt-2">

                        {students.length}

                    </h2>

                </div>

                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white">

                    <p>Drivers</p>

                    <h2 className="text-3xl font-bold mt-2">

                        {drivers.length}

                    </h2>

                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white">

                    <p>Buses</p>

                    <h2 className="text-3xl font-bold mt-2">

                        {buses.length}

                    </h2>

                </div>

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

                        placeholder="Search Report..."

                        value={search}

                        onChange={(e) =>
                            setSearch(e.target.value)
                        }

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

                                <th className="text-left p-5">

                                    Report

                                </th>

                                <th className="text-left p-5">

                                    Type

                                </th>

                                <th className="text-left p-5">

                                    Records

                                </th>

                                <th className="text-left p-5">

                                    Date

                                </th>

                                <th className="text-left p-5">

                                    Status

                                </th>

                                <th className="text-center p-5">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody>
                            {filteredReports.map((report) => (

                                <tr
                                    key={report.id}
                                    className="border-t hover:bg-slate-50 transition"
                                >

                                    <td className="p-5 font-semibold">

                                        {report.name}

                                    </td>

                                    <td className="p-5">

                                        {report.type}

                                    </td>

                                    <td className="p-5 font-semibold text-blue-600">

                                        {report.total}

                                    </td>

                                    <td className="p-5">

                                        {report.date}

                                    </td>

                                    <td className="p-5">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${report.status === "Ready"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >

                                            {report.status}

                                        </span>

                                    </td>

                                    <td className="p-5">

                                        <div className="flex justify-center gap-3">

                                            <button
                                                onClick={() =>
                                                    handleView(report)
                                                }
                                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                            >

                                                <Eye size={18} />

                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDownload(report)
                                                }
                                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                            >

                                                <Download size={18} />

                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(report.id)
                                                }
                                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                            >

                                                <Trash2 size={18} />

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                            {filteredReports.length === 0 && (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center py-10 text-gray-500"
                                    >

                                        No reports found.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}