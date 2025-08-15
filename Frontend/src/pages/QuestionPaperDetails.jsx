import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function QuestionPaperDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});

  const [addingNew, setAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "",
    marks: "",
  });

  useEffect(() => {
    async function fetchPaper() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/question-paper/${id}`
        );

        setPaper(res.data.paper);
        setQuestions(res.data.questions);
      } catch (err) {
        console.error("Failed to fetch question paper", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPaper();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (!paper) {
    return <div className="p-6 text-red-600">Question paper not found.</div>;
  }

  const handleDeleteQuestionPaper = async () => {
    if (
      !window.confirm("Are you sure you want to delete this question paper?")
    ) {
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/question-paper/${id}`
      );

      alert("Question paper deleted successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to delete question paper.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/question/${questionId}`
      );

      alert("Question deleted successfully!");

      // Refresh questions list after deletion:
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete question.");
    }
  };

  const handleEditQuestion = (question) => {
    console.log(question);
    setEditingQuestionId(question.id);
    setEditedQuestion({
      question_text: question.text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
      marks: question.marks,
    });
  };

  const handleEditChange = (field, value) => {
    setEditedQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveQuestion = async (questionId) => {
    try {
      console.log("Edited question payload:", editedQuestion);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/Editquestion/${questionId}`,
        editedQuestion
      );

      alert("Question updated successfully!");

      // Refresh local questions array:
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...editedQuestion } : q))
      );

      setEditingQuestionId(null);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update question.");
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestion({});
  };

  const handleNewChange = (field, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewQuestion = async () => {
    const payload = {
      ...newQuestion,
      question_paper_id: id,
    };

    console.log("New question payload:", payload);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/newquestion`,
        payload
      );

      alert("New question added successfully!");

      // Reload the paper data (or append manually if you prefer)
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/question-paper/${id}`
      );
      setQuestions(res.data.questions);

      setAddingNew(false);
      setNewQuestion({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "",
        marks: "",
      });
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Failed to add new question.");
    }
  };

  const handleCancelNew = () => {
    setAddingNew(false);
    setNewQuestion({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "",
      marks: "",
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Manage Question Paper
      </h1>

      <div className="bg-white shadow rounded p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Paper Details</h2>
        <p>
          <strong>Name:</strong> {paper.name}
        </p>
        <p>
          <strong>Total Marks:</strong> {paper.total_marks}
        </p>
        <p>
          <strong>Duration:</strong> {paper.duration_minutes} minutes
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleDeleteQuestionPaper}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-700"
          >
            Delete Question Paper
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Admin Panel
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Questions</h2>

        {questions.length > 0 ? (
          <ul className="space-y-4">
            {questions.map((q) => (
              <li key={q.id} className="p-4 border rounded hover:bg-gray-50">
                {editingQuestionId === q.id ? (
                  <>
                    <input
                      type="text"
                      value={editedQuestion.question_text}
                      onChange={(e) => handleEditChange("question_text", e.target.value)}
                      placeholder="text"
                      className="w-full px-3 py-2 border rounded mb-2"
                    />

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <input
                        type="text"
                        value={editedQuestion.option_a}
                        onChange={(e) =>
                          handleEditChange("option_a", e.target.value)
                        }
                        placeholder="Option A"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        value={editedQuestion.option_b}
                        onChange={(e) =>
                          handleEditChange("option_b", e.target.value)
                        }
                        placeholder="Option B"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        value={editedQuestion.option_c}
                        onChange={(e) =>
                          handleEditChange("option_c", e.target.value)
                        }
                        placeholder="Option C"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        value={editedQuestion.option_d}
                        onChange={(e) =>
                          handleEditChange("option_d", e.target.value)
                        }
                        placeholder="Option D"
                        className="px-3 py-2 border rounded"
                      />
                    </div>

                    <input
                      type="text"
                      value={editedQuestion.correct_option}
                      onChange={(e) =>
                        handleEditChange("correct_option", e.target.value)
                      }
                      placeholder="Correct option (A/B/C/D)"
                      className="w-full px-3 py-2 border rounded mb-3"
                    />

                    <input
                      type="number"
                      placeholder="Marks"
                      value={editedQuestion.marks}
                      onChange={(e) =>
                        handleEditChange(
                          "marks",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border rounded mb-3"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveQuestion(q.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-2">
                      <strong>Question:</strong> {q.text}
                    </p>
                    <ul className="list-disc pl-5 text-gray-700">
                      <li>A: {q.option_a}</li>
                      <li>B: {q.option_b}</li>
                      <li>C: {q.option_c}</li>
                      <li>D: {q.option_d}</li>
                    </ul>
                    <p className="mt-2 text-green-700 font-semibold">
                      Correct Answer: {q.correct_option}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEditQuestion(q)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No questions added yet.</p>
        )}

        {addingNew ? (
          <div className="border border-gray-300 p-4 rounded mb-4 mt-6 space-y-3">
            <input
              type="text"
              placeholder="Question text"
              value={newQuestion.text}
              onChange={(e) => handleNewChange("text", e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Option A"
                value={newQuestion.option_a}
                onChange={(e) => handleNewChange("option_a", e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Option B"
                value={newQuestion.option_b}
                onChange={(e) => handleNewChange("option_b", e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Option C"
                value={newQuestion.option_c}
                onChange={(e) => handleNewChange("option_c", e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Option D"
                value={newQuestion.option_d}
                onChange={(e) => handleNewChange("option_d", e.target.value)}
                className="px-3 py-2 border rounded"
              />
            </div>

            <input
              type="text"
              placeholder="Correct option (A/B/C/D)"
              value={newQuestion.correct_option}
              onChange={(e) =>
                handleNewChange("correct_option", e.target.value)
              }
              className="w-full px-3 py-2 border rounded"
            />

            <input
              type="number"
              placeholder="Marks"
              value={newQuestion.marks}
              onChange={(e) =>
                handleNewChange(
                  "marks",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border rounded"
            />

            <div className="flex gap-2">
              <button
                onClick={handleSaveNewQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelNew}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setAddingNew(true)}
          >
            Add New Question
          </button>
        )}
      </div>
    </div>
  );
}
