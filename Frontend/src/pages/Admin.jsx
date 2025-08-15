import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Admin() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paperSearchTerm, setPaperSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchQuestionPapers();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/students`
      );
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchQuestionPapers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/allquestion-papers`
      );
      setPapers(res.data);
    } catch (err) {
      console.error("Failed to fetch question papers", err);
    }
  };

  // ✅ FIX: filter using p.name instead of p.title
  const filteredPapers = papers.filter((p) =>
    p.name?.toLowerCase().includes(paperSearchTerm.toLowerCase())
  );

  const filteredStudents = students.filter((s) =>
    s.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>

      {/* Top Buttons */}
      <div className="flex gap-4 mb-10">
        <button
          onClick={() => navigate("/register")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          New Registration
        </button>
        <button
          onClick={() => navigate("/admin/add-question-paper")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Question Paper
        </button>
      </div>

      {/* ========================== */}
      {/* QUESTION PAPERS TABLE */}
      {/* ========================== */}
      <h2 className="text-xl font-semibold mb-4">Question Papers</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search question papers..."
          value={paperSearchTerm}
          onChange={(e) => setPaperSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredPapers.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white shadow border border-gray-200 rounded">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Title</th>
                <th className="py-3 px-4 text-left font-semibold">Course</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Duration (minutes)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/admin/question-paper/${p.id}`)}
                  className="
                    border-t
                    hover:bg-blue-50
                    hover:text-blue-700
                    cursor-pointer
                    transition-colors
                    duration-200
                  "
                >
                  {/* ✅ FIX: use p.name instead of p.title */}
                  <td className="py-3 px-4">{p.name}</td>

                  <td className="py-3 px-4">{p.course_name}</td>

                  {/* ✅ FIX: use p.duration_minutes instead of p.duration */}
                  <td className="py-3 px-4">{p.duration_minutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No question papers found.</p>
      )}

      {/* ========================== */}
      {/* STUDENTS TABLE */}
      {/* ========================== */}
      <h2 className="text-xl font-semibold mb-4 mt-10">Registered Students</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white shadow border border-gray-200 rounded">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Username</th>
                <th className="py-3 px-4 text-left font-semibold">Role</th>
                <th className="py-3 px-4 text-left font-semibold">Course</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/admin/student/${s.id}`)}
                  className="
                    border-t
                    hover:bg-blue-50
                    hover:text-blue-700
                    cursor-pointer
                    transition-colors
                    duration-200
                  "
                >
                  <td className="py-3 px-4">{s.username}</td>
                  <td className="py-3 px-4 capitalize">{s.role}</td>
                  <td className="py-3 px-4">{s.course || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No matching students found.</p>
      )}
    </div>
  );
}
