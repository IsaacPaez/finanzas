export async function sendPinWhatsApp({ phone, pin }: { phone: string; pin: string }) {
  const apiUrl = process.env.WHATSAPP_API_URL!;
  const apiToken = process.env.WHATSAPP_API_TOKEN!;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
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
    throw new Error(await response.text());
  }
}