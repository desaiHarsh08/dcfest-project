import { useNavigate } from "react-router-dom";

const TeamsRankingPage = () => {
  const navigate = useNavigate();
  return (
    <div>
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
      <h1>Teams Ranking Page</h1>
      <p>This is where you can display details about total events.</p>
    </div>
  );
};

export default TeamsRankingPage;
