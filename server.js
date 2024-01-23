const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const cheerio = require("cheerio");
const axios = require("axios")



const icaos = [
    {
        adress: "LTCW",
    },
    {
        adress: "LTDA",
    },
    {
        adress: "LTCI",
    },
    {
        adress: "LTCJ",
    },
    {
        adress: "LTBJ",
    },
    {
        adress: "LTCT",
    },
    {
        adress: "LTCS",
    },
    {
        adress: "LTAJ",
    },
    {
        adress: "LTCV",
    },
    {
        adress: "LTBU",
    },
];


const airports = []

app.get('/', (reg, res) => {
    icaos.forEach((icao) => {
        try {
            axios
                .get(
                    `https://rasat.mgm.gov.tr/result?stations=${icao.adress}&obsType=1&obsType=2&hours=0`
                ).then((response) => {
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
                })
        } catch (error) {
            ((err) => console.log(err));
        }
    });
});

app.get('/getAirports', function (req, res) {
    try {
        res.send(airports)
    } catch (error) {
        res.status(500).send("Internal Server Error");

    }
})

app.get('/add', (reg, res) => {
    res.send('New record added.');
});



app.listen(HTTP_PORT, () => {
    console.log(`Server is listening at port ${HTTP_PORT}`)
});