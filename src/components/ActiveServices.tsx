import { useAppSelector } from "@/app/hooks";
import { useEffect, useState } from "react";
import PaginatedItem from "./PaginatedItem";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { IActiveService } from "@/app/features/customers/customerSlice";
import moment from "moment";
import CustomerServiceFeedback from "./CustomerServiceFeedback";

// eslint-disable-next-line react-refresh/only-export-components
export const columns: ColumnDef<IActiveService>[] = [
  {
    accessorKey: "serviceName",
    header: "Service Name",
    cell: ({ row }) => <p>{row.getValue("serviceName")}</p>,
  },
  {
    accessorKey: "activateOn",
    header: "Activate On",
    cell: ({ row }) => (
      <p>{moment(row.getValue("activateOn")).format("DD/MM/YYYY")}</p>
    ),
  },
  {
    header: "Feedback",
    cell: ({ row }) => (
      <CustomerServiceFeedback
        serviceName={row.original.serviceName}
        serviceId={row.original.serviceId}
      />
    ),
  },
];

const ActiveServices = () => {
  const limit = 6;
  const [page, setPage] = useState(1);
  const [activeServicesData, setActiveServicesData] = useState<
    IActiveService[]
  >([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const activeServices = useAppSelector(
    (state) => state.authReducer.customer.activeServices
  );

  const table = useReactTable({
    data: activeServicesData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    setActiveServicesData(activeServices?.slice(startIndex, endIndex));
  }, [page, activeServices]);
  return (
    <div className="w-[70%] bg-white px-8 py-4 rounded-sm flex flex-col gap-4 overflow-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">Recent Services</p>
          <PaginatedItem
            setPage={setPage}
            limit={limit}
            totalItems={activeServices?.length}
          />
        </div>
        <hr className="border border-gray-200" />
      </div>
      {activeServicesData?.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-center">There is no active service.</p>
        </div>
      ) : (
        <Table className="border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-center lg:text-lg font-medium"
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
                    <TableCell key={cell.id} className="text-center text-sm">
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
      )}
    </div>
  );
};

export default ActiveServices;
