import React from 'react';

const sample = [
  { id: 'n1', text: 'Your request r1 was accepted', time: new Date().toISOString(), read: false },
  { id: 'n2', text: 'Sandwiches are ready for pickup', time: new Date().toISOString(), read: true },
];

export default function Notifications(){
  return (
    <div>
      <h3>Notifications</h3>
      <div className="notifications">
        {sample.map(n=> (
          <div key={n.id} className={`notification ${n.read? 'read':''}`}>
            <div className="text">{n.text}</div>
            <div className="muted">{new Date(n.time).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
