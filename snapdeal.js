const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

async function scrapeData() {
  const data = {
    list: []
  };

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.snapdeal.com/search?keyword=tshirt%20men&santizedKeyword=tshirts&catId=0&categoryId=0&suggested=true&vertical=p&noOfResults=20&searchState=&clickSrc=suggested&lastKeyword=&prodCatId=&changeBackToAll=false&foundInAll=false&categoryIdSearched=&cityPageUrl=&categoryUrl=&url=&utmContent=&dealDetail=&sort=rlvncy', {
    timeout: 0,
    waitUntil: 'networkidle0'
  });

  const tshirtData = await page.evaluate(() => {
    const items = document.querySelectorAll('div[data-catid]');
    const productList = [];

    items.forEach((item, index) => {
      console.log(`Scraping data from product: ${index}`);
      const id = item.getAttribute('data-catid');
      const img=item.querySelector('div.product-tuple-image')?.innerText;
      const title = item.querySelector('p.product-title')?.innerText;
      const description=item.querySelector('div.product-tuple-description')?.innerText;

      productList.push({
        id: id,
        img:img,
        title: title,
        description:description

      });
    });

    return productList;
  });

  console.log(`Successfully scraped ${tshirtData.length} products`);
  data.list = tshirtData;

  await browser.close();

  return data;
}

app.get('/fetch/snapdeal/tshirts', async (req, res) => {
  try {
    const productData = await scrapeData();
    res.json(productData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
