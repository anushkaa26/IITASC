import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';



const Home = () => {
  const [student, setStudent] = useState(null);
  const [prev_courses, setPrevCourses] = useState(null);
  const [cur_courses, setCurCourses] = useState(null);
  const [coursesBySemester, setCoursesBySemester] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/home').then(res => {
      if(res.data.notlog){
        window.location.href = '/login';
      } else {
        setStudent(res.data.student);
        setPrevCourses(res.data.prev_courses);
        setCurCourses(res.data.cur_courses);
        setLoading(false);
      }
    }).catch(err => console.error(err));
  }, []);

  
    // Group courses by semester
   
    useEffect(() => {
      if (prev_courses) {
        const groupByTwoKeys = (arr, key1, key2) => {
          return arr.reduce((result, item) => {
            const id = item[key1] + '-' + item[key2];
            if (!result[id]) {
              result[id] = [];
            }
            result[id].push(item);
            return result;
          }, {});
        };
        
        setCoursesBySemester( Object.values(groupByTwoKeys(prev_courses, 'year', 'semester')));
      }
    }, [prev_courses]);
      
    console.log(coursesBySemester)

  const drop = (course_id) => {
    axios.post("http://localhost:8080/home/drop", {course_id: course_id}).then((response) => {
      if (response.data.notlog) {
        window.location.href = '/login';
      } else {
        setCurCourses(cur_courses.filter(course => course.course_id !== course_id));
      }
    });
  };

  if(loading){
    return <></>    
  }
  else{  
    return (
      <div>
        <Table bordered style={{ margin: '1rem' , width: '50%'}} className="studenttable">
          <tbody><tr>
            <th style={{backgroundColor: 'rgb(170,170,170)' }}>ID</th>
            <td style={{backgroundColor: 'rgb(200,200,200)' }}>{student.id}</td>
            <th style={{backgroundColor: 'rgb(170,170,170)' }}>Name </th>
            <td style={{backgroundColor: 'rgb(200,200,200)' }}>{student.name}</td>
          </tr>
          <tr>
            <th style={{backgroundColor: 'rgb(170,170,170)' }}>Department</th>
            <td style={{backgroundColor: 'rgb(200,200,200)' }}>{student.dept_name}</td>
            <th style={{backgroundColor: 'rgb(170,170,170)' }}>Total Credits</th>
            <td style={{backgroundColor: 'rgb(200,200,200)' }}>{student.tot_cred}</td>
          </tr>              
        </tbody></Table>
        
        {/* <p>Welcome to your Home page </p>
        <h1 style={{ fontSize: '1em' }}>ID: {student.id} </h1>
        <h1>Name: {student.name} </h1>
        <h1>Department: {student.dept_name} </h1>
        <h1>Total Credits: {student.tot_cred} </h1>
        <h1> Courses taken in previous semesters: </h1> */}
      <br></br>
      <h1 style={{ fontSize: '1.5em' }}><b>Current Courses: </b></h1>

      <Table striped bordered hover>
        <thead>
        <tr>
          <th style={{ width: '20%' }}>Course ID</th>
          <th style={{ width: '30%' }}>Title</th>
          <th style={{ width: '20%' }}>Section</th>
          <th style={{ width: '15%' }}>Credits</th>
          <th style={{ width: '15%' }}>Drop</th>
        </tr>
        </thead>
        <tbody>
        {cur_courses.map(course=>(
        <tr key={course.course_id}>
          <td>{course.course_id}</td>
          <td>{course.title}</td>
          <td>{course.sec_id}</td>
          <td>{course.credits}</td>
          <td><Button variant="outline-danger" onClick={() => drop(course.course_id)}>Drop</Button>{' '}</td>
        </tr>
        ))}
        </tbody>
      </Table>

      <br></br>
      <h1 style={{ fontSize: '1.5em' }}><b> Previous Courses: </b></h1>
      {coursesBySemester.map(sem => 
          <div>
            <br></br>
            <h2 style={{ fontSize: '1.2em' }}>{sem[0].semester} - {sem[0].year}</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                <th style={{ width: '20%' }}>Course ID</th>
                <th style={{ width: '30%' }}>Title</th>
                <th style={{ width: '20%' }}>Section</th>
                <th style={{ width: '15%' }}>Credits</th>
                <th style={{ width: '15%' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {sem.map(course => (
                  <tr key={course.course_id}>
                    <td>{course.course_id}</td>
                    <td>{course.title}</td>
                    <td>{course.sec_id}</td>
                    <td>{course.credits}</td>
                    <td>{course.grade}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
        )}       
      </div>
    );
  }
};
export default Home;
