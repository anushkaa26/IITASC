import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/login";
import Home from "./components/home";
import AnyPage from "./components/anypage";
import Registration from "./components/registration";
import Courses from "./components/courses";
import Instructor from "./components/instructor";
import InstructorInfo from "./components/instructor_info";
import CoursesInfo from "./components/course_info";
import RunningCourses from "./components/running_courses";
import RunningCourseInfo from "./components/running_course_info";
import Navigation from './components/navbar';
import './App.css';

function App() {
  return (
    <BrowserRouter>
     <div>
       <NavigationBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route exact path="/home" element={<Home />} />
        <Route path="/home/registration" element={<Registration />} />
        <Route path="/course" element={<Courses />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/instructor/:instructor_id" element={<InstructorInfo />} />
        <Route path="/course/:course_id" element={<CoursesInfo />} />
        <Route path="/course/running" element={<RunningCourses />} />
        <Route path="/course/running/:dept_name" element={<RunningCourseInfo />} />
        <Route path="*" element={<AnyPage />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

function NavigationBar() {
  const location = useLocation();

  return location.pathname !== "/login" && <Navigation />;
}

export default App;
