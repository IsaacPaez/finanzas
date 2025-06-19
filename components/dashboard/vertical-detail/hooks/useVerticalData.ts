import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Vertical } from "../types/interfaces"; // ✅ Importar interface tipada

export const useVerticalData = (vertical: Vertical) => { // ✅ Usar Vertical en lugar de any
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(vertical?.variables_schema || {});
  const router = useRouter();

  const handleSaveChanges = async () => {
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('verticals')
        .update({
          variables_schema: schema
        })
        .eq('id', vertical.id);
        
      if (error) throw error;
      
      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return {
    editing,
    setEditing,
    loading,
    schema,
    setSchema,
    handleSaveChanges
  };
};