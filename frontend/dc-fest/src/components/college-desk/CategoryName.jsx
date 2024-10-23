import { useEffect, useState } from "react";
import { fetchCategoryById } from "../../services/categories-api";

const CategoryName = ({ categoryId }) => {
  const [category, setCategory] = useState();

  useEffect(() => {
    getCategoryById(categoryId);
  }, [categoryId]);

  const getCategoryById = async (id) => {
    try {
      const response = await fetchCategoryById(id);
      setCategory(response);
    } catch (error) {
      console.log(error);
    }
  };
  return <td>{category?.name}</td>;
};

export default CategoryName;
