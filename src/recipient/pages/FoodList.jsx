import React, { useEffect, useState } from 'react';
import { listFoods } from '../services/api';
import FoodCard from '../components/FoodCard';
import SearchBar from '../components/SearchBar';

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => { listFoods().then(setFoods); }, []);

  const filtered = foods.filter(f => {
    if (category !== 'All' && f.category !== category) return false;
    if (q && !f.foodName.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const categories = ['All', ...Array.from(new Set(foods.map(f => f.category)) )];

  return (
    <div>
      <div className="list-header">
        <SearchBar value={q} onChange={setQ} />
        <select value={category} onChange={(e)=>setCategory(e.target.value)}>
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid">
        {filtered.map(f => <FoodCard key={f.id} food={f} onRequest={() => alert('Request modal')} />)}
        {filtered.length===0 && <div className="empty">No available food found.</div>}
      </div>
    </div>
  );
}
