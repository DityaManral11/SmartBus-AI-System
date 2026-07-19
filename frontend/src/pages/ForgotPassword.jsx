import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { role } = useParams();

  const [formData, setFormData] = useState({
    email: "",
    verificationValue: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const roleDetails = useMemo(() => {
    if (role === "student") {
      return {
        title: "Student Password Reset",
        verificationLabel: "Roll Number",
        verificationPlaceholder: "Enter your roll number",
      };
    }

    if (role === "driver") {
      return {
        title: "Driver Password Reset",
        verificationLabel: "License Number",
        verificationPlaceholder: "Enter your license number",
      };
    }

    if (role === "admin") {
      return {
        title: "Admin Password Reset",
        verificationLabel: "Secret Key",
        verificationPlaceholder: "Enter admin secret key",
      };
    }

    return {
      title: "Forgot Password",
      verificationLabel: "Verification Value",
      verificationPlaceholder: "Enter verification details",
    };
  }, [role]);

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (!password) {
      return {
        score: 0,
        label: "",
      };
    }

    if (score <= 2) {
      return {
        score,
        label: "Weak",
      };
    }

    if (score <= 4) {
      return {
        score,
        label: "Medium",
      };
    }

    return {
      score,
      label: "Strong",
    };
  };

  const passwordStrength = getPasswordStrength(
    formData.newPassword
  );

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleReset = async (event) => {
    event.preventDefault();

    if (
      !formData.email ||
      !formData.verificationValue ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Please fill all fields.",
      });
      return;
    }

    if (!["student", "driver", "admin"].includes(role)) {
      setMessage({
        type: "error",
        text: "Invalid user role.",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must contain at least 8 characters.",
      });
      return;
    }

    if (!passwordsMatch) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/forgot-password", {
        role,
        email: formData.email.trim(),
        verificationValue:
          formData.verificationValue.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setMessage({
        type: "success",
        text:
          response.data?.message ||
          "Password updated successfully.",
      });

      setTimeout(() => {
        navigate(`/login/${role}`);
      }, 1200);
    } catch (error) {
      console.error("Forgot password error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-700 to-cyan-500 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
            <ShieldCheck
              size={32}
              className="text-blue-600"
            />
          </div>

          <h2 className="mt-4 text-3xl font-bold text-slate-900">
            {roleDetails.title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Verify your account details before changing
            your password.
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleReset}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {roleDetails.verificationLabel}
            </label>

            <div className="relative">
              <input
                type={
                  role === "admin"
                    ? "password"
                    : "text"
                }
                name="verificationValue"
                placeholder={
                  roleDetails.verificationPlaceholder
                }
                value={formData.verificationValue}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <KeyRound
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <input
                type={
                  showPasswords.newPassword
                    ? "text"
                    : "password"
                }
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPasswords((previous) => ({
                    ...previous,
                    newPassword:
                      !previous.newPassword,
                  }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPasswords.newPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {formData.newPassword && (
              <div className="mt-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className={`h-2 flex-1 rounded-full ${
                        item <= passwordStrength.score
                          ? passwordStrength.label ===
                            "Weak"
                            ? "bg-red-500"
                            : passwordStrength.label ===
                                "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500">
                    Use uppercase, lowercase, number and
                    special character.
                  </span>

                  <span
                    className={`font-semibold ${
                      passwordStrength.label === "Weak"
                        ? "text-red-500"
                        : passwordStrength.label ===
                            "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showPasswords.confirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPasswords((previous) => ({
                    ...previous,
                    confirmPassword:
                      !previous.confirmPassword,
                  }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {formData.confirmPassword && (
              <p
                className={`mt-2 text-sm font-semibold ${
                  passwordsMatch
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !formData.email ||
              !formData.verificationValue ||
              !formData.newPassword ||
              !formData.confirmPassword ||
              !passwordsMatch ||
              formData.newPassword.length < 8
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2
                size={19}
                className="animate-spin"
              />
            )}

            {loading
              ? "Updating Password..."
              : "Update Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/login/${role}`)}
            className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}