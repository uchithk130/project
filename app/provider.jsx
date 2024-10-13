'use client';
import React from 'react';
import Sidebar from '../app/components/Sidebar';

function Provider({ children }) {
  return (
    <div className="flex w-full">
      <Sidebar />
      <main className="ml-64 w-full h-full">
        {children}
      </main>
    </div>
  );
}

export default Provider;
