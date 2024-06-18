const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const cors = require("cors")
const cheerio = require("cheerio");
const axios = require("axios")
app.use(cors())



const icaos = [
    { adress: "LTCW" },
    { adress: "LTDA" },
    { adress: "LTCI" },
    { adress: "LTCJ" },
    { adress: "LTBJ" },
    { adress: "LTCT" },
    { adress: "LTCS" },
    { adress: "LTAJ" },
    { adress: "LTCV" },
    { adress: "LTBU" },
];

const airports = []

app.get('/', async (req, res) => {
    const requests = icaos.map(async (icao) => {
        try {
            const response = await axios.get(
                `https://rasat.mgm.gov.tr/result?stations=${icao.adress}&obsType=1&obsType=2&hours=0`
            );
            const html = response.data;
            const $ = cheerio.load(html);
            const selector = "#resultDD > div.result-table-title";
            const metarSelec = 'pre:contains("METAR")';
            const tafSelec = 'pre:contains("TAF")';
            $(selector && metarSelec && tafSelec, html).each(function () {
                const title = $(selector).text();
                const metar = $(metarSelec).text();
                const taf = $(tafSelec).text();
                airports.push({ title, metar, taf });
            });
        } catch (error) {
            console.log(error);
        }
    });

    await Promise.all(requests);

    async function removeDuplicates(array) {
        const uniqueArray = array.filter((item, index, self) => {
            const firstIndex = self.findIndex(obj => obj.title === item.title && obj.metar === item.metar && obj.taf === item.taf);
            return index === firstIndex;
        });
        return uniqueArray;
    }
    const uniqueAirports = await removeDuplicates(airports);
    res.send(uniqueAirports);
});

app.get('/add', (req, res) => {
    res.send('New record added.');
});

app.listen(HTTP_PORT, () => {
    console.log(`Server is listening at port ${HTTP_PORT}`);
});