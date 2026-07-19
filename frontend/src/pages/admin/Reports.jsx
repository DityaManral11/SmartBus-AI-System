import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Plus,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api";

const REPORT_OPTIONS = [
  { value: "Student", label: "Students Report" },
  { value: "Driver", label: "Drivers Report" },
  { value: "Bus", label: "Buses Report" },
  { value: "Route", label: "Routes Report" },
];

export default function Reports() {
  const [search, setSearch] = useState("");

  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Student");
  const [customReportName, setCustomReportName] = useState("");

  const getArrayFromResponse = (response, keys = []) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.report)) return data.report;

    return [];
  };

  const getCategoryTotal = (category) => {
    if (category === "Student") return students.length;
    if (category === "Driver") return drivers.length;
    if (category === "Bus") return buses.length;
    if (category === "Route") return routes.length;

    return 0;
  };

  const getDefaultReportName = (category) => {
    return (
      REPORT_OPTIONS.find((option) => option.value === category)?.label ||
      "Smart Bus Report"
    );
  };

  const createInitialReports = (
    studentsData,
    driversData,
    busesData,
    routesData
  ) => {
    const today = new Date().toLocaleDateString("en-IN");

    return [
      {
        id: "student-default",
        name: "Students Report",
        category: "Student",
        type: "PDF",
        total: studentsData.length,
        date: today,
        status: "Ready",
      },
      {
        id: "driver-default",
        name: "Drivers Report",
        category: "Driver",
        type: "PDF",
        total: driversData.length,
        date: today,
        status: "Ready",
      },
      {
        id: "bus-default",
        name: "Buses Report",
        category: "Bus",
        type: "PDF",
        total: busesData.length,
        date: today,
        status: "Ready",
      },
      {
        id: "route-default",
        name: "Routes Report",
        category: "Route",
        type: "PDF",
        total: routesData.length,
        date: today,
        status: "Ready",
      },
    ];
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentsResponse,
        driversResponse,
        busesResponse,
        routesResponse,
      ] = await Promise.all([
        api.get("/students"),
        api.get("/drivers"),
        api.get("/buses"),
        api.get("/routes"),
      ]);

      const studentsData = getArrayFromResponse(studentsResponse, [
        "students",
        "results",
      ]);

      const driversData = getArrayFromResponse(driversResponse, [
        "drivers",
        "results",
      ]);

      const busesData = getArrayFromResponse(busesResponse, [
        "buses",
        "results",
      ]);

      const routesData = getArrayFromResponse(routesResponse, [
        "routes",
        "results",
      ]);

      setStudents(studentsData);
      setDrivers(driversData);
      setBuses(busesData);
      setRoutes(routesData);

      setReports((currentReports) => {
        if (currentReports.length > 0) {
          return currentReports.map((report) => ({
            ...report,
            total:
              report.category === "Student"
                ? studentsData.length
                : report.category === "Driver"
                ? driversData.length
                : report.category === "Bus"
                ? busesData.length
                : report.category === "Route"
                ? routesData.length
                : report.total,
          }));
        }

        return createInitialReports(
          studentsData,
          driversData,
          busesData,
          routesData
        );
      });
    } catch (fetchError) {
      console.error("Fetch report data error:", fetchError);

      setError(
        fetchError.response?.data?.message ||
          "Could not load report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleOpenGenerateModal = () => {
    setSelectedCategory("Student");
    setCustomReportName("");
    setShowGenerateModal(true);
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError("");

      await fetchReportData();

      const newReport = {
        id: `${selectedCategory}-${Date.now()}`,
        name:
          customReportName.trim() ||
          getDefaultReportName(selectedCategory),
        category: selectedCategory,
        type: "PDF",
        total: getCategoryTotal(selectedCategory),
        date: new Date().toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        status: "Ready",
      };

      setReports((currentReports) => [newReport, ...currentReports]);
      setShowGenerateModal(false);
      setCustomReportName("");
    } catch (generateError) {
      console.error("Generate report error:", generateError);
      setError("Could not generate the report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this report?")) return;

    setReports((currentReports) =>
      currentReports.filter((report) => report.id !== id)
    );
  };

  const handleView = (report) => {
    window.alert(
      `Report: ${report.name}\n\n` +
        `Type: ${report.type}\n` +
        `Category: ${report.category}\n` +
        `Total Records: ${report.total}\n` +
        `Generated: ${report.date}\n` +
        `Status: ${report.status}`
    );
  };

  const addPdfHeading = (doc, report) => {
    doc.setFontSize(20);
    doc.text("SMART BUS MANAGEMENT SYSTEM", 14, 18);

    doc.setFontSize(14);
    doc.text(report.name, 14, 28);

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      14,
      36
    );
  };

  const handleDownload = (report) => {
    const doc = new jsPDF();
    addPdfHeading(doc, report);

    if (report.category === "Student") {
      autoTable(doc, {
        startY: 44,
        head: [
          [
            "Name",
            "Email",
            "Phone",
            "Roll No",
            "Course",
            "Semester",
            "Status",
          ],
        ],
        body: students.map((student) => [
          student.full_name ||
            student.student_name ||
            student.name ||
            "-",
          student.email || "-",
          student.phone || "-",
          student.roll_number || student.rollNo || "-",
          student.course || "-",
          student.semester ?? "-",
          student.status || "active",
        ]),
      });

      doc.save(`${report.name.replaceAll(" ", "_")}.pdf`);
      return;
    }

    if (report.category === "Driver") {
      autoTable(doc, {
        startY: 44,
        head: [["Name", "Email", "Phone", "License", "Experience"]],
        body: drivers.map((driver) => [
          driver.full_name ||
            driver.driver_name ||
            driver.name ||
            "-",
          driver.email || "-",
          driver.phone || "-",
          driver.license_number || driver.license || "-",
          driver.experience_years ?? "-",
        ]),
      });

      doc.save(`${report.name.replaceAll(" ", "_")}.pdf`);
      return;
    }

    if (report.category === "Bus") {
      autoTable(doc, {
        startY: 44,
        head: [
          [
            "Bus No",
            "Bus Name",
            "Registration",
            "Capacity",
            "Status",
          ],
        ],
        body: buses.map((bus) => [
          bus.bus_number || bus.busNo || "-",
          bus.bus_name || bus.name || "-",
          bus.registration_number || "-",
          bus.capacity ?? "-",
          bus.status || "-",
        ]),
      });

      doc.save(`${report.name.replaceAll(" ", "_")}.pdf`);
      return;
    }

    if (report.category === "Route") {
      autoTable(doc, {
        startY: 44,
        head: [
          [
            "Route",
            "Source",
            "Destination",
            "Distance",
            "Estimated Time",
            "Status",
          ],
        ],
        body: routes.map((route) => [
          route.route_name || route.name || "-",
          route.source || "-",
          route.destination || "-",
          route.distance ? `${route.distance} km` : "-",
          route.estimated_time || "-",
          route.status || "-",
        ]),
      });

      doc.save(`${report.name.replaceAll(" ", "_")}.pdf`);
    }
  };

  const exportCSV = () => {
    if (reports.length === 0) {
      window.alert("No reports are available to export.");
      return;
    }

    const rows = reports.map((report) => ({
      Report: report.name,
      Category: report.category,
      Type: report.type,
      Records: report.total,
      Date: report.date,
      Status: report.status,
    }));

    const escapeCSVValue = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const headers = Object.keys(rows[0])
      .map(escapeCSVValue)
      .join(",");

    const values = rows
      .map((row) =>
        Object.values(row).map(escapeCSVValue).join(",")
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${values}`], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "SmartBus_Reports.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return reports;

    return reports.filter((report) =>
      `${report.name} ${report.category} ${report.type}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [reports, search]);

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

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleOpenGenerateModal}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Generate Report
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-700 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-2xl p-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white">
          <p>Total Reports</p>
          <h2 className="text-3xl font-bold mt-2">{reports.length}</h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white">
          <p>Students</p>
          <h2 className="text-3xl font-bold mt-2">{students.length}</h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white">
          <p>Drivers</p>
          <h2 className="text-3xl font-bold mt-2">{drivers.length}</h2>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white">
          <p>Buses</p>
          <h2 className="text-3xl font-bold mt-2">{buses.length}</h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-4 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search Report..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-900">
              <tr className="text-slate-800 dark:text-slate-200">
                <th className="text-left p-5">Report</th>
                <th className="text-left p-5">Type</th>
                <th className="text-left p-5">Records</th>
                <th className="text-left p-5">Date</th>
                <th className="text-left p-5">Status</th>
                <th className="text-center p-5">Actions</th>
              </tr>
            </thead>

            <tbody className="text-slate-800 dark:text-slate-200">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                  <td className="p-5 font-semibold">{report.name}</td>
                  <td className="p-5">{report.type}</td>
                  <td className="p-5 font-semibold text-blue-600 dark:text-blue-400">
                    {report.total}
                  </td>
                  <td className="p-5">{report.date}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      {report.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        title="View report details"
                        onClick={() => handleView(report)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        title="Download PDF"
                        onClick={() => handleDownload(report)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                      >
                        <Download size={18} />
                      </button>

                      <button
                        type="button"
                        title="Delete report"
                        onClick={() => handleDelete(report.id)}
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
                    className="text-center py-10 text-gray-500 dark:text-slate-400"
                  >
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Generate Report
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select the data you want to include.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block font-semibold text-slate-700 dark:text-slate-200">
                  Report Type
                </label>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REPORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700 dark:text-slate-200">
                  Custom Name
                </label>

                <input
                  type="text"
                  value={customReportName}
                  onChange={(event) =>
                    setCustomReportName(event.target.value)
                  }
                  placeholder={getDefaultReportName(selectedCategory)}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-4 text-slate-700 dark:text-slate-300">
                Records available:{" "}
                <span className="font-bold">
                  {getCategoryTotal(selectedCategory)}
                </span>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={generating}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white hover:scale-105 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}