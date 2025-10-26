const express = require("express");
const cors = require("cors");
const cpiindexesRoute = require("./routes/cpiindexes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/cpiindexes", cpiindexesRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
