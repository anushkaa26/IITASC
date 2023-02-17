import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Table from 'react-bootstrap/Table';
// import Button from 'react-bootstrap/Button';

function InstructorInfo() {
    const [instructorInfo, setInstructorInfo] = useState(null);
    const [prevCourses, setPrevCourses] = useState(null);
    const [runningCourses, setRunningCourses] = useState(null);
    const [loading, setLoading] = useState(true);

    const { instructor_id } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:8080/instructor/${instructor_id}`)
            .then(res => {
                if (res.data.notlog) {
                    window.location.href = '/login';
                } else {
                    setInstructorInfo(res.data.instructor_info);
                    setPrevCourses(res.data.prev_courses);
                    setRunningCourses(res.data.running_courses);
                    setLoading(false);
                }
            })
            .catch(err => console.error(err));
    }, [instructor_id]);

    if (loading) {
        return <></>
    } else {
        return (
            <div>
                <br></br>
                <h1 style={{ fontSize: '1.5em' }}><b> Instructor: {instructorInfo.name}</b> </h1>
                <h1 style={{ fontSize: '1.2em' }}> Department: {instructorInfo.dept_name}</h1>
                <br></br>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Courses offered this semester</th>
                            <th>Courses offered in previous semesters</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{runningCourses.map(course=>(
                                    <p><Link to={`/course/${course.course_id}`}>{course.course_id}</Link>: {course.title} </p>    
                                ))}
                            </td>
                            <td>{prevCourses.map(course=>(
                                    <p><Link to={`/course/${course.course_id}`}>{course.course_id}</Link>: {course.title} </p>    
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </Table>
                {/* <h1 style={{ fontSize: '1.2em' }}> Courses offered in previous semesters: </h1>
                {prevCourses.map(course=>(
                    <p><Link to={`/course/${course.course_id}`}>{course.course_id}</Link>: {course.title} </p>    
                ))} */}
            </div>
        );
    }
};

export default InstructorInfo;
