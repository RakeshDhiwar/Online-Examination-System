import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ExamPage = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const autoSubmittingRef = useRef(false); // ✅ Use ref instead of state

  const handleContextMenu = useCallback((e) => e.preventDefault(), []);
  const handleKeyDown = useCallback((e) => {
    const forbidden = ["c", "v", "x", "u", "s", "i"];
    if (
      (e.ctrlKey && forbidden.includes(e.key.toLowerCase())) ||
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key))
    ) {
      e.preventDefault();
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (!autoSubmittingRef.current) {
      alert("Tab switching is not allowed. Focus back to the exam.");
    }
  }, []);

  const preventBack = useCallback(() => {
    window.history.pushState(null, "", window.location.href);
  }, []);

  const goFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.warn("Fullscreen failed", err));
    }
  };
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    goFullscreen();
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("popstate", preventBack);
    preventBack();

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("popstate", preventBack);
    };
  }, [handleContextMenu, handleKeyDown, handleBlur, preventBack]);

  const removeRestrictions = () => {
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("popstate", preventBack);
    exitFullscreen();
  };

  const translateText = async (text) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/translate`,
        { text }
      );
      return response.data.hindi || text;
    } catch (err) {
      console.error("Translation error:", err);
      return text;
    }
  };

  const translateQuestions = async (questions) => {
    const translated = await Promise.all(
      questions.map(async (q) => {
        const translatedText = await translateText(q.text);
        const translatedOptions = {};
        for (let opt of ["a", "b", "c", "d"]) {
          translatedOptions[opt] = await translateText(q[`option_${opt}`]);
        }
        return {
          ...q,
          text_hi: translatedText,
          option_a_hi: translatedOptions.a,
          option_b_hi: translatedOptions.b,
          option_c_hi: translatedOptions.c,
          option_d_hi: translatedOptions.d,
        };
      })
    );
    return translated;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/exam/${paperId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.paper && Array.isArray(res.data.questions)) {
          setPaper(res.data.paper);
          const translated = await translateQuestions(res.data.questions);
          setQuestions(translated);
          if (res.data.paper.duration) {
            setTimeLeft(res.data.paper.duration * 60);
          }
        } else {
          setError("Unexpected response format from server.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load exam questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paperId]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      alert("Time is up! Submitting your exam...");
      handleSubmitExam();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleOptionSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitExam = async () => {
    autoSubmittingRef.current = true; // ✅ Mark to skip blur alert
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        paperId: paper.id,
        answers,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/exam/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Exam submitted successfully!");
      alert(`Your Score is: ${response.data.score}`);
      removeRestrictions();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error submitting exam. Please try again.");
    } finally {
      setSubmitting(false);
      autoSubmittingRef.current = false; // ✅ Re-enable blur check
    }
  };

  if (loading) return <div className="p-8 text-center">Loading exam...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="sticky top-0 bg-white z-10 p-2 shadow mb-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold text-blue-700">
          Exam - {paper?.title}
        </h1>
        <h2 className="text-lg font-semibold text-red-600">
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </h2>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="border p-4 rounded shadow bg-white">
              <p className="text-lg font-semibold mb-2">
                {idx + 1}. {q.text}
              </p>
              <p className="text-gray-700 mb-4 italic">{q.text_hi}</p>

              <div className="space-y-2">
                {["a", "b", "c", "d"].map((opt) => (
                  <label
                    key={opt}
                    className={`block p-2 rounded border cursor-pointer ${
                      answers[q.id] === opt
                        ? "bg-blue-100 border-blue-600"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleOptionSelect(q.id, opt)}
                      className="mr-2"
                    />
                    <span className="font-medium">{q[`option_${opt}`]}</span>
                    <br />
                    <span className="text-gray-600 text-sm">
                      {q[`option_${opt}_hi`]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition duration-300"
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No questions found for this exam.</p>
      )}
    </div>
  );
};

export default ExamPage;
