import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import { listFoods, listRequests } from '../services/api';
import FoodCard from '../components/FoodCard';

export default function Dashboard() {
  const [foods, setFoods] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    listFoods().then(setFoods);
    listRequests().then(setRequests);
  }, []);

  return (
    <div>
      <section className="welcome-section">
        <h2>Welcome to MealBridge</h2>
        <p>Find nearby available donations and manage your requests.</p>
      </section>

      <section className="stats-grid">
        <DashboardCard title="Available Food" value={foods.length} />
        <DashboardCard title="My Requests" value={requests.length} />
        <DashboardCard title="Accepted" value={requests.filter(r => r.status==='Accepted').length} />
        <DashboardCard title="Completed" value={requests.filter(r => r.status==='Collected' || r.status==='Delivered').length} />
      </section>

      <section className="nearby">
        <h3>Nearby Available Food</h3>
        <div className="grid">
          {foods.map(f => (
            <FoodCard key={f.id} food={f} onRequest={() => alert('Open request modal in real app')} />
          ))}
        </div>
      </section>
    </div>
  );
}
