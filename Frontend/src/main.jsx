import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import AddQuestionPaper from "./pages/AddQuestionPaper.jsx";
import StudentDetail from "./pages/StudentDetail";
import QuestionPaperDetails from "./pages/QuestionPaperDetails.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ExamPage from "./pages/ExamPage.jsx";

import MainLayout from "./components/MainLayout.jsx";

import AuthProvider from "./context/AuthProvider.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
//react router
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<App />} />
      <Route path="login" element={<Login />} />
     
      <Route path="dashboard" element={<Dashboard />} />

      <Route path="admin" element={
        <RequireAdmin><Admin /></RequireAdmin> } />

       <Route path="register" element={<RequireAdmin><Register /></RequireAdmin>} />

      <Route path="/admin/add-question-paper" element={<RequireAdmin><AddQuestionPaper /></RequireAdmin>} />

      <Route path="/admin/student/:id" element={<RequireAdmin><StudentDetail /></RequireAdmin>} />
      <Route
        path="/admin/question-paper/:id"
        element={<RequireAdmin><QuestionPaperDetails /></RequireAdmin> }
      />
      <Route path="/student/dashboard/:id" element={<StudentDashboard />} />
    </Route>

    {/* No need of layout in exam page */}
    <Route path="/exam/:paperId" element={<ExamPage />} />
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
