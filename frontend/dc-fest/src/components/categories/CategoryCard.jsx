/* eslint-disable react/prop-types */
import { Card, Col } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import styles from "../../styles/CategoryCard.module.css";

const CategoryCard = ({ category }) => {
  const { iccode } = useParams();
  console.log(iccode);

  if (category?.name == "TEST_CATEGORY") {
    if (iccode && iccode != "iccode9" && iccode != "IC001") {
      return null;
    }
  }

  return (
    <Col xs={12} sm={6} md={4} lg={3} className="mb-4 mt-4">
      <Link to={category.slug} className="text-decoration-none">
        {/* Card with shadow, border, and rounded corners */}
        <Card className={`h-100 shadow-sm border ${styles["custom-card"]}`}>
          <Card.Img
            variant="top"
            src={`/${category.slug}.jpg`}
            alt={category.slug}
            className="img-fluid custom-img"
            style={{
              width: "100%",
              height: "200px" /* Ensuring proper image size */,
              objectFit: "cover" /* Avoid image distortion */,
              borderBottom: "2px solid #dee2e6" /* Adding a bottom border to image */,
            }}
          />
          <Card.Body className="text-center p-4">
            <div className="icon-container fs-4  my-3 text-uppercase text-muted">{category.name}</div>
            <Card.Title className="card-title">{category.title}</Card.Title>
            <Card.Text className="card-text">{category.description}</Card.Text>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  );
};

export default CategoryCard;
