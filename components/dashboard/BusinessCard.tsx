import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface Business {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
}

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/business/${business.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md overflow-hidden transition"
    >
      {business.image_url && (
        <Image
          src={business.image_url}
          alt={business.name}
          width={400}
          height={128}
          className="w-full h-32 object-cover"
          priority={false}
        />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold">{business.name}</h2>
        <p className="text-sm text-gray-500">{business.type}</p>
        {business.description && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
            {business.description}
          </p>
        )}
      </div>
    </Link>
  );
}