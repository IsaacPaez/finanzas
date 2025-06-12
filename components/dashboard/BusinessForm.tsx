"use client";

import React, { useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";
import { useRouter } from "next/navigation";

interface BusinessFormProps {
  onSuccess?: () => void;
}

export default function BusinessForm({ onSuccess }: BusinessFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl: string | null = null;
    if (file) {
      try {
        imageUrl = await uploadImageToCloudinary(file);
      } catch (err) {
        console.error("Error uploading to Cloudinary", err);
      }
    }

    // obtener usuario en cliente
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { error } = await supabase.from("businesses").insert([
      {
        owner_id: user.id,
        name,
        type,
        description: description || null,
        image_url: imageUrl,
      },
    ]);

    setLoading(false);
    if (!error) {
      router.refresh();
      onSuccess?.();
    } else {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full border rounded-md"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Tipo
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="mt-1 block w-full border rounded-md"
        >
          <option value="">Selecciona uno</option>
          <option value="Lecheria">Lechería</option>
          <option value="Ganaderia">Ganadería</option>
          <option value="Agricultura">Agricultura</option>
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border rounded-md"
        />
      </div>
      <div>
        <label>Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {loading ? "Creando..." : "Crear negocio"}
      </button>
    </form>
  );
}