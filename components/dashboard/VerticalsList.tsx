"use client";
import React, { useState } from "react";
import VerticalTable, { Vertical } from "./VerticalTable";
import VerticalForm, { Template } from "./VerticalForm";
import Modal from "./Modal";

interface Props {
  verticals: Vertical[];
  templates: Template[];
  businessId: string;
}

export default function VerticalsList({ verticals, templates, businessId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Nueva vertical
        </button>
      </div>

      <VerticalTable verticals={verticals} />

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Crear Nueva Vertical</h2>
        <VerticalForm
          businessId={businessId}
          templates={templates}
          onCreated={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}