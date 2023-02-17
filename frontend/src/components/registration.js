import { useEffect, useState } from "react";
import axios from "axios";
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";



function Registration () {
  const [courses, setCourses] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState([]);
  // const [sections, setSections] = useState('');

  // const useSelectedSection = (courseId) => {
  //   const [selectedSection, setSelectedSection] = useState('');
  //   useEffect(() => {
  //     setSections(prevState => ({ ...prevState, [courseId]: selectedSection }));
  //   }, [courseId, selectedSection, setSections]);
  //   return [selectedSection];
  // };

  const CourseRow = ({ course }) => {
    // const [selectedSection, setSelectedSection] = useSelectedSection(course.course_id);
    // setSelectedCourse([]);
    console.log(course);
    const [selectedSection, setSelectedSection] = useState("Select Section");

    useEffect(() => {}, [selectedSection]);
    return (
      <tr key={course.course_id}>
        <td><Link to={`/course/${course.course_id}`}>{course.course_id}</Link></td>
        
        <td>{course.title}</td>
        <td>
          <DropdownButton id="dropdown-basic-button" title={selectedSection} onSelect={(eventKey) => setSelectedSection(eventKey)}>
            {course.sections.map(section=>(
              <Dropdown.Item eventKey={section} key={section}>{section}</Dropdown.Item>
            ))}  
          </DropdownButton>
        </td>
        <td><Button variant="outline-info" onClick={() => register(course.course_id, selectedSection)}>Register</Button>{' '}</td>
      </tr>
    );
  };


  useEffect(() => {
    axios.get('http://localhost:8080/home/registration').then(res => {
      if(res.data.notlog){
        window.location.href = '/login';
      } else {
        let c = [];
        let temp = [];
        let distinct_courses = [];
        for(let i = 0; i < res.data.courses.length; i++){
          if(!distinct_courses.includes(res.data.courses[i].course_id)){
            distinct_courses.push(res.data.courses[i].course_id);
            c.push({course_id: res.data.courses[i].course_id,title: res.data.courses[i].title ,sections: [res.data.courses[i].sec_id]});
            temp.push({id: i, name: res.data.courses[i].course_id, title: res.data.courses[i].title});
          }
          else{
            let k = c.findIndex(obj => obj.course_id === res.data.courses[i].course_id);
            c[k].sections.push(res.data.courses[i].sec_id);
          }
        }
        setCourses(c);
        setItems(temp);
        setLoading(false);
      
      }
    }).catch(err => console.error(err));
  }, []);

  const register = (course_id, sec_id) => {
    axios.post("http://localhost:8080/home/registration/register", {course_id: course_id, sec_id: sec_id}).then((response) => {
      console.log(course_id);
      if (response.data.notlog) {
        window.location.href = '/login';
      } else {
        console.log(response.data.message);
        if(response.data.reg){
          setCourses(courses.filter(course => course.course_id !== course_id));
        }
        setSelectedCourse([]);
      }
    });
  };
  
  const handleOnSelect = (item) => {
    console.log(item)
    // setSelectedCourse({
    //   return [courses.find(course => course.course_id === item.name)];
    // });
    setSelectedCourse([courses.find(course => course.course_id === item.name)]);
  };

  const handleOnSearch = async (string, results) => {
    console.log(string);
    axios.get(`http://localhost:8080/home/registration/${string}`).then(res => {
      if(res.data.notlog){
        window.location.href = '/login';
      } else {
        console.log(res.data.courses);
        let c = [];
        let temp = [];
        let distinct_courses = [];
        for(let i = 0; i < res.data.courses.length; i++){
          if(!distinct_courses.includes(res.data.courses[i].course_id)){
            distinct_courses.push(res.data.courses[i].course_id);
            c.push({course_id: res.data.courses[i].course_id,title: res.data.courses[i].title ,sections: [res.data.courses[i].sec_id]});
            temp.push({id: i, name: res.data.courses[i].course_id, title: res.data.courses[i].title});
          }
          else{
            let k = c.findIndex(obj => obj.course_id === res.data.courses[i].course_id);
            c[k].sections.push(res.data.courses[i].sec_id);
          }
        }
        setSelectedCourse(c);
      
    }}).catch(err => console.error(err));
  }

  

  const handleOnClear = () => {
    setSelectedCourse([]);
  };
  const formatResult = (item) => {
    return (
      <div className="result-wrapper">
        <span className="result-span">{item.name}: {item.title}</span>
      </div>
    );
  };

  if(loading){
    return <></>    
  }
  else{
    return (
      <div>
        <br></br>
        <ReactSearchAutocomplete
              items={items}
              fuseOptions={{ keys: ["name", "title"] }}
              onSelect={handleOnSelect}
              onSearch={handleOnSearch}
              onClear={handleOnClear}
              formatResult={formatResult}
              styling={{
                hoverBackgroundColor: "lightgreen",
                lineColor: "lightgreen",
              }}
            />
        <br></br>
        <h1 style={{ fontSize: '1.5em' }}><b>Register for courses: </b></h1>

        <Table striped bordered hover>
      <thead>
        <tr>
        <th>Course Code</th>
        <th>Course Name</th>
        <th>Section</th>
        <th>Register</th>
        </tr>
      </thead>
      <tbody>
        {selectedCourse.length===0 && 
          (courses.map(course=>(
            <CourseRow key={course.course_id} course={course} />
        )))}
        {selectedCourse.length>0 && 
          (selectedCourse.map(course=>(
            <CourseRow key={course.course_id} course={course} />
        )))}
      </tbody>
    </Table>
      </div>
    );
  }
};

export default Registration;
