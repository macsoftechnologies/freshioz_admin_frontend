import React from 'react';
import './Table.css';

const Table = ({ columns, data, emptyState = "No data available", onRowClick }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr 
                key={i} 
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "clickable-row" : ""}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map((col, j) => (
                  <td key={j}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;