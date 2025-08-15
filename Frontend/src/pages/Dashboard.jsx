import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("TOKEN >>>", token);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    }
  };

  useEffect(() => {
    if (!data || !data.user || !data.user.id) return;

    async function fetchStudent() {
      try {
        const resResults = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/student/${
            data.user.id
          }/results`
        );
        setResults(resResults.data);
        console.log(resResults.data);
      } catch (err) {
        console.error("Failed to fetch student details", err);
      }
    }

    fetchStudent();
  }, [data]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-gray-600">Loading...</p>;
  }

  const handleStartExam = (paperId) => {
    navigate(`/exam/${paperId}`);
  };

  // Storing Attempts Score
  const attemptsByPaper = {};
  data.results.forEach((result) => {
    if (!attemptsByPaper[result.paper_id]) {
      attemptsByPaper[result.paper_id] = [];
    }
    attemptsByPaper[result.paper_id].push(result);
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-6  md:text-left">
        Welcome, {data.user.username}!
      </h1>

      {/* Course Badge / Card */}
      <div className="mb-8 flex  md:justify-start">
        <div className="inline-block bg-blue-50 border border-blue-200 text-blue-800 text-sm md:text-base font-semibold px-4 py-2 rounded-full shadow-sm">
          Course: {data.user.course}
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center md:text-left">
        Available Papers:
      </h2>

      {data.papers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.papers.map((paper) => {
            const attempts = attemptsByPaper[paper.id] || [];

            return (
              <div
                key={paper.id}
                className="bg-white border border-gray-200 shadow-md rounded-lg p-5 flex flex-col justify-between hover:shadow-xl transition duration-300"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-1">
                    <span className="font-medium">Marks:</span>{" "}
                    {paper.total_marks}
                  </p>
                  <p className="text-gray-700 text-sm mb-4">
                    <span className="font-medium">Duration:</span>{" "}
                    {paper.duration} minutes
                  </p>

                  {attempts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-gray-800 font-semibold text-sm mb-2">
                        Previous Attempts:
                      </h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {attempts.map((att, idx) => (
                          <li key={att.taken_at}>
                            Attempt {idx + 1}:{" "}
                            <span className="font-semibold">{att.score}</span>{" "}
                            marks
                            <span className="ml-2 text-gray-500">
                              ({new Date(att.taken_at).toLocaleString()})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartExam(paper.id)}
                  className="mt-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                >
                  Start Exam
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center md:text-left">
          No papers available for your course.
        </p>
      )}

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
                  <td className="px-4 py-3 text-sm text-gray-700">{r.score}</td>
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
    </div>
  );
}
