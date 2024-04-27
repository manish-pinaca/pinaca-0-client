/* eslint-disable react-refresh/only-export-components */
import PaginatedItem from "@/components/PaginatedItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSocketContext } from "@/context/socketTypes";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";

interface IFeedbacks {
  customerId: string;
  serviceId: string;
  customerName: string;
  serviceName: string;
  feedback: string;
  rating: string;
  createdAt: string;
}

const DetailFeedback = ({
  customerName,
  serviceName,
  rating,
  feedback,
  date,
}: {
  customerName: string;
  serviceName: string;
  rating: string;
  feedback: string;
  date: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return feedback.length < 100 ? (
    <p className="text-sm">{feedback}</p>
  ) : (
    <>
      <p className="text-sm">
        {feedback.slice(0, 100)}...
        <Button
          size={"xs"}
          variant={"link"}
          className="ml-2"
          onClick={() => setOpen(true)}
        >
          Read more
        </Button>
      </p>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-w-[80vh] max-h-[90vh] overflow-auto">
          <DialogTitle>Detail Feedback</DialogTitle>
          <hr className="border border-gray-200 justify-end" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm italic">Customer Name:</p>
              <p className="font-medium">{customerName}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm italic">Date:</p>
              <p className="font-medium">{moment(date).format("DD/MM/YYYY")}</p>
            </div>
            <div>
              <p className="text-sm italic">Service Name:</p>
              <p className="font-medium">{serviceName}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm italic">Rating:</p>
              <p className="font-medium">{rating}/10</p>
            </div>
          </div>
          <p className="mt-2 font-medium leading-none">Feedback:</p>
          <p>{feedback}</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<IFeedbacks>[] = [
  {
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }) => (
      <p className="text-sm">{row.getValue("customerName")}</p>
    ),
  },
  {
    accessorKey: "serviceName",
    header: "Service Name",
    cell: ({ row }) => <p className="text-sm">{row.getValue("serviceName")}</p>,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => <p className="text-sm">{row.getValue("rating")}</p>,
  },
  {
    accessorKey: "createdAt",
    header: "Commented On",
    cell: ({ row }) => (
      <p className="text-sm">
        {moment(row.getValue("createdAt")).format("DD/MM/YYYY")}
      </p>
    ),
  },
  {
    accessorKey: "feedback",
    header: "Feedback",
    cell: ({ row }) => (
      <DetailFeedback
        customerName={row.getValue("customerName")}
        serviceName={row.getValue("serviceName")}
        rating={row.getValue("rating")}
        feedback={row.getValue("feedback")}
        date={row.getValue("createdAt")}
      />
    ),
  },
];

const Feedback = () => {
  const limit = 4;

  const { event } = useSocketContext();

  const [page, setPage] = useState<number>(1);
  const [feedbacks, setFeedbacks] = useState<IFeedbacks[]>([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState<number>(0);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const fetchFeedbacks = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `https://pinaca-0-server.onrender.com/api/feedback/getAllFeedbacks?page=${page}&limit=${limit}`
      );
      setFeedbacks(data.feedbacks);
      setTotalFeedbacks(data.totalFeedbacks);
    } catch (error) {
      console.log("Error fetching feedbacks", error);
    }
  }, [page]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const table = useReactTable({
    data: feedbacks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    if (event.includes("feedbackReceived")) {
      fetchFeedbacks();
    }
  }, [event, fetchFeedbacks]);

  return (
    <div className="w-[70%] overflow-auto bg-white px-8 py-4 rounded-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Feedbacks</p>
          <PaginatedItem
            setPage={setPage}
            totalItems={totalFeedbacks}
            limit={limit}
          />
        </div>
        <hr className="border border-gray-200" />
      </div>
      <div className="max-h-[50vh] overflow-auto">
        <Table className="border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-center lg:text-base font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center lg:text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Feedback;
