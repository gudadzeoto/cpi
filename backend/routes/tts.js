const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/", async (req, res) => {
  const { text = "", lang = "en" } = req.query;

  try {
    const url = `https://www.geostat.ge/cpi/request.php?text=${encodeURIComponent(text)}&lang=${lang}`;
    const response = await fetch(url);

    if (!response.ok) return res.status(500).send("Failed to fetch TTS");

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("TTS proxy error");
  }
});

module.exports = router;
