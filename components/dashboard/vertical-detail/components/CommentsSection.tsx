import { MessageSquare } from "lucide-react";

interface CommentsSectionProps {
  cow: {
    comments?: string;
  };
  comments: string;
  setComments: (comments: string) => void;
  saving: boolean;
  onSaveComments: () => void;
}

export default function CommentsSection({ 
  cow, 
  comments, 
  setComments, 
  saving, 
  onSaveComments 
}: CommentsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <MessageSquare size={20} />
        Comentarios y Notas
      </h3>
      
      {/* Mostrar comentarios existentes */}
      {cow.comments && (
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <p className="text-sm text-gray-600 mb-1">Comentarios actuales:</p>
          <p className="text-gray-800">{cow.comments}</p>
        </div>
      )}
      
      {/* Editor de comentarios */}
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Agregar comentarios sobre la vaca (salud, comportamiento, observaciones...)"
        className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm text-gray-500">
          {comments.length}/500 caracteres
        </p>
        <button
          onClick={onSaveComments}
          disabled={saving || comments.length > 500}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Comentarios"}
        </button>
      </div>
    </div>
  );
}