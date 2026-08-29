import React, { useState } from 'react';
import { createRequest } from '../services/api';

export default function RequestForm({ food, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [people, setPeople] = useState(1);
  const [option, setOption] = useState('Pickup');
  const [time, setTime] = useState('ASAP');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await createRequest({ foodId: food.id, foodName: food.foodName, quantity, unit: food.unit, donor: food.donorName, location: food.location, pickupOption: option, preferredTime: time, message });
    setLoading(false);
    onSuccess && onSuccess(res);
  }

  return (
    <div className="modal">
      <div className="modal-card">
        <h3>Request {food.foodName}</h3>
        <label>Quantity</label>
        <input type="number" value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} min={1} />
        <label>People to serve</label>
        <input type="number" value={people} onChange={(e)=>setPeople(Number(e.target.value))} min={1} />
        <label>Pickup/Delivery</label>
        <select value={option} onChange={(e)=>setOption(e.target.value)}>
          <option>Pickup</option>
          <option>Delivery</option>
        </select>
        <label>Preferred time</label>
        <input value={time} onChange={(e)=>setTime(e.target.value)} />
        <label>Message</label>
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} />
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading? 'Requesting...' : 'Confirm Request'}</button>
        </div>
      </div>
    </div>
  );
}
