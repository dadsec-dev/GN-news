const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(cors());
// Serve the static files from the React app
// app.use(express.static(path.join(__dirname, "client/build")));

// An api endpoint that returns a short list of items
app.get("/", (req, res) => {
  const Ratess = async () => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto("https://abokiforex.app/", {
        waitUntil: "load",
        timeout: 0,
      });

      const textContent = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".overlay-text")).map(
          (x) => x.textContent
        );
      });

      console.log(textContent); /* No Problem Mate */
      browser.close();
      fs.writeFileSync("data.json", JSON.stringify(textContent));
      return res.send(textContent);
    } catch (error) {
      console.log(error);
    }
  };

  Ratess();

  console.log("Sent list of items");
});

app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get(
      "https://nairametrics.com/category/industries/tech-news"
    );
    const html = response.data;
    const news = cheerio.load(html);
    const allNews = [];
    news("div.jeg_posts > article").each((index, el) => {
      const post = news(el);
      const title = post.find("h3.jeg_post_title").text().trim();
      const link = post.find("h3.jeg_post_title a").attr("href");
      const image = post.find("img.lazy").attr("src");
      const excerp = post.find("div.jeg_post_excerpt").text().trim();
      const article = { title, link, image, excerp };
      allNews.push(article);
    });
    res.send(allNews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port " + port);
