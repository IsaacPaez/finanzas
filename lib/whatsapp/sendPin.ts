export async function sendPinWhatsApp({ phone, pin }: { phone: string; pin: string }) {
  try {
    // En lugar de llamar directamente a la API de WhatsApp,
    // llamamos a nuestra API interna
    const response = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone.replace("+", ""), // Mantener la lógica de formateo aquí
        pin
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al enviar mensaje:", errorData);
      throw new Error(errorData.message || "Error desconocido");
    }
    
    return await response.json();
  } catch (error: any) {
    console.error("Error al enviar PIN por WhatsApp:", error);
    throw error; // Re-lanzar el error para manejarlo en el componente
  }
}