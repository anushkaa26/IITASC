import { useEffect, useState } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
// import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";



const Instructor = () => {
  const [instructors, setInstructors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/instructor').then(res => {
      if(res.data.notlog){
        window.location.href = '/login';
      } else {
        // setCourses(res.data.courses);
        setInstructors(res.data.instructors);
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
        <h1 style={{ fontSize: '1.5em' }}><b> All Instructors:</b> </h1>

      <Table striped bordered hover>
      <thead>
        <tr>
        <th>Name</th>
        <th>Department</th>
        </tr>
      </thead>
      <tbody>
      {instructors.map(instr=>(
        <tr key={instr.id}>
          <td><Link to={`/instructor/${instr.id}`}>{instr.name}</Link></td>
          <td>{instr.dept_name}</td>
        </tr>
        ))}
      </tbody>
    </Table>
      </div>
    );
  }
};
export default Instructor;
