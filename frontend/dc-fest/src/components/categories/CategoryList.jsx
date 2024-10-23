import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap';
import CategoryCard from './CategoryCard';

const CategoryList = ({ categories }) => {
    return (
        <Row className="d-flex justify-content-center">
            {categories.length > 0 ? (
                categories.map((category, index) => (
                    <CategoryCard category={category} key={index} />
                ))
            ) : (
                <p className="text-center">No categories available.</p> // Fallback message
            )}
        </Row>
    )
}

export default CategoryList
