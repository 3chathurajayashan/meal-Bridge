import React from 'react';
import { useParams } from 'react-router-dom';

const steps = ['Requested','Approved','Preparing','In Transit','Ready for Collection','Collected/Delivered'];

export default function Tracking(){
  const { id } = useParams();
  const currentIndex = 1; // mock

  return (
    <div>
      <h3>Tracking {id}</h3>
      <div className="timeline">
        {steps.map((s,i)=> (
          <div key={s} className={`step ${i<=currentIndex? 'done':''}`}>
            <div className="dot">{i+1}</div>
            <div className="label">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
