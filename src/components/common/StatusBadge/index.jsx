import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const normalizedStatus = status ? status.toLowerCase() : 'unknown';
  return (
    <span className={`badge badge-${normalizedStatus}`}>
      {status}
    </span>
  );
};

export default StatusBadge;