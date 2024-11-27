import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import { useNavigate } from 'react-router-dom';

const CollegeRankingPage = () => {
    // Sample data for demonstration with ranking
    const colleges = [
       
    ];

    const navigate = useNavigate();

    return (
        <div className="container mt-4">
            <button
                className="back-button"
                onClick={() => navigate(-1)} // Navigates to the previous page
                style={{
                    margin: "10px",
                    padding: "10px 20px",
                    marginBottom: "30px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Back
            </button>
            <h2 className="text-center">College Ranking</h2>
            <table className="table table-bordered mt-4">
                <thead className="table-success">
                    <tr>
                        <th>Ranking</th> {/* Add Ranking column */}
                        <th>College Name</th>
                        <th>IC CODE</th>
                        <th>Points</th>
                        <th>Participants</th>
                    </tr>
                </thead>
                <tbody>
                    {colleges.map((college, index) => (
                        <tr key={index}>
                            <td>{college?.rank}</td> {/* Display rank */}
                            <td>{college?.name}</td>
                            <td>{college?.icCode}</td>
                            <td>{college?.points}</td>
                            <td>{college?.participants}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CollegeRankingPage;
