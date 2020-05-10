let request = require("request");
let fs = require("fs");
let puppeteer = require('puppeteer');
let cFile = process.argv[2];
let pFile = process.argv[3];
let cheerio = require("cheerio")
request("https://www.crictracker.com/top-10-cricketers-with-most-social-media-following/",
    function (err, res, html) {
        if (err == null && res.statusCode == 200) {
            parseHtml(html);
        } else if (res.statusCode == 404) {
            console.log("page not found");
        } else {
            console.log("err");
            console.log(res.statusCode);
        }
    }
);
function parseHtml(html) {
    let $ = cheerio.load(html);
    let playerTable = $("h3 strong").text();
    // let playerArray=$(playerTable).text();
    let playerArray = [];
    let finalArray = [];
    playerArray = playerTable.split(" Million");
    let temp = playerArray.map(p => {
        return p.split(". ")[1]
        // 
    })

    // console.log(playerTable.split(" "));
    for (let i = 0; i < temp.length - 1; i++) {
        finalArray.push(temp[i].split(" ")[0] + " " + temp[i].split(" ")[1])
        // .split(" - ")[0]
    }
    // let finalList=JSON.stringify(finalArray);
    let JsonArray = []
    for (let i = 0; i < finalArray.length; i++) {
        JsonArray.push({ "idx": i, "name": finalArray[i] })
    }
    // console.log(JSON.stringify(JsonArray));
    fs.writeFileSync("playerName.js", JSON.stringify(JsonArray));
}


(async () => {
    let data = await fs.promises.readFile(cFile);
    let playerData = await fs.promises.readFile(pFile);
    let { url, pwd, user, search } = JSON.parse(data);
    let PlayerList = JSON.parse(playerData);
    console.log(PlayerList);
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized", "--disable-notifications"]
    })
    let tabs = await browser.pages();
    let tab = tabs[0];

    await tab.goto(url, { waitUntil: "networkidle2" });
    await tab.waitForSelector("input[name=username]", { visible: true });
    await tab.waitForSelector("input[name=password]", { visible: true });
    await tab.type("input[name=username]", user, { delay: 100 });
    await tab.type("input[name=password]", pwd, { delay: 100 });
    await Promise.all([
        tab.waitForNavigation({ waitUntil: "networkidle2" }),
        tab.click(".L3NKy")
    ]);

    //*******************************************************dashboard*********************** */
    for (let i = PlayerList.length - 1; i >= 1; i--) {
        await tab.waitForSelector(".XTCLo.x3qfX", { visible: true });
        await tab.type(".XTCLo.x3qfX", PlayerList[i].name, { delay: 100 });
        // await tab.waitForSelector(".yCE8d.JvDyy", { visible: true });
        // let ft = Date.now() + 2 * 1000;
        // while (Date.now() < ft) {
        // }
        await tab.waitForSelector(".fuqBx a.yCE8d", { visible: true });
        let links = await tab.$$(".fuqBx a.yCE8d")
        let link = await tab.evaluate(function (nxtBtn) {
            return nxtBtn.getAttribute("href");
        }, links[0]);
        await tab.goto(`https://www.instagram.com${link}`)
        let ft = Date.now() + 2 * 1000;
        while (Date.now() < ft) {
        }
        // await tab.waitForSelector("._6VtSN", { visible: true });
        if (await tab.$("._6VtSN") !== null){
            await tab.click("._6VtSN")
        }else{
            await tab.click(".sqdOP.L3NKy._4pI4F.y3zKF")
        }


    }
    await browser.close();
})()