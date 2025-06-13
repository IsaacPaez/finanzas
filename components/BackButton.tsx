"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800"
    >
      ← Volver
    </button>
  );
}