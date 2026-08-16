const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
  })
);
app.use(express.json());

const uploadDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 32 * 1024 * 1024 },
});

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "SecureScan API is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    virustotalConfigured: Boolean(VIRUSTOTAL_API_KEY),
  });
});

app.post("/api/scan", upload.single("file"), async (req, res) => {
  let uploadedPath;

  try {
    if (!VIRUSTOTAL_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "VirusTotal API key is not configured on the server.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    uploadedPath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(uploadedPath));

    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      }
    );

    return res.json({
      success: true,
      message: "File uploaded successfully.",
      fileName: req.file.originalname,
      analysisId: response.data.data.id,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const vtMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.error?.code ||
      error.message;

    console.error("VirusTotal scan error:", vtMessage);

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      message: `File scanning failed: ${vtMessage}`,
    });
  } finally {
    if (uploadedPath) {
      fs.promises.unlink(uploadedPath).catch(() => {});
    }
  }
});

app.get("/api/scan/:analysisId", async (req, res) => {
  try {
    if (!VIRUSTOTAL_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "VirusTotal API key is not configured on the server.",
      });
    }

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(
        req.params.analysisId
      )}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
        timeout: 30000,
      }
    );

    const data = response.data.data;

    return res.json({
      success: true,
      status: data.attributes.status,
      progress: data.attributes.progress || 0,
      result: data,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const vtMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.error?.code ||
      error.message;

    console.error("VirusTotal status error:", vtMessage);

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      message: `Unable to get scan status: ${vtMessage}`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`SecureScan backend running on port ${PORT}`);
});
