import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );
      const token = res.data.token;
      setToken(token);
      setMessage("Login successful!");

      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      setUser(decoded);

      setTimeout(() => {
        navigate("/");
      }, 1500);

      setFormData({
        username: "",
        password: "",
      });
    } catch (err) {
      console.log(err);
      setMessage(
        err.response?.data?.message || "Login failed. Please try again."
      );
      setToken(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text mb-8">
          Online Examination System
        </h2>

        <h3 className="text-xl text-center font-semibold text-gray-700 mb-4">
          Login to Your Account
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Login
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 text-center font-semibold ${
              token ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* <div className="mt-6 text-center">
          <span className="text-gray-600">Don’t have an account?</span>{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Register
          </Link>
        </div> */}
      </div>
    </div>
  );
}
