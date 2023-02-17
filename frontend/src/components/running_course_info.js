import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Table from 'react-bootstrap/Table';
// import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";

function RunningCourseInfo() {
    const [runningCourseInfo, setCourseInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const { dept_name } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:8080/course/running/${dept_name}`)
            .then(res => {
                if (res.data.notlog) {
                    window.location.href = '/login';
                } else {
                    setCourseInfo(res.data.running_course_info);
                    setLoading(false);
                }
            })
            .catch(err => console.error(err));
    }, [dept_name]);

    if (loading) {
        return <></>
    } else {
        return (
            <div>
                <br></br>
                <h1 style={{ fontSize: '1.2em' }}><b>Courses Running in {dept_name} department this semester:</b></h1>
                <br></br>
                <Table striped bordered hover style={{width: '30%'}}>
                    <thead>
                        <tr>
                            <th>Course-ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runningCourseInfo.map(course=>(
                            <tr key={course.course_id}>
                            <td><Link to={`/course/${course.course_id}`}>{course.course_id}</Link></td>
                            </tr>
                            ))}
                    </tbody>
                </Table>
            </div>
        );
    }
};

export default RunningCourseInfo;
