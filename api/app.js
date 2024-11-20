const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { scrapeData } = require("./webCrawler"); // Uncomment and ensure this is defined

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Path to the JSON file for local storage
const DATA_FILE = path.join(__dirname, "data.json");

// Helper function to read data from the JSON file
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

// Helper function to write data to the JSON file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Ensure the JSON file exists when the server starts
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
}

// API: Search for a person or company
app.get("/api/search", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const records = readData();
    const results = records.filter((record) =>
      record.name.toLowerCase().includes(query.toLowerCase())
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "An error occurred during the search." });
  }
});

// API: Trigger web scraping to update the database
app.post("/api/scrape", async (req, res) => {
  try {
    const data = await scrapeData();
    const existingRecords = readData();

    // Merge scraped data with existing records
    const updatedRecords = data.map((newRecord) => {
      const existingRecord = existingRecords.find(
        (record) => record.name === newRecord.name
      );
      return existingRecord
        ? { ...existingRecord, ...newRecord, lastUpdated: new Date() }
        : { ...newRecord, lastUpdated: new Date() };
    });

    writeData(updatedRecords);
    res.json({ message: "Database updated successfully.", updatedRecords });
  } catch (error) {
    res.status(500).json({ error: "Web scraping failed." });
  }
});

// Server configuration
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
