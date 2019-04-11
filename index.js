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

// Dependencies
const puppeteer = require('puppeteer');
const URL = require('url');

// Constants for construction of each report
const GOOGLEANALYTICS = 'Google Analytics';
const FACEBOOK = 'Facebook Ads';
const BING = 'Bing Ads' 
const GOOGLEADS = 'Google Ads';

// Sites to check
const sites = [
  'https://www.logicalposition.com/',
  'https://www.millerplastics.com/',
  'https://www.hannaandersson.com/baby-girl/56548-V98.html?cgid=baby-girl&dwvar_56548-V98_color=V98'];


/**
 * Main logic for the tool. Opens a headless browser for each site passed to it,
 * listens to all network requests, and filters for any matching the 4 services
 * the tool currently cares about.
 * 
 * If any requests match it pulls necessary data from them, then builds the JSON
 * object used for the final report.
 * 
 */
const checkPage = async (site) => {
  console.log('Started testing for ', site);
  let trackingInformation = {
    'Google Analytics': {},
    'Facebook Ads': {},
    'Bing Ads': {},
    'Google Ads': []
  };

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('request', (request) => {
    // Storing for ease of use
    let url = request._url;

    // These if statements check the request URL against known URLs for the 4 services we care about right now.
    if (url.indexOf('google-analytics.com') > -1) {
      let parsedUrl = URL.parse(url, true);

      // Check if the URL contained query string values for the tracking ID and hit type
      if (typeof parsedUrl.query.tid != 'undefined' && typeof parsedUrl.query.t != 'undefined') {
        console.log(`${site} - GOOGLE ANALYTICS: ${parsedUrl.query.tid} - ${parsedUrl.query.t.toUpperCase()}`);
        storeTrackingInformation(GOOGLEANALYTICS, { id: parsedUrl.query.tid, hitType: parsedUrl.query.t });
      }
    } else if (url.indexOf('facebook.com/tr/') > -1) {
      let parsedUrl = URL.parse(url, true);

      // Check if the URL contained query string values for the pixel ID and hit type
      if (typeof parsedUrl.query.id != 'undefined' && typeof parsedUrl.query.id != 'undefined') {
        console.log(`${site} - FACEBOOK PIXEL: ${parsedUrl.query.id} - ${parsedUrl.query.ev.toUpperCase()}`);
        storeTrackingInformation(FACEBOOK, { id: parsedUrl.query.id, hitType: parsedUrl.query.ev });
      }
    } else if (url.indexOf('googleads.g.doubleclick.net') > -1) {
      let parsedUrl = URL.parse(url, true);
      let conversionId = parsedUrl.pathname.split('/')[3];

      // Check if the URL contained query string values for the conversion ID
      console.log(`${site} - GOOGLE ADS REMARKETING: ${conversionId}`);
      storeTrackingInformation(GOOGLEADS, { id: conversionId });
    } else if (url.indexOf('bat.bing.com/action') > -1) {
      let parsedUrl = URL.parse(url, true);

      // Check if the URL contained query string values for the tracking ID and hit type
      if (typeof parsedUrl.query.ti != 'undefined' && typeof parsedUrl.query.evt != 'undefined') {
        console.log(`${site} - BING UET: ${parsedUrl.query.ti} - ${parsedUrl.query.evt}`);
        storeTrackingInformation(BING, { id: parsedUrl.query.ti, hitType: parsedUrl.query.evt });
      }
    }
  });

  // Sends the headless browser to the URL passed into the function
  await page.goto(site);
  await browser.close();

  // Stores the newly built report object in the full report
  reportJson[site] = trackingInformation;

  // Function that builds the report objects for us
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
};

// Initializing the report object and an array to keep track of our promises
let reportJson = {};
let promiseArr = [];

// Loop through every site, create an entry in the main report Object,
// then run the site through the main function and store the resulting promise in an array
sites.forEach((site) => {
    reportJson[site] = {};
    promiseArr.push(checkPage(site));
});

// Once every promise in the array has been resolved, print the full report Object to the console.
Promise.all(promiseArr).then(() => {
  console.log('All done! Results:');
  console.dir(reportJson, { depth: null });
});
