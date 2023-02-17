import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import { Link } from "react-router-dom";

// import Button from 'react-bootstrap/Button';

function CourseInfo() {
    const [courseInfo, setCourseInfo] = useState(null);
    const [prereq, setPrereq] = useState(null);
    const [courseInstr, setCourseInstr] = useState(null);
    const [loading, setLoading] = useState(true);

    const { course_id } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:8080/course/${course_id}`)
            .then(res => {
                if (res.data.notlog) {
                    window.location.href = '/login';
                } else {
                    setCourseInfo(res.data.course_info);
                    setPrereq(res.data.course_prereq);
                    setCourseInstr(res.data.course_instr);
                    setLoading(false);
                }
            })
            .catch(err => console.error(err));
    }, [course_id]);

    if (loading) {
        return <></>
    } else {
        return (
            <div>
                <br></br>
                <h1 style={{ fontSize: '1.5em' }}><b>Course: {courseInfo.course_id}  </b></h1>
                <Table bordered style={{ margin: '0.5rem' , width: '50%'}} className="studenttable">
                <tbody><tr>
                    <th style={{backgroundColor: 'rgb(200,200,200)' }}>Title</th>
                    <td style={{backgroundColor: 'rgb(230,230,230)' }}>{courseInfo.title}</td>
                </tr>
                <tr>
                    <th style={{backgroundColor: 'rgb(200,200,200)' }}>Credits</th>
                    <td style={{backgroundColor: 'rgb(230,230,230)' }}>{courseInfo.credits}</td>
                </tr>              
                </tbody></Table>
                
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>Prereq</th>
                            <th>Instructor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* <td><Link to={`/course/${prereq[0].prereq_id}`}>{prereq && prereq[0] && prereq[0].prereq_id}</Link></td> */}
                            {/* <td><Link to={`/instructor/${courseInstr[0].id}`}>{courseInstr && courseInstr[0] && courseInstr[0].id}</Link></td> */}
                            <td>
                                {prereq && prereq[0] ? (
                                    // <Link to={`/course/${prereq[0].prereq_id}`}>{prereq[0].prereq_id}</Link>
                                    prereq.map(course=>(
                                        <p><Link to={`/course/${course.prereq_id}`}>{course.prereq_id}</Link></p>    
                                    ))
                                ) : (
                                    <span>NA</span>
                                )}
                            </td>
                            <td>
                                {courseInstr && courseInstr[0] ? (
                                    courseInstr.map(instr=>(
                                        <p><Link to={`/instructor/${instr.id}`}>{instr.name}</Link></p>    
                                    ))
                                ) : (
                                    <span>NA</span>
                                )}
                            </td>

                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }
};

export default CourseInfo;
