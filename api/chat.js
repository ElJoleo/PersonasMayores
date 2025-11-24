// api/chat.js

// Importamos la librería de Google Gemini para Node.js
import { GoogleGenAI } from '@google/genai';

// La clave se lee de la Variable de Entorno de Vercel (la que pusiste como GEMINI_API_KEY)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey);
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// Instrucción de sistema para el rol del asistente (sirve para Analizador y Chatbot)
const systemInstruction = "Eres 'Protector Mayor', un asistente virtual chileno, amable y muy paciente diseñado para ayudar a adultos mayores. Responde preguntas sobre cómo evitar estafas, usar el celular, o seguridad bancaria. Usa un lenguaje muy sencillo, cálido y respetuoso (trata de 'usted'). Sé conciso. Nunca pidas datos personales reales. Si preguntan algo peligroso, advierte con firmeza pero cariño.";

// Función principal que Vercel expone como un endpoint (ej: /api/chat)
export default async function handler(req, res) {
  // Verificación de método (solo permitimos POST desde el frontend)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { prompt } = req.body; // El mensaje que viene desde index.html

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body." });
    }

    // Llamada segura a la API de Gemini usando la clave secreta
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
        }
    });

    // Enviamos solo la respuesta de texto de vuelta al navegador
    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Si la clave es incorrecta, el error será visible aquí, pero no la clave.
    res.status(500).json({ error: "Hubo un problema al comunicarse con la IA." });
  }
}