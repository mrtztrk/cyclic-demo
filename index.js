const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const cors = require("cors");
const cheerio = require("cheerio");
const axios = require("axios");

app.use(cors());

const icaos = [
    { adress: "LTCW" }, { adress: "LTDA" }, { adress: "LTCI" },
    { adress: "LTCJ" }, { adress: "LTBJ" }, { adress: "LTCT" },
    { adress: "LTCS" }, { adress: "LTAJ" }, { adress: "LTCV" },
    { adress: "LTBU" },
];

// Verilerin saklanacağı ana değişken (Bellek/Cache)
let cachedAirports = [];

// Verileri çeken ve temizleyen ana fonksiyon
async function updateAirportData() {
    console.log("MGM verileri güncelleniyor...");
    let tempAirports = [];

    const requests = icaos.map(async (icao) => {
        try {
            const response = await axios.get(
                `https://rasat.mgm.gov.tr/result?stations=${icao.adress}&obsType=1&obsType=2&hours=0`,
                { timeout: 5000 } // 5 saniye zaman aşımı ekledik
            );
            const html = response.data;
            const $ = cheerio.load(html);
            
            const title = $("#resultDD > div.result-table-title").text().trim();
            const metar = $('pre:contains("METAR")').text().trim();
            const taf = $('pre:contains("TAF")').text().trim();

            if (title) {
                tempAirports.push({ title, metar, taf });
            }
        } catch (error) {
            console.log(`${icao.adress} verisi alınamadı:`, error.message);
        }
    });

    await Promise.all(requests);

    // Tekrar eden verileri temizle
    const unique = tempAirports.filter((item, index, self) =>
        index === self.findIndex(t => t.title === item.title && t.metar === item.metar)
    );

    // Global değişkeni güncelle
    cachedAirports = unique;
    console.log(`Güncelleme tamamlandı. ${cachedAirports.length} havaalanı hazır.`);
}

// --- OTOMASYON ---
// 1. Sunucu açılır açılmaz verileri bir kez çek
updateAirportData();

// 2. Her 10 dakikada bir verileri arka planda güncelle (600.000 ms)
setInterval(updateAirportData, 600000);

// --- ROTALAR ---
app.get('/', (req, res) => {
    // Kullanıcı artık beklemiyor, hazır olan veriyi anında gönderiyoruz
    if (cachedAirports.length === 0) {
        return res.status(503).send("Veriler henüz hazırlanıyor, lütfen birkaç saniye sonra sayfayı yenileyin.");
    }
    res.send(cachedAirports);
});

app.get('/add', (req, res) => {
    res.send('New record added.');
});

app.listen(HTTP_PORT, () => {
    console.log(`Server is listening at port ${HTTP_PORT}`);
});
