import React, { useEffect, useState } from "react";
import "../../styles/EventLists.css";
import { fetchCategories } from "../../services/categories-api";
import { useNavigate } from "react-router-dom";
import CategoryItem from "./CategoryItem";
import Footer from "../Footer/Footer";

const EventLists = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        console.log(data);
      })

      .catch((err) => {
        console.log(err);
        setError(err);
      });
  }, []);
  return (
    <div className="mt-5">
      {categories?.map((category) => {
        if (category.name != "TEST_CATEGORY") {
          return <CategoryItem key={category.name} categoryItem={category} />;
        }
      })}
      <Footer />
    </div>
  );
};

export default EventLists;
