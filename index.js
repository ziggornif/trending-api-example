const express = require('express');
const puppeteer = require('puppeteer');

let browser;

async function callGithubTrending(language, since = 'today') {
  try {
    const results = [];
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.resourceType() === 'document') {
        req.continue();
      } else {
        req.abort();
      }
    });
    await page.goto(`https://github.com/trending/${language}?since=${since}`);
    await navigationPromise;
    const elements = await page.$$('.Box > div > .Box-row');

    for (const element of elements) {
      const project = await element.$eval('.h3', s =>
        s.textContent.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      );
      const description = await element.$eval('.col-9', d =>
        d.textContent.trim(),
      );
      const url = await element.$eval('.h3 > a', a => a.href);
      results.push({
        project,
        description,
        url,
      });
    }

    page.close();

    return {
      since,
      count: results.length,
      projects: results,
    };
  } catch (error) {
    throw Error('Github call error');
  }
}

const app = express();

app.get('/', (req, res) => {
  res.redirect('/api');
});

app.get('/api', (req, res) => {
  res.json([
    {
      url: 'http://localhost:3000/api/trending',
      title: 'Trending root page',
    },
    {
      url: 'http://localhost:3000/api/trending/:language',
      title: 'Trending language page',
    },
  ]);
});

app.get('/api/trending', async (req, res) => {
  res.json({
    languages: {
      values: ['javascript', 'python', 'css', 'typescript', 'go', '...'],
      example: 'http://localhost:3000/api/trending/javascript',
    },
    since: {
      values: ['daily', 'weekly (default value)', 'monthly'],
      example: 'http://localhost:3000/api/trending/javascript?daily',
    },
  });
});

app.get('/api/trending/:language', async (req, res) => {
  const results = await callGithubTrending(
    req.params.language,
    req.query.since,
  );
  res.json(results);
});

app.listen(
  {
    port: 3000,
  },
  async () => {
    browser = await puppeteer.launch();
    console.log('🚀 Server ready at http://localhost:3000');
  },
);

process.on('SIGTERM', () => {
  browser.close();
});
