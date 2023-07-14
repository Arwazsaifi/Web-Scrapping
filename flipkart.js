const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();

async function scrapeData() {
  const data = {
    list: []
  };

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  let hasNextPage = true;
  let pageNumber = 1;
  let totalResults = 0;

  while (hasNextPage && totalResults < 100) {
    await page.goto(`https://www.flipkart.com/search?q=mobiles&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&page=${pageNumber}`, {
      timeout: 0,
      waitUntil: 'networkidle0'
    });

    console.log(`Scraping page ${pageNumber}`);

    const productData = await page.evaluate(() => {
      const items = document.querySelectorAll('div[data-id]');
      const productList = [];

      items.forEach((item) => {
        const id = item.getAttribute('data-id');
        const name = item.querySelector('div._4rR01T')?.innerText;
        const rating = item.querySelector('div._3LWZlK')?.innerText;
        const description = item.querySelector('div.fMghEO')?.innerText;
        const url = item.querySelector('a[href]')?.href;

        productList.push({
          id: id,
          name: name,
          rating: rating,
          description: description,
          url: url
        });
      });

      return productList;
    });

    data.list.push(...productData);
    totalResults = totalResults+productData.length;

    hasNextPage = await page.evaluate(() => {
      const nextButton = document.querySelector('a._1LKTO3');
      return !!nextButton;
    });

    pageNumber++;
  }

  console.log(`Successfully scraped ${totalResults} products`);
  await browser.close();

  return data;
}

app.get('/fetch/flipkart/mobiles', async (req, res) => {
  try {
    const productData = await scrapeData();
    res.json(productData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});
