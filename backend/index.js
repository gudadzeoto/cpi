const express = require("express");
const cors = require("cors");
const cpiindexesRoute = require("./routes/cpiindexes");
const ttsRoute = require("./routes/tts"); // <-- new

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/cpiindexes", cpiindexesRoute);
app.use("/api/tts", ttsRoute); // <-- new

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
