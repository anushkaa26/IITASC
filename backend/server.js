// var http = require("http");
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const cors = require("cors");
const app = express();
const secret_key = require('./config/auth.config.js');
const auth_session = require('./middleware/auth_session.js');
const db = require('./config/db.config.js');
const port = 8080;

app.use(cors({ credentials:true, origin:'http://localhost:3000' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
  secret: secret_key.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60 * 60 * 24,
  },
}));

const { Client } = require('pg');
const client = new Client({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    multipleStatements: true
});

client.connect();

app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
  });

app.get('/login', (request, response) => {
  if(request.session.user) {
    response.send({loggedin: true, user: request.session.user});
    console.log(request.session.user);
  }
  else response.send({loggedin: false});
});

app.post('/login', async (request, response) => {
  const ID = request.body.ID;
  const password = request.body.password;

  try {
    const query = `SELECT * FROM user_password WHERE ID = '${ID}'`;
    let result1 = await client.query(query);

    const query_students = `SELECT id FROM student`;
    let result2 = await client.query(query_students);

    if (result1.rows.length > 0) {
      const valid_user = bcrypt.compareSync(password, result1.rows[0].hashed_password);
      if(valid_user){
          console.log("log in success");
          let user = "instructor";
          for(let i=0;i<result2.rows.length;i=i+1){
            if(result2.rows[i].id == ID){
              user = "student";
              break;
            }
          }
          request.session.user = result1.rows[0].id;
          console.log(user);
          response.send({
          logged_in: true,
          ID: ID,
          user: user,
          });
      }
      else response.send({logged_in: false, message: 'Invalid credentials',});
    }
    else response.send({logged_in: false, message: 'Invalid user',})
  }
  catch (err) {
    console.error(err);
  }
});

app.post('/logout', auth_session, (request, response) => {
  request.session.destroy(err => {
      if(err) response.send({notlog: false, message: 'Unable to Log Out',});
      else response.send({notlog: true, message: 'Logged Out',});
    });
});

app.get('/home', auth_session, async (request, response) => {
  // console.log(request.session.user);
  const id = request.session.user;

  try {
    const query_student = `SELECT * FROM student WHERE ID = '${id}'`;
    let result1 = await client.query(query_student);
    const student = result1.rows[0];

    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_courses = `SELECT * FROM takes natural join reg_dates natural join course WHERE ID = '${id}' and not (year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}') 
    ORDER BY takes.year DESC,CASE  
    WHEN semester = 'Spring' then 1
    WHEN semester = 'Summer' then 2
    WHEN semester = 'Fall' then 3
    WHEN semester = 'Autumn' then 4 END DESC;`; //for previous courses
    let result4 = await client.query(query_courses);
    const prev_courses = result4.rows;

    const query_cur_courses = `SELECT * FROM takes natural join course WHERE ID = '${id}' and year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}'`; //for current courses
    let result5 = await client.query(query_cur_courses);
    const cur_courses = result5.rows;

    response.send({student: student, prev_courses: prev_courses, cur_courses: cur_courses});
  }
  catch (err) {
    console.error(err);
  }
});

app.post('/home/drop', auth_session, async (request, response) => {
  const course_id = request.body.course_id;
  const id = request.session.user;
  try {
    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_drop_course = `DELETE FROM takes WHERE id = '${id}' and course_id = '${course_id}' and year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}'`;
    await client.query(query_drop_course);
    response.send({message: "Course dropped"});
  }
  catch (err) {
    console.error(err);
  }  
});

app.get('/home/registration', auth_session, async (request, response) => {
  const id = request.session.user;

  try {
    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    // cursem.rows[0].semester = "Spring";
    // cursem.rows[0].year = "2010";
    const query_courses = `SELECT * FROM course NATURAL JOIN section WHERE year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}'
    and course_id NOT IN (SELECT course_id FROM takes WHERE ID = '${id}' and year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}')`;
    let result = await client.query(query_courses);
    response.send({courses: result.rows});
  }
  catch (err) {
    console.error(err);
  }
});


app.post('/home/registration/register', auth_session, async (request, response) => {
  const course_id = request.body.course_id;
  const sec_id = request.body.sec_id;
  const id = request.session.user;
  try {
    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_prereq = `SELECT * from course natural inner join prereq WHERE course_id='${course_id}';`;
    let result1 = await client.query(query_prereq);
    const prereq_courses = result1.rows;

    const query_prev_courses = `SELECT * FROM takes natural join reg_dates natural join course WHERE ID = '${id}' and not (year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}') 
    ORDER BY takes.year DESC, reg_dates.start_time DESC;`; //for previous courses
    let result2 = await client.query(query_prev_courses);
    const prev_courses = result2.rows;

    let count = 0;
    for(let i=0;i<prereq_courses.length;i=i+1){
      for(let j=0;j<prev_courses.length;j=j+1){
        if(prereq_courses[i].prereq_id == prev_courses[j].course_id){
          count = count+1;
          break;
        }
      }
    }
    if(count == prereq_courses.length){
      const query_reg_course = `INSERT INTO takes VALUES ('${id}','${course_id}','${sec_id}','${cursem.rows[0].semester}','${cursem.rows[0].year}',null);`;
      await client.query(query_reg_course);
      response.send({reg: true, message: "Registered"});
    }
    else{
      response.send({reg:false, message: "Prereq not satisfied"});
    }
  }
  catch (err) {
    console.error(err);
  }  
});


app.get('/course', auth_session, async (request, response) => {
  // console.log(request.session.user);
  const id = request.session.user;

  try {
    const query_courseList = ` select course_id,title from course order by course_id`;
    let result1 = await client.query(query_courseList);
    const courses = result1.rows;

    response.send({courses: courses});

  }
  catch (err) {
    console.error(err);
  }
});

app.get('/course/running', auth_session, async (request, response) => {
  // console.log(request.session.user);
  const id = request.session.user;

  try {

    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_cur_courses = `SELECT DISTINCT dept_name FROM section natural join course WHERE year='${cursem.rows[0].year}' and semester='${cursem.rows[0].semester}';`; //for running courses
    let result5 = await client.query(query_cur_courses);
    const running_courses_dept = result5.rows;
    // console.log(running_courses_dept);

    response.send({running_courses_dept: running_courses_dept});

  }
  catch (err) {
    console.error(err);
  }
});


app.get('/course/:course_id', auth_session, async (request, response) => {
  const { course_id } = request.params;
  // console.log(course_id)
  const id = request.session.user;
  try {

    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_course_info = `SELECT * FROM course WHERE course_id = '${course_id}';`;  //id,title,credits
    let info = await client.query(query_course_info);
    const course_info = info.rows[0];

    const query_prereq = `SELECT prereq_id FROM prereq WHERE course_id = '${course_id}';`;  //prereq
    let prereq = await client.query(query_prereq);
    const course_prereq = prereq.rows;

    const query_instr = `select id,name from teaches natural join instructor WHERE course_id = '${course_id}' and year='${cursem.rows[0].year}' and semester='${cursem.rows[0].semester}';`;  //instructor info
    let instr = await client.query(query_instr);
    const course_instr = instr.rows;

    response.send({course_info: course_info, course_prereq: course_prereq, course_instr: course_instr});   
    // console.log("ourse_instr"); 
  }
  catch (err) {
    console.error(err);
  }  
});


app.get('/course/running/:dept_name', auth_session, async (request, response) => {
  const { dept_name } = request.params;
  const id = request.session.user;
  try {

    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_course_info = `select distinct course_id from course natural join section where dept_name = '${dept_name}' and year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}';`;  
    let info = await client.query(query_course_info);
    const running_course_info = info.rows;

    

    response.send({running_course_info: running_course_info});  
  }
  catch (err) {
    console.error(err);
  }  
});

app.get('/instructor', auth_session, async (request, response) => {
  // console.log(request.session.user);
  const id = request.session.user;

  try {
    const query_courseList = `select * from instructor`;
    let result1 = await client.query(query_courseList);
    const instructors = result1.rows;

    response.send({instructors: instructors});

  }
  catch (err) {
    console.error(err);
  }
});

app.get('/instructor/:instructor_id', auth_session, async (request, response) => {
  const { instructor_id } = request.params;
  // console.log(course_id)
  const id = request.session.user;
  try {

    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    const query_instructor_info = `select id,name,dept_name from instructor where id = '${instructor_id}'`;
    let result1 = await client.query(query_instructor_info);
    const instructor_info = result1.rows[0];


    const query_prev_courses = `SELECT course_id, title FROM (teaches natural join course) natural join reg_dates WHERE id = '${instructor_id}' and not (year='${cursem.rows[0].year}' and semester='${cursem.rows[0].semester}') ORDER BY teaches.year DESC, CASE
    WHEN semester = 'Spring' then 1
    WHEN semester = 'Summer' then 2
    WHEN semester = 'Fall' then 3
    WHEN semester = 'Autumn' then 4 END DESC, course_id;`;  //previous courses
    let temp = await client.query(query_prev_courses);
    const prev_courses = temp.rows;

    const query_running_courses = `select course_id, title FROM teaches natural join course WHERE id = '${instructor_id}' and year='${cursem.rows[0].year}' and semester='${cursem.rows[0].semester}' ORDER BY course_id;`;  //running courses
    let temp1 = await client.query(query_running_courses);
    const running_courses = temp1.rows;

    response.send({instructor_info: instructor_info, prev_courses: prev_courses, running_courses: running_courses});   
  }
  catch (err) {
    console.error(err);
  }  
});

app.get('/home/registration/:string', auth_session, async (request, response) => {
  
  const { string } = request.params;
  const id = request.session.user;

  try {
    const query_current_sem = `SELECT semester, year FROM reg_dates
    WHERE start_time <= CURRENT_TIMESTAMP ORDER BY start_time DESC;`;
    let cursem = await client.query(query_current_sem);

    // cursem.rows[0].semester = "Spring";
    // cursem.rows[0].year = "2010";
    const query_courses = `SELECT * FROM course NATURAL JOIN section WHERE (course.course_id ilike '%${string}%' or course.title ilike '%${string}%') and year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}'
    and course_id NOT IN (SELECT course_id FROM takes WHERE ID = '${id}' and year = '${cursem.rows[0].year}' and semester = '${cursem.rows[0].semester}')`;
    let result = await client.query(query_courses);
    response.send({courses: result.rows});
  }
  catch (err) {
    console.error(err);
  }
});