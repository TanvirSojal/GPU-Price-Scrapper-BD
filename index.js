const puppeteer = require('puppeteer');

const URLs = {
    StarTech:
        'https://www.startech.com.bd/component/graphics-card?filter_status=7',
    TechLand: 'https://www.techlandbd.com/graphics-card?fq=1',
    UCC: 'https://www.ucc-bd.com/pc-components/graphics-card-gpu.html',
};

class GpuDataProvider {
    async getStarTechGPUs() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });

        let URL = URLs.StarTech;

        const gpus = [];

        while (URL) {
            await page.goto(URL);

            const gpusFromPage = await page.evaluate(() => {
                const elementNodeList = document.querySelectorAll('.p-item');
                const elements = [...elementNodeList];
                return elements.map((element) => {
                    const name =
                        element.querySelector('.p-item-name').innerText;

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

        return gpus;
    }

    async getTechLandGPUs() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });

        await page.goto(URLs.TechLand);

        const gpus = await page.evaluate(() => {
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

        await browser.close();

        return gpus;
    }

    getPrintString(gpu) {
        return `[${gpu.shop}] BDT ${gpu.price} - ${gpu.name} (${gpu.url})`;
    }

    async getGpuData() {
        const gpus = [];

        //gpus.push(...(await this.getTechLandGPUs()));

        gpus.push(...(await this.getStarTechGPUs()));
        //return gpus;

        return gpus.map((gpu) => this.getPrintString(gpu));
    }
}

(async () => {
    // const starTechGpus = await getStarTechGPUs();
    // const printGpus = starTechGpus.map((gpu) => getPrintString(gpu));
    // console.log(printGpus);

    const gpuDataProvider = new GpuDataProvider();
    console.log(await (await gpuDataProvider.getGpuData()).length);
})();
