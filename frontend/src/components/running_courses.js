import { useEffect, useState } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
// import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";



const RunningCourses = () => {
  const [running_courses, setRunningCourses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/course/running').then(res => {
      if(res.data.notlog){
        window.location.href = '/login';
      } else {
        setRunningCourses(res.data.running_courses_dept);
        setLoading(false);
      }
    }).catch(err => console.error(err));
  }, [running_courses]);


  if(loading){
    return <></>    
  }
  else{  
    return (
      <div>
        <br></br>
        <h1 style={{ fontSize: '1.5em' }}><b> Departments offering courses running in the semester: </b></h1>

        <br></br>
        <Table striped bordered hover style={{width: '30%', border: '1rem black',}}>
          <thead>
            <tr>
            <th>Department</th>
            </tr>
          </thead>
          <tbody>
          {running_courses.map(course=>(
            <tr key={course.course_id}>
              <td><Link to={`/course/running/${course.dept_name}`}>{course.dept_name}</Link></td>
            </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
};
export default RunningCourses;
