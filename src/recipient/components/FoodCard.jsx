import React from 'react';
import { Link } from 'react-router-dom';

export default function FoodCard({ food, onRequest }) {
  return (
    <div className="card food-card">
      <img src={food.image} alt={food.foodName} className="food-img" />
      <div className="food-body">
        <h4>{food.foodName}</h4>
        <div className="meta">{food.category} • {food.quantity} {food.unit}</div>
        <div className="meta small">Donor: {food.donorName} • {food.distance}</div>
        <div className="badges"><span className={`status ${food.status.toLowerCase()}`}>{food.status}</span></div>
        <div className="card-actions">
          <Link to={`/recipient/food/${food.id}`} className="btn btn-outline">View Details</Link>
          <button className="btn btn-primary" onClick={() => onRequest(food)}>Request Food</button>
        </div>
      </div>
    </div>
  );
}
