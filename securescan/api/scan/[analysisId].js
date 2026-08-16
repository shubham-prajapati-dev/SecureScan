import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  const { analysisId } = req.query;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "VirusTotal API key is not configured on Vercel.",
    });
  }

  if (!analysisId) {
    return res.status(400).json({
      success: false,
      message: "Analysis ID is required.",
    });
  }

  try {
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
        timeout: 30000,
      }
    );

    const data = response.data.data;

    return res.status(200).json({
      success: true,
      status: data.attributes.status,
      progress: data.attributes.progress || 0,
      result: data,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.error?.code ||
      error.message ||
      "Unable to get scan status.";

    console.error("VirusTotal status error:", message);

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      message: `Unable to get scan status: ${message}`,
    });
  }
}
