const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

async function scrapeCategoryPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.flipkart.com/search?q=mobiles&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&as-pos=1&as-type=HISTORY&as-backfill=on', {
    timeout: 0,
    waitUntil: 'networkidle0'
  });

  const productUrls = await page.evaluate(() => {
    const urls = [];
    const products = document.querySelectorAll('a._1fQZEK');
    products.forEach((product) => {
      const url = product.getAttribute('href');
      urls.push(url);
    });
    return urls;
  });

  await browser.close();

  return productUrls;
}

async function scrapeProductPage(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, {
    timeout: 0,
    waitUntil: 'networkidle0'
  });

  const productData = await page.evaluate(() => {
    const nameElement = document.querySelector('span.B_NuCI');
    const ratingElement = document.querySelector('div._3LWZlK');
    const descriptionElement = document.querySelector('div._3nkT-2');
    const highlightElement=document.querySelector('div._2cM9lP')
    const priceElement=document.querySelector('div._25b18c')

      
    const name = nameElement ? nameElement.innerText : 'N/A';
    const rating = ratingElement ? ratingElement.innerText : 'N/A';
    const description = descriptionElement ? descriptionElement.innerText : 'N/A';
    const highlight=highlightElement ? highlightElement.innerText : 'N/A';
    const price=priceElement  ? priceElement.innerText : 'N/A';
  
    return {
      name: name,
      rating: rating,
      description: description,
      highlight:highlight,
      price:price
    };
  });
  await browser.close();

  return productData;
}

app.get('/fetch/flipkart/mobile/full', async (req, res) => {
  try {
    const productUrls = await scrapeCategoryPage();
    const productDataList = [];

    for (const url of productUrls) {
      const productData = await scrapeProductPage(`https://www.flipkart.com${url}`);
      productDataList.push(productData);
    }

    res.json({ products: productDataList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
