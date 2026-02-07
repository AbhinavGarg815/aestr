require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
// store last received message
let lastMessage = null;

/* Health check */
app.get("/", (req, res) => {
  res.send("Webhook server is running 🚀");
});

/* Webhook verification (Meta calls this) */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

/* Receive WhatsApp messages */
app.post("/webhook", async (req, res) => {
  const msg =
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!msg) return res.sendStatus(200);

  console.log("Incoming message type:", msg.type);

  /* TEXT */
  if (msg.type === "text") {
    lastMessage = {
      type: "text",
      text: msg.text.body,
      timestamp: Number(msg.timestamp) 
    };
  }

  /* IMAGE */
  if (msg.type === "image") {
    try {
      const mediaId = msg.image.id;
      console.log("Downloading mediaId:", mediaId);

      // 1️⃣ Get media URL
      const mediaMeta = await axios.get(
        `https://graph.facebook.com/v22.0/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`
          }
        }
      );

      // 2️⃣ Download image binary
      const imageRes = await axios.get(mediaMeta.data.url, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        },
        responseType: "arraybuffer"
      });

      // 3️⃣ Save image locally
      fs.mkdirSync("media", { recursive: true });
      const fileName = `img_${Date.now()}.jpg`;
      const filePath = path.join(__dirname, "media", fileName);

      fs.writeFileSync(filePath, imageRes.data);

      console.log("✅ Image saved:", fileName);

      // 4️⃣ Send path to frontend
      lastMessage = {
        type: "image",
        imageUrl: `/media/${fileName}`,
        timestamp: Number(msg.timestamp) 
      };

    } catch (err) {
      console.error(
        "❌ Image error:",
        err.response?.data || err.message
      );
    }
  }

  //location
   if (msg.type === "location") {
    lastMessage = {
      type: "location",
      timestamp: Number(msg.timestamp),
      location: {
        latitude: msg.location.latitude,
        longitude: msg.location.longitude
      },
      timestamp: msg.timestamp
    };

    console.log("📍 Location received");
  }

  res.sendStatus(200);
});

/* Serve images */
app.use("/media", express.static("media"));

/* API for frontend */
app.get("/latest", (req, res) => {
  res.json(lastMessage);
});

app.listen(3001, () => {
  console.log("Backend running at http://localhost:3001");
});
