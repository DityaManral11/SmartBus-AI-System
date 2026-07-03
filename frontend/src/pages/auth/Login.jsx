import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

export default function Login() {
  const { role } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">

      {/* Left */}
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

      {/* Right */}

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

          <div className="relative mb-5">

            <FaEnvelope className="absolute left-4 top-4 text-gray-500" />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-800 outline-none focus:ring-4 focus:ring-cyan-300"
            />

          </div>

          <div className="relative mb-4">

            <FaLock className="absolute left-4 top-4 text-gray-500" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-white text-gray-800 outline-none focus:ring-4 focus:ring-cyan-300"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>

          <div className="flex justify-between text-white text-sm mb-6">

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember Me
            </label>

            <button>Forgot Password?</button>

          </div>

          <button
            onClick={() => {
              if (!email.trim()) {
                alert("Please enter your email.");
                return;
              }

              if (!password.trim()) {
                alert("Please enter your password.");
                return;
              }

              const users = JSON.parse(localStorage.getItem("users")) || [];

              if (users.length === 0) {
                alert("Please register first.");
                return;
              }

              const loggedUser = users.find(
                (user) =>
                  user.email === email &&
                  user.password === password &&
                  user.role === role
              );

              if (!loggedUser) {
                alert("Invalid Email or Password");
                return;
              }
              console.log("Logged User:", loggedUser);

              localStorage.setItem("user", JSON.stringify(loggedUser));

              localStorage.setItem(
                "currentUser",
                JSON.stringify(loggedUser)
              );

              console.log(
                "Current User:",
                localStorage.getItem("currentUser")
              );

              localStorage.setItem("isLoggedIn", "true");
              localStorage.setItem("userRole", role);

              if (role === "admin") {
                navigate("/admin/dashboard");
              } else if (role === "student") {
                navigate("/student/dashboard");
              } else {
                navigate("/driver/dashboard");
              }
            }}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition duration-300"
          >
            Login
          </button>

          <p className="text-center text-white mt-8">

            Don't have an account?

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