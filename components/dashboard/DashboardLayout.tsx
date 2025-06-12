import React from "react";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    // Ya no incluimos <Sidebar /> aquí,
    // porque el ProtectedLayout lo envuelve.
    <div className="min-h-screen bg-gray-50">{children}</div>
  );
}