import React from 'react';
import { Nav, Navbar, Dropdown, Image } from 'react-bootstrap';
import { BiGrid, BiHome, BiTable, BiUserCircle } from 'react-icons/bi';
// import { BiHome, BiSpeedometer, BiTable, BiGrid, BiUserCircle } from 'react-icons'; // Use react-icons for SVGs

const Sidebar = () => {
    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark h-100 border border-danger" style={{ width: '280px', height: "100%" }}>
            <Navbar.Brand href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <BiHome className="me-2" size={40} />
                <span className="fs-4">Sidebar</span>
            </Navbar.Brand>
            <hr />
            <Nav className="nav-pills flex-column mb-auto ">
                <Nav.Item>
                    <Nav.Link href="#" className="active" aria-current="page">
                        <BiHome className="me-2" />
                        Home
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#" className="text-white">
                        <BiUserCircle className="me-2" />
                        Dashboard
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#" className="text-white">
                        <BiTable className="me-2" />
                        Orders
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#" className="text-white">
                        <BiGrid className="me-2" />
                        Products
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#" className="text-white">
                        <BiUserCircle className="me-2" />
                        Customers
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <hr />
            <Dropdown>
                <Dropdown.Toggle as="a" className="d-flex align-items-center text-white text-decoration-none" id="dropdown-custom-components">
                    <Image src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                    <strong>mdo</strong>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark text-small shadow">
                    <Dropdown.Item href="#">New project...</Dropdown.Item>
                    <Dropdown.Item href="#">Settings</Dropdown.Item>
                    <Dropdown.Item href="#">Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#">Sign out</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export default Sidebar;
