import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  role,
}) {
  const token = localStorage.getItem("token");

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  let userRole =
    localStorage.getItem("userRole");

  try {
    const currentUserString =
      localStorage.getItem("currentUser");

    const userString =
      localStorage.getItem("user");

    const storedUser = currentUserString
      ? JSON.parse(currentUserString)
      : userString
        ? JSON.parse(userString)
        : null;

    userRole =
      userRole ||
      storedUser?.role ||
      "";
  } catch (error) {
    console.error(
      "Unable to read stored user:",
      error
    );
  }

  if (!token || !isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}