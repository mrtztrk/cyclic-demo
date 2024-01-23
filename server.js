const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;


app.get('/', (reg, res) => {
    res.send('Hello World!');
});
app.get('/add', (reg, res) => {
    res.send('New record added.');
});



app.listen(HTTP_PORT, () => {
    console.log(`Server is listening at port ${HTTP_PORT}`)
});