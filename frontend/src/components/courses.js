import { useEffect, useState } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";



const Courses = () => {
  const [courses, setCourses] = useState(null);
  // const [running_courses, setRunningCourses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/course').then(res => {
      if(res.data.notlog){
        window.location.href = '/login';
      } else {
        setCourses(res.data.courses);
        // setRunningCourses(res.data.running_courses);
        setLoading(false);
      }
    }).catch(err => console.error(err));
  }, );


  if(loading){
    return <></>    
  }
  else{  
    return (
      <div>
        <br></br>
        <h1 style={{ fontSize: '1.5em' }}><b>Courses running this semester: </b></h1>
        <Button variant="outline-info" href="/course/running">Running Courses</Button>
        <br></br>
        <br></br>
        <h1 style={{ fontSize: '1.5em' }}><b> All courses: </b></h1>

      <Table striped bordered hover>
      <thead>
        <tr>
        <th>Course id</th>
        <th>Title</th>
        </tr>
      </thead>
      <tbody>
      {courses.map(course=>(
        <tr key={course.course_id}>
          <td>
      <Link to={`/course/${course.course_id}`}>{course.course_id}</Link>
    </td>
          <td>{course.title}</td>
        </tr>
        ))}
      </tbody>
    </Table>
      </div>
    );
  }
};
export default Courses;
