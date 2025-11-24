// api/chat.js
// Configura esta función para que se ejecute en el entorno Node.js de Vercel
export const config = {
    runtime: 'nodejs'
};

// Usa 'require' en lugar de 'import' para evitar problemas de compilación en Vercel
const { GoogleGenAI } = require('@google/genai');

// La clave se lee de la Variable de Entorno de Vercel (GEMINI_API_KEY)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey);
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// Instrucción de sistema para definir el rol del asistente
const systemInstruction = "Eres 'Protector Mayor', un asistente virtual chileno, amable y muy paciente diseñado para ayudar a adultos mayores. Responde preguntas sobre cómo evitar estafas, usar el celular, o seguridad bancaria. Usa un lenguaje muy sencillo, cálido y respetuoso (trata de 'usted'). Sé conciso. Nunca pidas datos personales reales. Si preguntan algo peligroso, advierte con firmeza pero cariño.";

// Función principal que Vercel llama como endpoint (/api/chat)
module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { prompt } = req.body; // El mensaje que viene del frontend

    if (!prompt || !apiKey) {
      // Si la clave no está definida en Vercel, da un error de servidor.
      // Esta es la primera línea de defensa de seguridad.
      return res.status(500).json({ text: "Error de configuración: La clave API secreta no se cargó." });
    }

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
        }
    });

    // Envía la respuesta de texto (text) de vuelta al frontend
    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Execution Error:", error);
    // Este mensaje de error se mostrará en el frontend
    res.status(500).json({ text: "Hubo un problema temporal al comunicarse con el asistente. Por favor intente de nuevo más tarde." });
  }
};
