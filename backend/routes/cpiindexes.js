const express = require("express");
const sql = require("mssql");
const config = require("../dbConfig");

const router = express.Router();

// GET /api/cpiindexes/:year/:month
router.get("/:year/:month", async (req, res) => {
  const { year, month } = req.params;

  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
        .input("Year", sql.Int, year)
        .input("Month", sql.Int, month)
      .query(`
        SELECT *
        FROM cpiindexes
        WHERE
          Year = @Year AND
          Month = @Month
      `);

    if (result.recordset.length === 0) {
      return res.status(404).send("No data found for the given parameters.");
    }

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
