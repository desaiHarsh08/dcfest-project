// /* eslint-disable no-unused-vars */
// import React, { useContext, useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../providers/AuthProvider";
// import { fetchColleges } from "../services/college-apis";

// const CollegeRankingPage = () => {
//   // Sample data for demonstration with ranking
//   const [colleges, setColleges] = useState([]);

//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user?.type != "ADMIN") {
//       navigate(-1);
//     }
//     fetchColleges()
//       .then((data) => {
//         data = data.filter((c) => c.detailsUploaded);
//         const tmpColleges = data.filter((c) => c.points == null);
//         const tmpColleges2 = data.filter((c) => c.points != null);
//         tmpColleges2.sort((a, b) => a.points - b.points);

//         setColleges([...tmpColleges2, ...tmpColleges]);
//       })
//       .catch((err) => console.log(err));
//   }, [user, navigate]);

//   return (
//     <div className="container mt-4">
//       <button
//         className="back-button"
//         onClick={() => navigate(-1)} // Navigates to the previous page
//         style={{
//           margin: "10px",
//           padding: "10px 20px",
//           marginBottom: "30px",
//           backgroundColor: "#007BFF",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Back
//       </button>
//       <h2 className="text-center">College Ranking</h2>
//       <table className="table table-bordered mt-4">
//         <thead className="table-success">
//           <tr>
//             <th>Ranking</th> {/* Add Ranking column */}
//             <th>College Name</th>
//             <th>IC CODE</th>
//             <th>Points</th>
//             <th>Participants</th>
//           </tr>
//         </thead>
//         <tbody>
//           {colleges.map((college, index) => {
//             let styles;
//             switch (index + 1) {
//               case 1:
//                 styles = "bg-success text-white";
//                 break;
//               case 2:
//                 styles = "bg-info text-white";
//                 break;
//               case 3:
//                 styles = "bg-danger text-white";
//                 break;
//               default:
//                 styles = "";
//             }
//             console.log(styles)

//             return (
//               <tr key={index} className={styles}>
//                 <td>#{index + 1}</td> {/* Display rank */}
//                 <td>{college?.name}</td>
//                 <td>{college?.icCode}</td>
//                 <td>{college?.points}</td>
//                 <td>{college?.participants}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CollegeRankingPage;

/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import { fetchColleges } from "../services/college-apis";

const CollegeRankingPage = () => {
  const [colleges, setColleges] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.type !== "ADMIN") {
      navigate(-1);
      return;
    }

    fetchColleges()
      .then((data) => {
        const sortedColleges = data.filter((c) => c.detailsUploaded).sort((a, b) => (a.points === null ? 1 : b.points === null ? -1 : a.points - b.points));

        setColleges(sortedColleges);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch colleges. Please try again later.");
      });
  }, [user, navigate]);

  return (
    <div className="container mt-4">
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate(-1)} // Navigates to the previous page
      >
        Back
      </button>
      <h2 className="text-center">College Ranking</h2>
      <table className="table table-bordered mt-4">
        <thead className="table-success">
          <tr>
            <th>Rankings</th>
            <th>College</th>
            <th>IC CODE</th>
            <th>Points</th>
            <th>Participants</th>
          </tr>
        </thead>
        <tbody>
          {colleges.map((college, index) => {
            return (
              <tr key={index}>
                <td>{index + 1}.</td>
                <td>{college?.name || "Unknown College"}</td>
                <td>{college?.icCode}</td>
                <td>{college?.points ?? ""}</td>
                <td>{college?.participants || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CollegeRankingPage;
