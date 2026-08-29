import React, { useState } from 'react';

export default function Profile(){
  const [profile, setProfile] = useState({ name: 'Recipient User', email: 'you@example.com', phone: '', address: '', org: '', type: 'Individual' });

  function save(){
    alert('Profile saved (mock)');
  }

  return (
    <div>
      <h3>Profile</h3>
      <div className="profile-form">
        <label>Name</label>
        <input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} />
        <label>Email</label>
        <input value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})} />
        <label>Phone</label>
        <input value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} />
        <label>Address</label>
        <input value={profile.address} onChange={e=>setProfile({...profile,address:e.target.value})} />
        <label>Organization (optional)</label>
        <input value={profile.org} onChange={e=>setProfile({...profile,org:e.target.value})} />
        <div className="form-actions">
          <button className="btn btn-outline">Edit</button>
          <button className="btn btn-primary" onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
