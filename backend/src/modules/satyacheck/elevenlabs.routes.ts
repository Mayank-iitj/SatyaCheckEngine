import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { config } from "../../config";

const router = Router();

// Endpoint to generate TTS from ElevenLabs
// POST /api/satyacheck/tts
router.post(
  "/tts",
  asyncHandler(async (req: Request, res: Response) => {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = req.body; // Default voice Rachel (British, Calm)

    if (!text) {
      res.status(400).json({ success: false, error: "Text is required" });
      return;
    }

    if (!config.elevenlabsApiKey) {
      res.status(500).json({ success: false, error: "ElevenLabs API key is not configured" });
      return;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": config.elevenlabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2", // using v2 for better multilingal if needed
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API Error:", errorText);
        res.status(response.status).json({ success: false, error: "Failed to generate audio" });
        return;
      }

      const audioBuffer = await response.arrayBuffer();

      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error("Error generating TTS:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  })
);

export { router as elevenlabsRoutes };
