import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";


export default function Register() {


  const location = useLocation();

  const defaultRole = location.state?.role || "";

  const [role, setRole] = useState(defaultRole);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [semester, setSemester] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleRegister = () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (role === "student" && (!rollNo || !semester)) {
      alert("Please fill Roll Number and Semester.");
      return;
    }

    if (role === "driver" && !licenseNo) {
      alert("Please enter License Number.");
      return;
    }

    if (role === "admin") {
      if (adminKey !== "ONLYADMINS") {
        alert("Invalid Admin Secret Key!");
        return;
      }
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const user = {
      name,
      email,
      phone,
      rollNo,
      semester,
      licenseNo,
      password,
      role,
    };

    const users = JSON.parse(localStorage.getItem("users")) || [];

    users.push(user);

    localStorage.setItem("users", JSON.stringify(users));

    if (role === "driver") {
      const drivers =
        JSON.parse(localStorage.getItem("drivers")) || [];

      const alreadyExists = drivers.some(
        (driver) => driver.email === email
      );

      if (!alreadyExists) {
        drivers.push({
          name,
          email,
          phone,
          licenseNo,
          bus: "",
          status: "Active",
        });

        localStorage.setItem(
          "drivers",
          JSON.stringify(drivers)
        );
      }
    }

    alert("Registration Successful!");

    navigate(`/login/${role}`);
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
            Join Smart Bus
          </h1>

          <p className="mt-6 text-xl text-blue-100">
            Create your account and enjoy smarter transportation.
          </p>

          <div className="mt-10 text-lg space-y-3">
            <p>🚌 Live Bus Tracking</p>
            <p>📍 Optimized Routes</p>
            <p>🔒 Secure Login</p>
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

          <h2 className="text-4xl font-bold text-white">
            Create Account 🚍
          </h2>

          <p className="text-blue-100 mt-2 mb-8 capitalize">
            Register as {role}
          </p>

          {/* Name */}

          <div className="relative mb-4">
            <FaUser className="absolute left-4 top-4 text-gray-500" />

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 py-4 rounded-xl outline-none bg-white"
            />
          </div>

          {/* Email */}

          <div className="relative mb-4">
            <FaEnvelope className="absolute left-4 top-4 text-gray-500" />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 py-4 rounded-xl outline-none bg-white"
            />
          </div>

          {/* Phone */}

          <div className="relative mb-4">

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-4 rounded-xl outline-none bg-white"
            />

          </div>

          {/*For Student*/}

          {role === "student" && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none bg-white"
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl outline-none bg-white"
                />
              </div>
            </>
          )}

          {/*For driver*/}

          {role === "driver" && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="License Number"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full px-4 py-4 rounded-xl outline-none bg-white"
              />
            </div>
          )}

          {/* For Admin */}

          {role === "admin" && (
            <div className="mb-4">
              <input
                type="password"
                placeholder="Admin Secret Key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-4 rounded-xl outline-none bg-white"
              />
            </div>
          )}



          {/* Password */}

          <div className="relative mb-4">

            <FaLock className="absolute left-4 top-4 text-gray-500" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl outline-none bg-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>

          {/* Confirm Password */}

          <div className="relative mb-6">

            <FaLock className="absolute left-4 top-4 text-gray-500" />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 py-4 rounded-xl outline-none bg-white"
            />

          </div>

          <button
            onClick={handleRegister}
            className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition"
          >
            Create Account
          </button>

          <p className="text-center text-white mt-8">

            Already have an account?

            <Link
              to={role ? `/login/${role}` : "/"}
              className="ml-2 font-bold text-cyan-300 hover:text-white"
            >
              Login
            </Link>

          </p>

        </motion.div>

      </div>

    </div>
  );
}