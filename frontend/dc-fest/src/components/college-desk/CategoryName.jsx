/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { fetchCategoryById } from "../../services/categories-api";

const CategoryName = ({ categoryId }) => {
  const [category, setCategory] = useState();

  useEffect(() => {
    if (categoryId) {
      getCategoryById(categoryId);
    }
  }, [categoryId]);

  const getCategoryById = async (id) => {
    try {
      const response = await fetchCategoryById(id);
      setCategory(response);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="d-flex align-items-center gap-4 w-100">
      <div className="w-25 d-flex justify-content-end">
        <img src={`/${category?.slug}.jpg`} alt={""} style={{ height: "52px", width: "52px", objectFit: "contain" }} />
      </div>
      <p className="w-75 d-flex">{category?.name}</p>
    </div>
  );
};

export default CategoryName;
