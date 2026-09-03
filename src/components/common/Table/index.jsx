import React, { useState, useEffect } from 'react';
import Loader from '../Loader';
import './Table.css';

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const Table = ({ 
  columns, 
  data = [], 
  emptyState = "No data available", 
  onRowClick, 
  loading = false,
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "entries"
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const isLoading = Boolean(loading) || (typeof emptyState === 'string' && emptyState.toLowerCase().includes('load'));
  const loadingText = typeof loading === 'string' 
    ? loading 
    : (typeof emptyState === 'string' && emptyState.toLowerCase().includes('load') ? emptyState : "Loading data...");

  const totalEntries = data.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Auto-adjust page if data shrinks
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const displayData = pagination ? data.slice(startIndex, endIndex) : data;

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
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="table-loading-cell">
                <Loader text={loadingText} size="md" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyState}
              </td>
            </tr>
          ) : (
            displayData.map((row, i) => (
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

      {/* Pagination Bar */}
      {pagination && totalEntries > 0 && !isLoading && (
        <div className="table-pagination">
          <div className="table-pagination-left">
            <span className="table-pagination-info">
              Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> {itemLabel}
            </span>
            <div className="table-pagination-size">
              <span>Per page:</span>
              <select 
                value={pageSize} 
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="table-page-size-select"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-pagination-right">
            <button 
              type="button"
              className="table-page-btn table-page-arrow"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validCurrentPage <= 1}
              title="Previous Page"
            >
              ←
            </button>

            {getPageNumbers(validCurrentPage, totalPages).map((p, idx) => 
              p === '...' ? (
                <span key={idx} className="table-page-ellipsis">...</span>
              ) : (
                <button
                  key={idx}
                  type="button"
                  className={`table-page-btn ${validCurrentPage === p ? 'table-page-btn--active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button 
              type="button"
              className="table-page-btn table-page-arrow"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage >= totalPages}
              title="Next Page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;