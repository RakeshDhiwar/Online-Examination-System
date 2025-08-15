import React, { useEffect, useState, useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/auth-context"; // Assuming this context provides user and setUser
import { Menu, X } from "lucide-react"; // Icons for hamburger menu

export default function MainLayout() {
  const navigate = useNavigate();
  // Access user state and setUser function from AuthContext
  const { user, setUser } = useContext(AuthContext);
  // State to control the visibility of the mobile menu
  const [isOpen, setIsOpen] = useState(false);
  // State to control the visibility and content of the notification message
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Effect to check for a stored JWT token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode the token and set user data if valid
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        // Log error, remove invalid token, and clear user state
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, [setUser]); // Dependency array ensures effect runs only when setUser changes

  // Handles user logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    setUser(null); // Clear user state
    setNotificationMessage("You’ve logged out successfully!"); // Set notification message
    setShowNotification(true); // Show notification
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage("");
    }, 3000);
    navigate("/"); // Redirect to home page
  };

  // Toggles the mobile menu visibility
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-inter">
      {/* Notification Message Display */}
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-500 text-white text-center shadow-lg transition-all duration-300 ease-in-out rounded-b-lg">
          {notificationMessage}
          <button
            onClick={() => setShowNotification(false)}
            className="absolute top-1 right-2 text-white text-lg font-bold p-1"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Site Title/Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 tracking-wide rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Online Examination System
          </Link>

          {/* Desktop Navigation (visible on medium screens and up) */}
          <nav className=" md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-3 rounded-md hover:bg-gray-100"
            >
              Home
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-3 rounded-md hover:bg-gray-100"
            >
              Contact Us
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-3 rounded-md hover:bg-gray-100"
              >
                Admin
              </Link>
            )}
            {user?.role === "student" && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-3 rounded-md hover:bg-gray-100"
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger Button (visible on screens smaller than medium) */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu (conditionally rendered with smooth transition) */}
        <nav
          className={`md:hidden px-4 pb-4 flex flex-col gap-3 transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-screen opacity-100 py-2"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMenu} // Close menu on link click
          >
            Home
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMenu} // Close menu on link click
          >
            Contact Us
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors duration-200"
              onClick={toggleMenu} // Close menu on link click
            >
              Admin
            </Link>
          )}
          {user?.role === "student" && (
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors duration-200"
              onClick={toggleMenu} // Close menu on link click
            >
              Dashboard
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                toggleMenu(); // Close menu after logout
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 w-full text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={toggleMenu} // Close menu on link click
            >
              Login
            </Link>
          )}
        </nav>
      </header>

      <div className="hidden md:flex bg-red-500 text-white p-4">
        If you can see me in red, Tailwind is working.
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <Outlet /> {/* Renders child routes */}
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-gray-300 py-4 text-center text-sm rounded-t-lg">
        &copy; {new Date().getFullYear()} Online Examination System. All rights
        reserved.
      </footer>
    </div>
  );
}
