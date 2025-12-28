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
import React, { useContext, useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import { fetchColleges, fetchCollegesRanking } from "../services/college-apis";
import {
  initWebSocket,
  subscribeToCollegeRankings,
} from "../services/websocketService";

const CollegeRankingPage = () => {
  const [colleges, setColleges] = useState([]);
  const [rankings, setRankings] = useState([]);
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const prevRankingsRef = useRef([]);

  // WebSocket real-time updates for waiting list promotion
  useEffect(() => {
    // Initialize WebSocket connection
    initWebSocket(accessToken, user?.email);

    // Subscribe to waiting list promotion events
    const subscription = subscribeToCollegeRankings(
      fetchCollegesRanking,
      (data) => {
        console.log("College Rankings:", data);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const areRankingsEqual = (a = [], b = []) => {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (
        a[i].ranking !== b[i].ranking ||
        a[i].icCode !== b[i].icCode ||
        a[i].points !== b[i].points ||
        a[i].teams !== b[i].teams
      ) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAndCompare = async () => {
      try {
        const data = await fetchCollegesRanking();

        if (!isMounted) return;

        const prev = prevRankingsRef.current;

        if (!areRankingsEqual(prev, data)) {
          console.log("🔄 Rankings changed → updating state");
          setRankings(data);
          prevRankingsRef.current = data;
        } else {
          console.log("⏸ Rankings unchanged → skipping state update");
        }
      } catch (err) {
        console.error(err);
      }
    };

    // initial fetch
    fetchAndCompare();

    const intervalId = setInterval(fetchAndCompare, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (user?.type !== "ADMIN") {
      navigate(-1);
      return;
    }

    fetchColleges()
      .then((data) => {
        const sortedColleges = data
          .filter((c) => c.detailsUploaded)
          .sort((a, b) =>
            a.points === null ? 1 : b.points === null ? -1 : a.points - b.points
          );

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
            <th>IC CODE</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {rankings?.map((rnk, index) => {
            let rowClass = "";

            if (rnk.ranking === 1) rowClass = "table-warning fw-bold"; // Gold
            else if (rnk.ranking === 2)
              rowClass = "table-secondary fw-bold"; // Silver
            else if (rnk.ranking === 3) rowClass = "table-danger fw-bold"; // Bronze

            return (
              <tr key={rnk.icCode} className={rowClass}>
                <td>#{rnk.ranking}</td>
                <td>{rnk.icCode}</td>
                <td>{rnk.points ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CollegeRankingPage;
