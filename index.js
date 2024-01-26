#!/usr/bin/env node

const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const URLs = {
    StarTech: 'https://www.startech.com.bd/component/graphics-card?filter_status=7',
    TechLand: 'https://www.techlandbd.com/graphics-card?fq=1',
    UCC: 'https://www.ucc.com.bd/category-store/computer-components/graphics-card?fq=1',
};

class GpuDataProvider {
    async getGPUsFromStarTech() {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });

        let URL = URLs.StarTech;

        const gpus = [];

        console.log('Pulling data from StarTech...')

        let pageCount = 0

        while (URL) {
            await page.goto(URL);
            console.log(`loaded page ${++pageCount}`)

            const gpusFromPage = await page.evaluate(() => {
                const elementNodeList = document.querySelectorAll('.p-item');
                const elements = [...elementNodeList];
                return elements.map((element) => {
                    const name = element.querySelector('.p-item-name').innerText;

                    let price = element.querySelector('.price-new');
                    if (price == null) {
                        price = element.querySelector('.p-item-price');
                    }
                    price = price.innerText.replace(/[^0-9.]/g, '');
                    price = parseFloat(price);

                    const shop = 'StarTech';

                    const url = element
                        .querySelector('.p-item-name')
                        .getElementsByTagName('a')[0].href;

                    return { name, price, shop, url };
                });
            });

            gpus.push(...gpusFromPage);

            const nextPageUrl = await page.evaluate(() => {
                const pagination = document.querySelector('.pagination');
                const nextButton = pagination.lastChild;

                const isActive = nextButton.querySelector('.disabled') == null;

                return isActive
                    ? nextButton.getElementsByTagName('a')[0].href
                    : false;
            });

            URL = nextPageUrl;
        }

        await browser.close();

        console.log(`${gpus.length} GPU Listings Found in StarTech`)

        return gpus;
    }

    async getGPUsFromTechLand() {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });

        let URL = URLs.TechLand;

        const gpus = [];

        console.log('Pulling data from TechLand...')

        
        let pageCount = 0

        while (URL) {
            await page.goto(URL);

            console.log(`loaded page ${++pageCount}`)

            const gpusFromPage = await page.evaluate(() => {
                const elementNodeList = document.querySelectorAll('.product-thumb');
                const elements = [...elementNodeList];
                return elements.map((element) => {
                    const name = element.querySelector('.name').innerText;

                    let price = element.querySelector('.price-new');
                    if (price == null) {
                        price = element.querySelector('.price');
                    }
                    price = price.innerText.replace(/[^0-9.]/g, '');
                    price = parseFloat(price);

                    const shop = 'TechLand';

                    const url = element
                        .querySelector('.name')
                        .getElementsByTagName('a')[0].href;

                    return { name, price, shop, url };
                });
            });

            gpus.push(...gpusFromPage);

            const nextPageUrl = await page.evaluate(() => {
                const pagination = document.querySelector('.pagination');
                const nextButton = pagination.querySelector('.next');
                return nextButton ? nextButton.href : false;
            });

            URL = nextPageUrl;
        }

        await browser.close();

        console.log(`${gpus.length} GPU Listings Found in TechLand`)

        return gpus;
    }

    async getGPUsFromUCC() {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });

        let URL = URLs.UCC;

        const gpus = [];

        console.log('Pulling data from UCC...')

        let pageCount = 0

        while (URL) {
            await page.goto(URL);

            console.log(`loaded page ${++pageCount}`)

            const gpusFromPage = await page.evaluate(() => {
                const elementNodeList = document.querySelectorAll('.product-thumb');
                const elements = [...elementNodeList];
                return elements.map((element) => {
                    const name = element.querySelector('.name').innerText;

                    let price = element.querySelector('.price-new');
                    if (price == null) {
                        price = element.querySelector('.price');
                    }
                    price = price.innerText.replace(/[^0-9.]/g, '');
                    price = parseFloat(price);

                    const shop = 'UCC';

                    const url = element
                        .querySelector('.name')
                        .getElementsByTagName('a')[0].href;

                    return { name, price, shop, url };
                });
            });

            gpus.push(...gpusFromPage);

            const nextPageUrl = await page.evaluate(() => {
                const pagination = document.querySelector('.pagination');
                const nextButton = pagination.querySelector('.next');
                return nextButton ? nextButton.href : false;
            });

            URL = nextPageUrl;
        }

        await browser.close();

        console.log(`${gpus.length} GPU Listings Found in UCC`)

        return gpus;
    }

    getPrintString(gpu) {
        return `[${gpu.shop}] BDT ${gpu.price} - ${gpu.name} (${gpu.url})`;
    }

    async getGpuData() {
        const gpus = [];

        try{
            gpus.push(...(await this.getGPUsFromStarTech()));
        } 
        catch (error){
            console.log(error);
        }

        try{
            gpus.push(...(await this.getGPUsFromTechLand()));
        }
        catch (error){
            console.log(error);
        }

        try{
            gpus.push(...(await this.getGPUsFromUCC()));
        }
        catch (error){
            console.log(error);
        }

        return gpus
            .filter(x => x.price > 0)
            .sort((a, b) => a.price - b.price);
    }
}

(async () => {
    const gpuDataProvider = new GpuDataProvider();
    const gpus = await gpuDataProvider.getGpuData();

    const csvWriter = createCsvWriter({
        path: 'gpu-data.csv',
        header: [
            { id: 'name', title: 'Name' },
            { id: 'price', title: 'Price (BDT)' },
            { id: 'shop', title: 'Shop' },
            { id: 'url', title: 'Link' },
        ],
    });

    csvWriter
        .writeRecords(gpus) // returns a promise
        .then(() => {
            console.log('...Done Writing in CSV File "gpu-data.csv"');
        });

    console.log(`Total ${gpus.length} GPU Listings Found`);
})();
