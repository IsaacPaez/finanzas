'use client';

import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import BusinessCard, { Business } from "./BusinessCard";
import BusinessForm from "./BusinessForm";
import { Modal } from "../ui/Modal";

interface DashboardPanelProps {
  businesses: Business[];
}

export default function DashboardPanel({ businesses }: DashboardPanelProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Mis negocios</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {businesses.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}

        <div
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 cursor-pointer hover:bg-gray-50 transition"
        >
          <PlusCircle size={48} className="text-gray-400" />
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <BusinessForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}