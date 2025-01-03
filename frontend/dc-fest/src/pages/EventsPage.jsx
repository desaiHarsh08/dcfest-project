/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import EventCard from "../components/events/EventCard";
import { fetchAvailableEventsByCategorySlug } from "../services/available-events-apis";
import { fetchCollegeByIcCode } from "../services/college-apis";
import { useSelector } from "react-redux";
import { selectCategories } from "../app/slices/categoriesSlice";
import Navbar from "../components/Navbar/Navbar";

const EventsPage = () => {
  const categories = useSelector(selectCategories);
  const { categorySlug, iccode } = useParams();
  const [events, setEvents] = useState([]);
  const [college, setCollege] = useState();
  const [error, setError] = useState(null); // State to hold any fetch errors

  useEffect(() => {
    getCollege();
    // const categoryId = categories.find(c -> c?.slug == categorySlug)?.id;
    // if (categoryId) {
    fetchAvailableEventsByCategorySlug(categorySlug)
      .then((data) => setEvents(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
    // }
  }, [categorySlug]);

  const getCollege = async () => {
    try {
      const response = await fetchCollegeByIcCode(iccode);
      setCollege(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {iccode && <Navbar />}
      <Container>
        {/* Breadcrumbs */}
        <Row>
          <Col>
            <nav aria-label="breadcrumb" className="mt-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={iccode ? `/${iccode}` : "/home"}>Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={iccode ? `/${iccode}/categories` : "/home/categories"}>Categories</Link>
                </li>
              </ol>
            </nav>
          </Col>
        </Row>

        {/* Page Title */}
        <Row className="mb-4">
          <Col>
            <h1 className="text-center mt-5">List of Events for UMANG 2024</h1>
          </Col>
        </Row>

        {/* Events List */}
        <Row xs={1} md={2} lg={3} className="g-4">
          {events.map((event, index) => (
            <EventCard key={`event-${index}`} event={event} college={college} />
          ))}
        </Row>
      </Container>
    </>
  );
};

export default EventsPage;
