export async function sendPinWhatsApp({ phone, pin }: { phone: string; pin: string }) {
  try {
    const response = await fetch("https://graph.facebook.com/v17.0/659221160602229/messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer EAAOQryFEidABO1ZBrHeTm7F2LtKHQsavL3K5gEcP9lsWYrTYXqCTTFQHiohBiPMZBhZCkskRRxfwCfe9ZB7QhEDqFGZAAUwvsrPqVVKbZAbiwsUEUzE2ZA2sjRe87AIfoPrJqXqfMlGIYUZBB5qjZA0FbuJCBJq3F8XoPgnK11cBQKTiUUnutyVe7Mfgg1j8ZB5wZDZD",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace("+", ""),
        type: "template",
        template: {
          name: "dumar_auth",
          language: { code: "es" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: pin },
                { type: "text", text: phone }
              ]
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                { type: "text", text: "token123" }
              ]
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de WhatsApp:", errorText);
      throw new Error(errorText);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error("Error al enviar PIN por WhatsApp:", error);
    throw error; // Re-lanzar el error para manejarlo en el componente
  }
}