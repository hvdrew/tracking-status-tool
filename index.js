/**
 * Google Ads:
 *  - Unique String for URL filtering:  'googleads.g.doubleclick.net'
 *  - Conversion ID Expression:         parsedUrl.pathname.split('/')[3];
 * Google Analytics:
 *  - Unique String for URL filtering:  'google-analytics.com'
 *  - UA Number Expression:             parsedUrl.query.tid;
 *  - HitType Expression:               parsedUrl.query.t;
 * Facebook Pixel:
 *  - Unique String for URL filtering:  'facebook.com/tr/'
 *  - Pixel ID Expression:              parsedUrl.query.id;
 *  - Event Type Expression:            parsedUrl.query.ev;
 * Bing Ads:
 *  - Unique String for URL filtering:  'bat.bing.com/action'
 *  - UET ID Expression:                parsedUrl.query.ti;
 *  - UET HitType Expression:           parsedUrl.query.evt;
 */

const puppeteer = require('puppeteer');
const URL = require('url');

const GOOGLEANALYTICS = 'Google Analytics';
const FACEBOOK = 'Facebook Ads';
const BING = 'Bing Ads' 
const GOOGLEADS = 'Google Ads';

const trackingInformation = {
  'Google Analytics': {},
  'Facebook Ads': {},
  'Bing Ads': {},
  'Google Ads': []
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('request', (request) => {
    let url = request._url;

    if (url.indexOf('google-analytics.com') > -1) {
      let parsedUrl = URL.parse(url, true);

      if (typeof parsedUrl.query.tid != 'undefined' && typeof parsedUrl.query.t != 'undefined') {
        console.log(`GOOGLE ANALYTICS: ${parsedUrl.query.tid} - ${parsedUrl.query.t.toUpperCase()}`);
        storeTrackingInformation(GOOGLEANALYTICS, { id: parsedUrl.query.tid, hitType: parsedUrl.query.t });
      }
    } else if (url.indexOf('facebook.com/tr/') > -1) {
      let parsedUrl = URL.parse(url, true);

      if (typeof parsedUrl.query.id != 'undefined' && typeof parsedUrl.query.id != 'undefined') {
        console.log(`FACEBOOK PIXEL: ${parsedUrl.query.id} - ${parsedUrl.query.ev.toUpperCase()}`);
        storeTrackingInformation(FACEBOOK, { id: parsedUrl.query.id, hitType: parsedUrl.query.ev });
      }
    } else if (url.indexOf('googleads.g.doubleclick.net') > -1) {
      let parsedUrl = URL.parse(url, true);
      let conversionId = parsedUrl.pathname.split('/')[3];

      console.log(`GOOGLE ADS REMARKETING: ${conversionId}`);
      storeTrackingInformation(GOOGLEADS, { id: conversionId });
    } else if (url.indexOf('bat.bing.com/action') > -1) {
      let parsedUrl = URL.parse(url, true);

      if (typeof parsedUrl.query.ti != 'undefined' && typeof parsedUrl.query.evt != 'undefined') {
        console.log(`BING UET: ${parsedUrl.query.ti} - ${parsedUrl.query.evt}`);
        storeTrackingInformation(BING, { id: parsedUrl.query.ti, hitType: parsedUrl.query.evt });
      }
    }
  });

  await page.goto('https://www.hannaandersson.com/baby-girl/56548-V98.html?cgid=baby-girl&dwvar_56548-V98_color=V98', /* { waitUntil: 'networkidle0' } */);
  await browser.close();
  console.log(trackingInformation);
})();

function storeTrackingInformation(platform, dataObj) {
  let { id, hitType } = dataObj;
  if (typeof id != 'undefined' && typeof hitType != 'undefined') {
    trackingInformation[platform][id] = (typeof trackingInformation[platform][id] != 'undefined')
                                        ? trackingInformation[platform][id]
                                        : {};
    trackingInformation[platform][id][hitType] = (typeof trackingInformation[platform][id][hitType] != 'undefined')
                                                ? trackingInformation[platform][id][hitType] + 1
                                                : 1; 
  } else if (typeof id != 'undefined') {
    if (!trackingInformation[platform].includes(id)) {
      trackingInformation[platform].push(id);
    }
  }
}