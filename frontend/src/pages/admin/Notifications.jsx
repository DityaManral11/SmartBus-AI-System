import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Send,
  Users,
  UserCog,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  recipientType: "student",
  recipientId: "",
  title: "",
  message: "",
};

export default function AdminNotifications() {
  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const recipients = useMemo(() => {
    return form.recipientType === "student" ? students : drivers;
  }, [form.recipientType, students, drivers]);

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);

      const [studentsResponse, driversResponse] = await Promise.all([
        api.get("/students"),
        api.get("/drivers"),
      ]);

      setStudents(
        Array.isArray(studentsResponse.data?.students)
          ? studentsResponse.data.students
          : []
      );

      setDrivers(
        Array.isArray(driversResponse.data?.drivers)
          ? driversResponse.data.drivers
          : []
      );
    } catch (error) {
      console.error("Error fetching notification recipients:", error);

      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not load students and drivers.",
      });
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
      ...(name === "recipientType" ? { recipientId: "" } : {}),
    }));

    setStatus(null);
  };

  const sendToUser = (userId) => {
    return api.post("/notifications", {
      user_id: userId,
      title: form.title.trim(),
      message: form.message.trim(),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!form.recipientId) {
      setStatus({
        type: "error",
        message: "Please select a recipient.",
      });
      return;
    }

    if (!form.title.trim()) {
      setStatus({
        type: "error",
        message: "Please enter a notification title.",
      });
      return;
    }

    if (!form.message.trim()) {
      setStatus({
        type: "error",
        message: "Please enter a notification message.",
      });
      return;
    }

    try {
      setSending(true);

      if (form.recipientId === "all") {
        if (recipients.length === 0) {
          setStatus({
            type: "error",
            message: `No ${form.recipientType}s are available.`,
          });
          return;
        }

        await Promise.all(
          recipients.map((recipient) => sendToUser(recipient.user_id))
        );

        setStatus({
          type: "success",
          message: `Notification sent to all ${form.recipientType}s successfully.`,
        });
      } else {
        await sendToUser(form.recipientId);

        setStatus({
          type: "success",
          message: "Notification sent successfully.",
        });
      }

      setForm((previousForm) => ({
        ...previousForm,
        recipientId: "",
        title: "",
        message: "",
      }));
    } catch (error) {
      console.error("Error sending notification:", error);

      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not send the notification.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-white/15 p-4">
            <Bell size={38} />
          </div>

          <div>
            <h1 className="text-4xl font-bold">Send Notifications</h1>
            <p className="mt-2 text-blue-100">
              Send updates and alerts to students or drivers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-100 p-4 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Users size={30} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Students available
              </p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-cyan-100 p-4 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
              <UserCog size={30} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Drivers available
              </p>
              <p className="text-3xl font-bold">{drivers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Recipient type</label>

            <select
              name="recipientType"
              value={form.recipientType}
              onChange={handleChange}
              disabled={sending}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="student">Student</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">Select recipient</label>

            <select
              name="recipientId"
              value={form.recipientId}
              onChange={handleChange}
              disabled={loadingRecipients || sending}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">
                {loadingRecipients
                  ? "Loading recipients..."
                  : `Select ${form.recipientType}`}
              </option>

              {!loadingRecipients && recipients.length > 0 && (
                <option value="all">
                  Send to all {form.recipientType}s
                </option>
              )}

              {recipients.map((recipient) => (
                <option key={recipient.user_id} value={recipient.user_id}>
                  {recipient.full_name} — {recipient.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block font-semibold">Title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={150}
            disabled={sending}
            placeholder="Enter notification title"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block font-semibold">Message</label>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={6}
            maxLength={1000}
            disabled={sending}
            placeholder="Write your notification message"
            className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800"
          />

          <p className="mt-2 text-right text-sm text-slate-500 dark:text-slate-400">
            {form.message.length}/1000
          </p>
        </div>

        {status && (
          <div
            className={`mt-6 flex items-start gap-3 rounded-2xl px-4 py-4 ${
              status.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
            ) : (
              <AlertCircle className="mt-0.5 shrink-0" size={20} />
            )}

            <span className="font-medium">{status.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={sending || loadingRecipients}
          className="mt-7 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {sending ? (
            <Loader2 size={21} className="animate-spin" />
          ) : (
            <Send size={21} />
          )}

          {sending ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </div>
  );
}