let wait = function (ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

const puppeteer = require('puppeteer');

let scrappingUrl = 'url you want to scrap';
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(scrappingUrl);

    //****** Module for lazyloading in puppeteer ******//
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    const viewportHeight = page.viewport().height;
    let viewportIncr = 0;

    while (viewportIncr + viewportHeight < height) {
      await page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
      }, viewportHeight);
      await wait(20);
      viewportIncr = viewportIncr + viewportHeight;
    }

    // Scroll back to top
    await page.evaluate(_ => {
      window.scrollTo(0, 0);
    });

    // Some extra delay to let images load
    await wait(100);
    /********************** End Module *****************/

    // get scrape details
    let scrapeData = await page.evaluate(() => {
        // get full html content
        let htmlContent = document.querySelector('html').innerHTML;
        let divElementsWithClassName = document.querySelectorAll('div');
        let divCnt = 0;
        let domElements = [];
        let result = {};

        divElementsWithClassName.forEach((divElement) => {
            let inputElements = divElement.querySelectorAll('input');
            let inputGroup = [];
            let divComponent = {};
            let inputCnt = 0;

            divCnt++;
            inputElements.forEach((inputElement) => {
                let domElement = {};

                inputCnt++;
                try {
                    domElement.id = inputCnt;
                    domElement.className = inputElement.className;
                    console.log('class name : ' + domElement.className);
                    inputGroup.push(domElement);
                }
                catch (exception) {
                  console.log('whopps, exception occured!');
                }
            });
            divComponent.id = divCnt;
            divComponent.inputGroup = inputGroup;
            domElements.push(divComponent);
        });

        result.htmlContent = htmlContent;
        result.domElements = domElements;

        return result;
    });

    // console.dir(scrapeData.domElements[1].inputGroup);
    console.dir(scrapeData);
})();
