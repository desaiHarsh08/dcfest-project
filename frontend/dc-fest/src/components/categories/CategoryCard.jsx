/* eslint-disable react/prop-types */
import { Card, Col } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../styles/CategoryCard.module.css";
import { fetchParticipationEventsByCollegeId } from "../../services/college-participation-apis";
import { fetchCollegeByIcCode } from "../../services/college-apis";

const CategoryCard = ({ category }) => {
  const { iccode } = useParams();
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const totalEvents = category?.availableEvents?.length || 0;

  console.log(iccode);

  if (category?.name == "TEST_CATEGORY") {
    if (iccode && iccode != "iccode9" && iccode != "IC001") {
      return null;
    }
  }

  // Fetch enrollment count for this category
  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      if (!iccode || !category?.availableEvents || category.availableEvents.length === 0) {
        setEnrollmentCount(0);
        return;
      }

      try {
        // Fetch college by iccode
        const college = await fetchCollegeByIcCode(iccode);
        if (!college?.id) {
          setEnrollmentCount(0);
          return;
        }

        // Fetch all participations for this college
        const participations = await fetchParticipationEventsByCollegeId(college.id);
        
        // Count how many events in this category the college has enrolled in
        const categoryEventIds = category.availableEvents.map(event => event.id);
        const enrolledCount = participations.filter(
          participation => categoryEventIds.includes(participation.availableEventId)
        ).length;

        setEnrollmentCount(enrolledCount);
      } catch (error) {
        console.error("Error fetching enrollment count:", error);
        setEnrollmentCount(0);
      }
    };

    fetchEnrollmentCount();
  }, [iccode, category]);

  return (
    <Col xs={12} sm={6} md={4} lg={3} xl={3} className="mb-4 mt-4">
      <Link to={category.slug} className="text-decoration-none">
        {/* Card with shadow, border, and rounded corners */}
        <Card className={`h-100 shadow-sm border ${styles["custom-card"]}`} style={{ position: "relative" }}>
          <Card.Img
            variant="top"
            src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}/${category.slug}.jpg`}
            alt={category.slug}
            className="img-fluid custom-img"
            style={{
              width: "100%",
              height: "200px" /* Ensuring proper image size */,
              objectFit: "cover" /* Avoid image distortion */,
              borderBottom: "2px solid #dee2e6" /* Adding a bottom border to image */,
            }}
          />
          {/* Enrollment count displayed above the heading, same style as "Slots Vacant" */}
          {iccode && totalEvents > 0 && (
            <div
              className="px-3 py-2 rounded text-center"
              style={{
                border: `2px solid ${enrollmentCount > 0 ? "#28a745" : "#007bff"}`,
                backgroundColor: enrollmentCount > 0 ? "#28a745" : "#007bff",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9rem",
                margin: "-20px auto 16px auto",
                width: "fit-content",
                position: "relative",
                zIndex: 1,
              }}
            >
              {enrollmentCount}/{totalEvents} {totalEvents === 1 ? "Enrollment" : "Enrollments"}
            </div>
          )}
          <Card.Body className="text-center p-4">
            <div className="icon-container fs-4  my-3 text-uppercase text-muted">{category.name}</div>
            <Card.Title className={`card-title ${styles["card-title"]}`}>{category.title}</Card.Title>
            <Card.Text className="card-text">{category.description}</Card.Text>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  );
};

export default CategoryCard;
