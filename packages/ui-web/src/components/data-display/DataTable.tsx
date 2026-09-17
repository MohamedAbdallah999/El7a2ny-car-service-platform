import type { Key, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface DataTableColumn<RowData> {
  id: string;
  header: ReactNode;
  cell: (row: RowData) => ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export interface DataTableProps<RowData> {
  columns: ReadonlyArray<DataTableColumn<RowData>>;
  data: ReadonlyArray<RowData>;
  getRowKey: (row: RowData) => Key;
  caption?: string;
  emptyContent?: ReactNode;
  className?: string;
}

export function DataTable<RowData>({
  caption,
  className,
  columns,
  data,
  emptyContent = "No records found.",
  getRowKey,
}: DataTableProps<RowData>) {
  return (
    <div className={classNames("ui-table-wrap", className)}>
      <table className="ui-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={classNames(
                  `ui-table__cell--${column.align ?? "start"}`,
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="ui-table__empty" colSpan={columns.length}>
                {emptyContent}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={classNames(
                      `ui-table__cell--${column.align ?? "start"}`,
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
