import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ForgotPassword() {

    const navigate = useNavigate();
    const { role } = useParams();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleReset = () => {

        if (!email || !newPassword || !confirmPassword) {
            alert("Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const users =
            JSON.parse(localStorage.getItem("users")) || [];

        const index = users.findIndex(
            user =>
                user.email === email &&
                user.role === role
        );

        if (index === -1) {
            alert("User not found");
            return;
        }

        users[index].password = newPassword;

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );

        alert("Password Updated Successfully");

        navigate(`/login/${role}`);
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-700 to-cyan-500">

            <div className="bg-white p-8 rounded-3xl shadow-xl w-[420px]">

                <h2 className="text-3xl font-bold mb-6">
                    Forgot Password
                </h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded-xl mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border p-3 rounded-xl mb-4"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full border p-3 rounded-xl mb-6"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    onClick={handleReset}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl"
                >
                    Update Password
                </button>

            </div>

        </div>
    );
}