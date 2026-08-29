import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search food...' }) {
  return (
    <div className="searchbar">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
