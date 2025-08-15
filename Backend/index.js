import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log("Server running");
});

//Mysql connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Register route
app.post("/api/auth/register", async (req, res) => {
  const { username, password, role, course } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password, role, course) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, role || "student", course || null]
    );

    res.json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//Login route
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        course: user.course,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//get student dashboard data
app.get("/api/dashboard", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const courseName = decoded.course;
    const userId = decoded.userId;

    // fetch papers for this course
    const [papers] = await db.query(
      `SELECT qp.id, qp.title, qp.duration, qp.total_marks
       FROM question_papers qp
       JOIN courses c ON c.id = qp.course_id
       WHERE c.name = ?`,
      [courseName]
    );

    //fetch username
    const [Name] = await db.query(
      `SELECT username
       FROM users
       WHERE id = ?`,
      [userId]
    );
    const name = Name[0]?.username || null;

    //fetch results
    const [results] = await db.query(
      `SELECT
  p.id AS paper_id,
  p.title,
  p.total_marks,
  p.duration,
  r.id AS result_id,
  r.score,
  r.taken_at
FROM
  question_papers p
LEFT JOIN
  results r
    ON p.id = r.question_paper_id
    AND r.user_id = 6
WHERE
  p.course_id = 1
ORDER BY
  p.id, r.taken_at;
`,
      [courseName]
    );
    res.json({
      user: {
        id: userId,
        username: name,
        role: decoded.role,
        course: courseName,
      },
      papers,
      results,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//get courses route
app.get("/api/courses", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM courses");
  res.json(rows);
});

//get papers by courseId
app.get("/api/papers/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const [rows] = await db.query(
    "SELECT * FROM question_papers WHERE course_id = ?",
    [courseId]
  );
  res.json(rows);
});

//post create question paper
app.post("/api/papers", async (req, res) => {
  const { courseId, name, totalMarks, durationMinutes } = req.body;
  await db.query(
    "INSERT INTO question_papers (course_id, name, total_marks, duration_minutes) VALUES (?, ?, ?, ?)",
    [courseId, name, totalMarks, durationMinutes]
  );
  res.json({ message: "Paper created" });
});

//post add question
app.post("/api/questions", async (req, res) => {
  const {
    questionPaperId,
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    marks,
  } = req.body;

  await db.query(
    `INSERT INTO questions 
     (question_paper_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      questionPaperId,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      marks,
    ]
  );

  res.json({ message: "Question added" });
});

// Get all students for admin page
app.get("/api/admin/students", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, role, course FROM users WHERE role = 'student'"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all question papers
app.get("/api/admin/question-papers", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT qp.id, qp.name, c.name AS course_name, qp.total_marks, qp.duration_minutes
      FROM question_papers qp
      LEFT JOIN courses c ON c.id = qp.course_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//GET /api/admin/student/:id
app.get("/api/admin/student/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT id, username, role, course FROM users WHERE id = ?`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching student." });
  }
});

//GET /api/admin/student/:id/results
// app.get("/api/admin/student/:id/results", async (req, res) => {
//   const studentId = req.params.id;

//   try {
//     const [rows] = await db.query(
//       `
//       SELECT
//         r.id,
//         qp.name AS paper_name,
//         r.score,
//         r.correct_answers,
//         r.wrong_answers
//       FROM
//         results r
//       JOIN
//         question_papers qp ON r.question_paper_id = qp.id
//       WHERE
//         r.user_id = ?
//       `,
//       [studentId]
//     );

//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error fetching student results." });
//   }
// });

//get detail of question papers
app.get("/api/admin/question-paper/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get paper details
    const [paperRows] = await db.query(
      "SELECT * FROM question_papers WHERE id = ?",
      [id]
    );

    if (paperRows.length === 0) {
      return res.status(404).json({ message: "Question paper not found" });
    }

    const paper = paperRows[0];

    // Get questions for this paper
    const [questions] = await db.query(
      "SELECT * FROM questions WHERE question_paper_id = ?",
      [id]
    );

    res.json({
      paper: {
        id: paper.id,
        name: paper.title,
        course_id: paper.course_id,
        total_marks: paper.total_marks,
        duration_minutes: paper.duration,
      },
      questions: questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// get all question papers
app.get("/api/admin/allquestion-papers", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
  qp.id, 
  qp.title AS name,
  c.name AS course_name, 
  qp.total_marks, 
  qp.duration AS duration_minutes
FROM question_papers qp
LEFT JOIN courses c ON c.id = qp.course_id
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//post new question paper
app.post("/api/admin/question-papers", async (req, res) => {
  const { name, course_id, total_marks, duration_minutes, questions } =
    req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO question_papers (title, course_id, total_marks, duration) 
   VALUES (?, ?, ?, ?)`,
      [name, course_id, total_marks, duration_minutes]
    );

    const paperId = result.insertId;

    for (const q of questions) {
      await db.query(
        `INSERT INTO questions 
         (question_paper_id, text, option_a, option_b, option_c, option_d, correct_option, marks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paperId,
          q.text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_option,
          q.marks,
        ]
      );
    }

    res.json({ message: "Question paper and questions saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//delete question paper
app.delete("/api/admin/question-paper/:id", async (req, res) => {
  const id = req.params.id;

  try {
    //delete questions under that paper
    await db.query(`DELETE FROM questions WHERE question_paper_id = ?`, [id]);

    await db.query(`DELETE FROM results WHERE question_paper_id = ?`, [id]);

    await db.query(`DELETE FROM question_papers WHERE id = ?`, [id]);

    res.json({ message: "Question paper deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting question paper." });
  }
});

//delete question
app.delete("/api/admin/question/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.query(`DELETE FROM questions WHERE id = ?`, [id]);
    res.json({ message: "Question deleted." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete question." });
  }
});

//put edit question
app.put("/api/admin/Editquestion/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  await db.query(
    `UPDATE questions
     SET text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?
     WHERE id = ?`,
    [
      data.question_text,
      data.option_a,
      data.option_b,
      data.option_c,
      data.option_d,
      data.correct_option,
      id,
    ]
  );

  res.json({ message: "Question updated successfully." });
});

// POST: Add a new question to a question paper
app.post("/api/admin/newquestion", async (req, res) => {
  const {
    text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
    question_paper_id,
    marks,
  } = req.body;

  console.log(req.body);

  if (!question_paper_id || !text) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    await db.query(
      `INSERT INTO questions 
      (text, option_a, option_b, option_c, option_d, correct_option, question_paper_id,marks) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        question_paper_id,
        marks,
      ]
    );

    res.status(201).json({ message: "Question added successfully." });
  } catch (error) {
    console.error("Error inserting question:", error);
    res.status(500).json({ message: "Failed to add question." });
  }
});

// Exam route
app.get("/api/exam/:paperId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const paperId = req.params.paperId;

    // get the paper itself (title, etc.)
    const [paperRows] = await db.query(
      `SELECT id, title, total_marks, duration 
       FROM question_papers 
       WHERE id = ?`,
      [paperId]
    );

    if (paperRows.length === 0) {
      return res.status(404).json({ message: "Question paper not found" });
    }

    const paper = paperRows[0];

    // fetch the questions for this paper
    const [questionRows] = await db.query(
      `SELECT id, text, option_a, option_b, option_c, option_d, marks 
       FROM questions 
       WHERE question_paper_id = ?`,
      [paperId]
    );

    res.json({
      paper,
      questions: questionRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching exam data." });
  }
});

// POST /api/exam/submit
app.post("/api/exam/submit", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { paperId, answers } = req.body;
  console.log("Received request:", req.body);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!paperId) {
    return res
      .status(400)
      .json({ message: "Missing paperId in request body." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch questions for this paper
    const [questions] = await db.query(
      "SELECT id, correct_option, marks FROM questions WHERE question_paper_id = ?",
      [paperId]
    );

    let score = 0;
    let correct = 0;
    let wrong = 0;

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (!selected) return;
      if (selected === q.correct_option) {
        score += q.marks;
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    const total = questions.length;

    await db.query(
      `INSERT INTO results (
        user_id,
        question_paper_id,
        score,
        correct_answers,
        wrong_answers,
        total_questions,
        taken_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, paperId, score, correct, wrong, total]
    );

    res.json({
      message: "Exam submitted successfully.",
      score,
      correct,
      wrong,
      total,
    });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ message: "Server error while submitting exam." });
  }
});

//get student result data
app.get("/api/admin/student/:id/results", async (req, res) => {
  try {
    const studentId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT
        r.id,
        qp.title AS paper_name,
        r.score,
        r.correct_answers,
        r.wrong_answers,
        r.total_questions,
        r.taken_at
      FROM results r
      JOIN question_papers qp ON r.question_paper_id = qp.id
      WHERE r.user_id = ?
      ORDER BY r.taken_at DESC
    `,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching student results:", err);
    res.status(500).json({ error: "Failed to fetch student results" });
  }
});


//translate route
import { translate } from '@vitalets/google-translate-api';

app.post('/api/translate', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const result = await translate(text, { to: 'hi' });
    res.json({ english: text, hindi: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});
