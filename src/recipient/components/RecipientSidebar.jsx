import React from 'react';
import { NavLink } from 'react-router-dom';

export default function RecipientSidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">MealBridge</div>
      <nav>
        <NavLink to="/recipient/dashboard">Dashboard</NavLink>
        <NavLink to="/recipient/food">Available Food</NavLink>
        <NavLink to="/recipient/requests">My Requests</NavLink>
        <NavLink to="/recipient/tracking/r1">Track Requests</NavLink>
        <NavLink to="/recipient/notifications">Notifications</NavLink>
        <NavLink to="/recipient/profile">Profile</NavLink>
        <a className="logout" href="#">Logout</a>
      </nav>
    </aside>
  );
}
