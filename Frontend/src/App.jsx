// import { useState } from 'react'
import "./App.css";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="text-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900 leading-tight">
          Online Examination System
        </h1>

        <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-8">
          Welcome to your centralized platform for conducting and taking exams
          securely.
        </p>

        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white text-sm sm:text-base md:text-lg px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default App;
