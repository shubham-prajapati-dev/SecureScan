const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ============================================
// UPLOAD CONFIGURATION
// ============================================

const uploadDirectory = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      file.originalname;

    cb(null, uniqueName);
  },

});

const upload = multer({
  storage: storage,
});


// ============================================
// TEST API
// ============================================

app.get("/", (req, res) => {

  res.json({
    message: "SecureScan API is running",
  });

});


// ============================================
// VIRUSTOTAL SCAN
// ============================================

app.post(
  "/api/scan",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });

      }


      console.log(
        "Scanning:",
        req.file.originalname
      );


      // ========================================
      // SEND FILE TO VIRUSTOTAL
      // ========================================

      const formData = new FormData();

      formData.append(
        "file",
        fs.createReadStream(req.file.path)
      );


      const response = await axios.post(
        "https://www.virustotal.com/api/v3/files",
        formData,
        {
          headers: {
            "x-apikey":
              process.env.VIRUSTOTAL_API_KEY,

            ...formData.getHeaders(),
          },
        }
      );


      const analysisId =
        response.data.data.id;


      console.log(
        "Analysis ID:",
        analysisId
      );


      // ========================================
      // RETURN ANALYSIS ID
      // ========================================

      res.json({

        success: true,

        message:
          "File uploaded successfully",

        fileName:
          req.file.originalname,

        analysisId:
          analysisId,

      });


    } catch (error) {

      console.error(
        error.response?.data ||
        error.message
      );


      res.status(500).json({

        success: false,

        message:
          "File scanning failed",

      });

    }

  }
);


// ============================================
// ANALYSIS STATUS
// ============================================

app.get(
  "/api/scan/:analysisId",
  async (req, res) => {

    try {

      const {
        analysisId
      } = req.params;


      const response = await axios.get(

        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,

        {
          headers: {
            "x-apikey":
              process.env.VIRUSTOTAL_API_KEY,
          },
        }

      );


      const data =
        response.data.data;


      res.json({

        success: true,

        status:
          data.attributes.status,

        progress:
          data.attributes.progress || 0,

        result:
          data,

      });


    } catch (error) {

      console.error(
        error.response?.data ||
        error.message
      );


      res.status(500).json({

        success: false,

        message:
          "Unable to get scan status",

      });

    }

  }
);


// ============================================
// SERVER
// ============================================

app.listen(
  PORT,
  () => {

    console.log(
      `SecureScan backend running on port ${PORT}`
    );

  }
);