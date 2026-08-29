import React from 'react';
import { Outlet } from 'react-router-dom';
import RecipientSidebar from './RecipientSidebar';
import RecipientNavbar from './RecipientNavbar';

export default function RecipientLayout() {
  return (
    <div className="recipient-app">
      <RecipientSidebar />
      <div className="main-area">
        <RecipientNavbar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
