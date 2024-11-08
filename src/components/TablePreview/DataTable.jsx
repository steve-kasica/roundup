import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from "@tanstack/react-table"
   
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"


function DataTable({tables}) {

    const data = tables.filter(table => table.isSelected);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {}
                </TableHeader>
            </Table>
        </div>
    );
}

export default DataTable;