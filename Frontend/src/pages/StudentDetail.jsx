import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        // fetch student info
        const resStudent = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/student/${id}`
        );
        setStudent(resStudent.data);

        
        // fetch student's results
        const resResults = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/student/${id}/results`
        );
        setResults(resResults.data);
        console.log(resResults.data);
      } catch (err) {
        console.error("Failed to fetch student details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!student) return <div className="p-6">Student not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Student Details
      </h1>

      <div className="mb-8 p-4 md:p-6 bg-white shadow rounded space-y-2">
        <p className="text-gray-700"><strong>Username:</strong> {student.username}</p>
        <p className="text-gray-700"><strong>Role:</strong> {student.role}</p>
        <p className="text-gray-700"><strong>Course:</strong> {student.course}</p>
      </div>

      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
        Exam Results
      </h2>

      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow border rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Paper
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Correct
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Wrong
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total Qs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Taken At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.paper_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.score}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.correct_answers}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.wrong_answers}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.total_questions}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(r.taken_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No results found for this student.</p>
      )}

      <button
        onClick={() => navigate("/admin")}
        className="mt-8 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Back to Admin
      </button>
    </div>
  );
}
