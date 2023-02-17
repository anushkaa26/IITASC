import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import axios from "axios";

const Logout = async (e) => {
    e.preventDefault();
    axios.post("http://localhost:8080/logout", {}).then((response) => {
        if (response.data.notlog) {
          window.location.href = '/login';
        } else console.log(response.data.message);
      });
  };

// const Navigation = () => {
//     return (
//        <div>
//           <NavLink to="/home">Home </NavLink>
//           <button onClick={Logout}>Logout</button>
//           <NavLink to="/home/registration">Registration </NavLink>
//        </div>
//     );
// }

function Navigation() {
  return (
    <Navbar style={{ backgroundColor: "dark", color: "white" }} collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">IIT ASC</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            <Nav.Link href="/home/registration">Registration</Nav.Link>
            <Nav.Link href="/course">Course Information</Nav.Link>
            <Nav.Link href="/instructor">Instructors</Nav.Link>
            
          </Nav>
          <Nav>
            <Nav.Link onClick={Logout}>
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;






