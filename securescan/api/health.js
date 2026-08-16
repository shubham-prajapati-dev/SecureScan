export default function handler(_req, res) {
  res.status(200).json({
    success: true,
    message: "SecureScan API is running",
    virustotalConfigured: Boolean(process.env.VIRUSTOTAL_API_KEY),
  });
}
