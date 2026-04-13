import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="max-w-lg mx-auto min-h-screen relative">
      <Outlet />
      <BottomNav />
    </div>
  );
}