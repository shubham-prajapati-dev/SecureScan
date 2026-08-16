import axios from "axios";
import FormData from "form-data";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

function runMiddleware(req, res, middleware) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "VirusTotal API key is not configured on Vercel.",
    });
  }

  try {
    await runMiddleware(req, res, upload.single("file"));

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-apikey": apiKey,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully.",
      fileName: req.file.originalname,
      analysisId: response.data.data.id,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.error?.code ||
      error.message ||
      "File scanning failed.";

    console.error("VirusTotal upload error:", message);

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      message: `File scanning failed: ${message}`,
    });
  }
}
