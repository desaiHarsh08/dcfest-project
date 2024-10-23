import "../styles/CategoriesPage.css";
import CategoryList from "../components/categories/CategoryList";
import { useEffect, useState } from "react";
import { fetchCategories } from "../services/categories-api";
import { AuthProvider } from "../providers/AuthProvider";

const CategoriesPage = () => {
  const [categories, setCategories] = useState();
  const [error, setError] = useState(null);

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
      <h1 className="text-center">Event Categories</h1>
      {!categories ? (
        <p>Loading...</p>
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  );
};
export default CategoriesPage;
