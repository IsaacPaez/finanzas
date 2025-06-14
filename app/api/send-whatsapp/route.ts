import { NextResponse } from "next/server";

// Añade esta función para verificar que la API funciona
export async function GET() {
  return NextResponse.json({ status: "API funcionando" });
}

export async function POST(request: Request) {
  try {
    // Obtener el cuerpo de la petición
    const body = await request.json();
    const { phone, pin } = body;
    
    // Registro para depuración
    console.log("Petición recibida:", { phone, pin });
    
    if (!phone || !pin) {
      return NextResponse.json(
        { message: "Se requiere teléfono y PIN" },
        { status: 400 }
      );
    }
    
    // Acceder a las variables de entorno
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    
    // Verificar que las variables de entorno existan
    if (!apiUrl || !apiToken) {
      console.error("Variables de entorno faltantes:", { apiUrl, apiToken });
      return NextResponse.json(
        { message: "Error de configuración del servidor" },
        { status: 500 }
      );
    }
    
    // Realizar la petición a la API de WhatsApp
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
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
    
    // Obtener respuesta como texto primero para depurar
    const responseText = await response.text();
    console.log("Respuesta WhatsApp (raw):", responseText);
    
    // Intentar parsear como JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Error al parsear respuesta:", e);
      return NextResponse.json(
        { message: "Error en la respuesta de WhatsApp", raw: responseText },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      console.error("Error de WhatsApp API:", responseData);
      return NextResponse.json(
        { message: "Error al enviar mensaje de WhatsApp", error: responseData },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { message: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}