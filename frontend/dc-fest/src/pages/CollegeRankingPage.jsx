import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const CollegeRankingPage = () => {
    // Sample data for demonstration with ranking
    const colleges = [
        { rank: 1, name: "ABC College", icCode: "IC123", points: 85, participants: 10 },
        { rank: 2, name: "XYZ University", icCode: "IC456", points: 90, participants: 12 },
        { rank: 3, name: "LMN Institute", icCode: "IC789", points: 75, participants: 8 },
    ];

    return (
        <div className="container mt-4">
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
                            <td>{college.rank}</td> {/* Display rank */}
                            <td>{college.name}</td>
                            <td>{college.icCode}</td>
                            <td>{college.points}</td>
                            <td>{college.participants}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CollegeRankingPage;
