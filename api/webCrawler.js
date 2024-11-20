const puppeteer = require("puppeteer");

async function scrapeData() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const data = [];

    // Example: Crawling a public records website
    await page.goto("https://example.com/public-records");

    // Extract data from the page
    const results = await page.evaluate(() => {
      const rows = document.querySelectorAll(".record-row");
      return Array.from(rows).map((row) => ({
        name: row.querySelector(".name").innerText,
        type: row.querySelector(".type").innerText.toLowerCase(),
        crimes: row.querySelector(".crimes").innerText.split(", "),
        underInvestigation:
          row.querySelector(".investigation-status").innerText ===
          "Under Investigation",
      }));
    });

    data.push(...results);

    await browser.close();
    return data;
  } catch (error) {
    console.error("Error during web scraping:", error);
    throw new Error("Web scraping failed");
  }
}

module.exports = { scrapeData };
