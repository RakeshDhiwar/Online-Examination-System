import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddQuestionPaper() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    course_id: "",
    total_marks: "",
    duration_minutes: "",
    questions: []
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/courses`
      );
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "",
          marks: "",
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/question-papers`,
        formData
      );

      setMessage("Question paper created successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to create question paper.");
    }
  };

 return (
  <div className="max-w-4xl mx-auto p-4 sm:p-6">
    <h1 className="text-2xl font-bold mb-4 text-blue-800 text-center sm:text-left">
      Add New Question Paper
    </h1>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic paper details */}
      <div>
        <label className="block mb-1 font-medium">Paper Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-300"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Course</label>
        <select
          name="course_id"
          value={formData.course_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-300"
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium">Total Marks</label>
          <input
            type="number"
            name="total_marks"
            value={formData.total_marks}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 font-medium">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Questions */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Questions</h2>

        {formData.questions.map((q, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 rounded mb-4 space-y-3"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Question {index + 1}</span>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>

            <input
              type="text"
              placeholder="Question text"
              value={q.text}
              onChange={(e) =>
                handleQuestionChange(index, "text", e.target.value)
              }
              required
              className="w-full px-3 py-2 border rounded"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Option A"
                value={q.option_a}
                onChange={(e) =>
                  handleQuestionChange(index, "option_a", e.target.value)
                }
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Option B"
                value={q.option_b}
                onChange={(e) =>
                  handleQuestionChange(index, "option_b", e.target.value)
                }
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Option C"
                value={q.option_c}
                onChange={(e) =>
                  handleQuestionChange(index, "option_c", e.target.value)
                }
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Option D"
                value={q.option_d}
                onChange={(e) =>
                  handleQuestionChange(index, "option_d", e.target.value)
                }
                className="px-3 py-2 border rounded"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Correct option (A/B/C/D)"
                value={q.correct_option}
                onChange={(e) =>
                  handleQuestionChange(index, "correct_option", e.target.value)
                }
                className="px-3 py-2 border rounded w-full sm:w-1/2"
              />

              <input
                type="number"
                placeholder="Marks"
                value={q.marks}
                onChange={(e) =>
                  handleQuestionChange(index, "marks", e.target.value)
                }
                className="px-3 py-2 border rounded w-full sm:w-1/2"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="mt-2 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add New Question
        </button>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Create Paper with Questions
      </button>
    </form>

    {message && (
      <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
    )}
  </div>
);

}
