import { Pagination as RBPagination } from "react-bootstrap";

const Pagination = ({ pageData, setPageData }) => {
  return (
    <RBPagination>
      <RBPagination.Prev
        onClick={() =>
          setPageData((prev) => ({
            ...prev,
            currentPage: Math.max(prev.currentPage - 1, 1),
          }))
        }
        disabled={pageData.currentPage === 1}
      />
      {Array.from({ length: pageData.totalPages }).map((_, index) => (
        <RBPagination.Item
          key={index}
          active={index + 1 === pageData.currentPage}
          onClick={() =>
            setPageData((prev) => ({
              ...prev,
              currentPage: index + 1,
            }))
          }
        >
          {index + 1}
        </RBPagination.Item>
      ))}
      <RBPagination.Next
        onClick={() =>
          setPageData((prev) => ({
            ...prev,
            currentPage: Math.min(prev.currentPage + 1, pageData.totalPages),
          }))
        }
        disabled={pageData.currentPage === pageData.totalPages}
      />
    </RBPagination>
  );
};

export default Pagination;
