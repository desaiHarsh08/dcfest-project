const CollegeRow = ({ college, index, onChange }) => {
  return (
    <tr key={college.id}>
      <td>{index + 1}</td>
      <td>{college.name}</td>
      <td>{college.address}</td>
      <td>{college.phone}</td>
      <td>{college.email}</td>
    </tr>
  );
};

export default CollegeRow;
