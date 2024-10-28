import CategoryList from "../components/categories/CategoryList";
import { useEffect, useState } from "react";
import { fetchCategories } from "../services/categories-api";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/CategoriesPage.css";

const CategoriesPage = () => {
  const { iccode } = useParams();

  const [categories, setCategories] = useState();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data))
      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, []);

  return (
    <div className="container mt-3">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to={!iccode ? "/home" : `/${iccode}`}>Home</Link>
          </li>
        </ol>
      </nav>

      {/* Go Back Button */}
      {/* <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        Go Back
      </button> */}

      {/* Page Title */}
      <h1 className="text-center">Event Categories</h1>

      {/* Loading Dots or Category List */}
      {!categories ? (
        <section className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </section>
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  );
};

export default CategoriesPage;
