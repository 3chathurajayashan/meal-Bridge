import React from 'react';

export default function DashboardCard({ title, value, children }) {
  return (
    <div className="card stat-card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {children}
    </div>
  );
}
