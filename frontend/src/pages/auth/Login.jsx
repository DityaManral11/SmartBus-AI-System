import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);
  const [rememberMe, setRememberMe] =
    useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("rememberedEmail");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    if (value.length <= 8) {
      setPassword(value);
      setError("");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password.length > 8) {
      setError(
        "Password cannot exceed 8 characters."
      );
      return;
    }

    const validRoles = [
      "admin",
      "student",
      "driver",
    ];

    if (!validRoles.includes(role)) {
      setError("Invalid login role.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `/auth/${role}/login`,
        {
          email: email.trim(),
          password,
        }
      );

      const {
        token,
        user,
        message,
      } = response.data;

      if (!token || !user) {
        setError(
          "Invalid response received from the server."
        );
        return;
      }

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      localStorage.setItem(
        "userRole",
        user.role
      );

      if (rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          email.trim()
        );
      } else {
        localStorage.removeItem(
          "rememberedEmail"
        );
      }

      alert(message || "Login successful");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "driver") {
        navigate("/driver/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Unable to connect to the server. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
      {/* Left Side */}

      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl top-10 left-20"></div>

        <div className="absolute w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl bottom-0 right-0"></div>

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white z-10"
        >
          <h1 className="text-6xl font-extrabold leading-tight">
            Smart Bus <br /> Routing
          </h1>

          <p className="mt-6 text-xl text-blue-100">
            Faster • Smarter • Safer Transportation
          </p>

          <div className="mt-10 text-lg space-y-3">
            <p>🚌 Live Bus Tracking</p>
            <p>📍 Smart Route Optimization</p>
            <p>⛽ Fuel Efficient System</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side */}

      <div className="flex-1 flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8"
        >
          <h2 className="text-4xl font-bold text-white mb-2 capitalize">
            {role} Login
          </h2>

          <p className="text-blue-100 mb-8">
            Login to continue
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}

            <div className="relative mb-5">
              <FaEnvelope className="absolute left-4 top-4 text-gray-500" />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                required
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-800 outline-none focus:ring-4 focus:ring-cyan-300"
              />
            </div>

            {/* Password */}

            <div className="relative mb-4">
              <FaLock className="absolute left-4 top-4 text-gray-500" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password (6-8 characters)"
                value={password}
                onChange={handlePasswordChange}
                minLength={6}
                maxLength={8}
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-white text-gray-800 outline-none focus:ring-4 focus:ring-cyan-300"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-4 top-4 text-gray-500"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-between text-white text-sm mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                Remember Me
              </label>

              <Link
                to={`/forgot-password/${role}`}
                className="hover:text-cyan-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <p className="text-center text-white mt-8">
            Don&apos;t have an account?

            <Link
              to="/register"
              state={{ role }}
              className="ml-2 font-bold text-cyan-300 hover:text-white"
            >
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}