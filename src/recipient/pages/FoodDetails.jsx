import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFoodById } from '../services/api';

export default function FoodDetails() {
  const { id } = useParams();
  const [food, setFood] = useState(null);

  useEffect(() => { getFoodById(id).then(setFood); }, [id]);

  if (!food) return <div className="loading">Loading...</div>;

  return (
    <div className="food-details">
      <div className="detail-grid">
        <img src={food.image} alt="" className="detail-img" />
        <div>
          <h2>{food.foodName}</h2>
          <p className="muted">{food.category} • {food.quantity} {food.unit}</p>
          <p>{food.description}</p>
          <ul className="info-list">
            <li><strong>Donor:</strong> {food.donorName}</li>
            <li><strong>Location:</strong> {food.location} ({food.distance})</li>
            <li><strong>Available:</strong> {food.availableTime}</li>
            <li><strong>Expiry:</strong> {new Date(food.expiryDate).toLocaleString()}</li>
            <li><strong>Status:</strong> <span className={`status ${food.status.toLowerCase()}`}>{food.status}</span></li>
          </ul>

          <div className="actions">
            <button className="btn btn-primary" onClick={() => alert('Open Request Form')}>Request Food</button>
          </div>
        </div>
      </div>
    </div>
  );
}
