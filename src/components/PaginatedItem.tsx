import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

interface PaginatedItemProps {
  setPage: (page: number) => void;
  totalItems: number;
  limit: number;
}

const PaginatedItem = ({ setPage, totalItems, limit }: PaginatedItemProps) => {
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    setPageCount(Math.ceil(totalItems / limit));
  }, [limit, totalItems]);

  // Invoke when user click to request another page.
  const handlePageClick = (event: { selected: number }) => {
    setPage(event.selected + 1);
  };

  return (
    <>
      <ReactPaginate
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel="<"
        previousLinkClassName="w-6 h-6 rounded-full flex justify-center bg-lime-500 text-white"
        nextLinkClassName="w-6 h-6 rounded-full flex justify-center bg-lime-500 text-white"
        breakLabel="..."
        containerClassName="flex gap-3"
        activeClassName="w-6 h-6 text-center rounded-full border border-teal-300"
        renderOnZeroPageCount={null}
      />
    </>
  );
};

export default PaginatedItem;
