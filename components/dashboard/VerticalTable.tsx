import React from "react";

export type Vertical = {
  id: string;
  name: string;
  active: boolean;
  variables_schema: { unit: string; estimated: number; price: number };
};

interface TableProps { verticals: Vertical[] }

export default function VerticalTable({ verticals }: TableProps) {
  return (
    <table className="w-full mb-6 table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Nombre</th>
          <th className="p-2">Precio</th>
          <th className="p-2">Producción</th>
          <th className="p-2">Unidad</th>
          <th className="p-2">Activo</th>
          <th className="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {verticals.map((v) => (
          <tr key={v.id} className="border-t">
            <td className="p-2">{v.name}</td>
            <td className="p-2">${v.variables_schema.price.toFixed(2)}</td>
            <td className="p-2">{v.variables_schema.estimated}</td>
            <td className="p-2">{v.variables_schema.unit}</td>
            <td className="p-2">{v.active ? "Activo" : "Inactivo"}</td>
            <td className="p-2">
              <button className="text-blue-600 hover:underline">Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}