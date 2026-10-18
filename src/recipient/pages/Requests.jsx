import React, { useEffect, useState } from 'react';
import { listRequests, cancelRequest } from '../services/api';

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => { listRequests().then(setRequests); }, []);

  async function handleCancel(id) {
    await cancelRequest(id);
    setRequests((s) => s.map(r => r.id===id? { ...r, status: 'Cancelled' } : r));
  }

  return (
    <div>
      <h3>My Requests</h3>
      <div className="list">
        {requests.map(r => (
          <div key={r.id} className="request-card">
            <div><strong>{r.foodName}</strong> • {r.quantity} {r.unit}</div>
            <div className="muted">{new Date(r.requestDate).toLocaleString()} • {r.location}</div>
            <div className="request-actions">
              <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>
              {r.status === 'Requested' && <button className="btn btn-outline" onClick={()=>handleCancel(r.id)}>Cancel</button>}
            </div>
          </div>
        ))}
        {requests.length===0 && <div className="empty">You have no requests yet.</div>}
      </div>
    </div>
  );
}
