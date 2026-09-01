const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Razorpay = require("razorpay");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PRO_PRICE = Number(process.env.PRO_PRICE || 299);

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

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
  res.json({ success: true, message: "SecureScan API is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    virustotalConfigured: Boolean(VIRUSTOTAL_API_KEY),
    razorpayConfigured: Boolean(razorpay),
  });
});

app.post("/api/payment/create-order", async (_req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Razorpay API keys are not configured on the server.",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(PRO_PRICE * 100),
      currency: "INR",
      receipt: `pro_${Date.now()}`,
      notes: { plan: "SecureScan Pro" },
    });

    return res.json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      plan: "Pro",
      price: PRO_PRICE,
    });
  } catch (error) {
    console.error("Razorpay order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
});

app.post("/api/payment/verify", (req, res) => {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured." });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification data." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!valid) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }

    return res.json({ success: true, message: "Payment verified. Pro access activated." });
  } catch (error) {
    console.error("Razorpay verification error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to verify payment." });
  }
});

app.post("/api/scan", upload.single("file"), async (req, res) => {
  let uploadedPath;
  try {
    if (!VIRUSTOTAL_API_KEY) return res.status(500).json({ success: false, message: "VirusTotal API key is not configured on the server." });
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    uploadedPath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(uploadedPath));
    const response = await axios.post("https://www.virustotal.com/api/v3/files", formData, {
      headers: { ...formData.getHeaders(), "x-apikey": VIRUSTOTAL_API_KEY },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    });
    return res.json({ success: true, message: "File uploaded successfully.", fileName: req.file.originalname, analysisId: response.data.data.id });
  } catch (error) {
    const status = error.response?.status || 500;
    const vtMessage = error.response?.data?.error?.message || error.response?.data?.error?.code || error.message;
    console.error("VirusTotal scan error:", vtMessage);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ success: false, message: `File scanning failed: ${vtMessage}` });
  } finally {
    if (uploadedPath) fs.promises.unlink(uploadedPath).catch(() => {});
  }
});

app.get("/api/scan/:analysisId", async (req, res) => {
  try {
    if (!VIRUSTOTAL_API_KEY) return res.status(500).json({ success: false, message: "VirusTotal API key is not configured on the server." });
    const response = await axios.get(`https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(req.params.analysisId)}`, {
      headers: { "x-apikey": VIRUSTOTAL_API_KEY },
      timeout: 30000,
    });
    const data = response.data.data;
    return res.json({ success: true, status: data.attributes.status, progress: data.attributes.progress || 0, result: data });
  } catch (error) {
    const status = error.response?.status || 500;
    const vtMessage = error.response?.data?.error?.message || error.response?.data?.error?.code || error.message;
    console.error("VirusTotal status error:", vtMessage);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ success: false, message: `Unable to get scan status: ${vtMessage}` });
  }
});

app.listen(PORT, () => console.log(`SecureScan backend running on port ${PORT}`));
