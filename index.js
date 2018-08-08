const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000
const API_KEY = "bbMQ5abnmtXWaAw4oxCzndXmBVIWV77bxuJObPe1nYlETEdzNkdJncBeqBvSEyTqyUwJDaEcn4DYw9pOUa-Bp681KLt1Q15NY6b54iogbRS7nrb1JvtWGpikOkZqW3Yx";
var fetch = require('node-fetch');
// help to parse JSON sent from slack
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/', (req, res) => {

    var text = req.body.text.split(" ");
    var location = text[0];
    var radius = text[1];
    let url = "https://api/yelp.com/v3/businesses/search?location="+location+"&radius="+radius;

    // yelp get request
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization:"Bearer " + API_KEY,
      },
    }) 
    .then(function(response) {
      if (response.total > 0) { // if yelp returns any results

        var businesses = response.businesses;
        // var random_business = businesses[Math.floor(Math.random()*businesses.length)];
        let data = {
          response_type: 'in_channel',
          text: 'Here are three random options of restaurants within your area! 1.'+businesses[0].name,
        };
        res.status(200).send(res.json(data));
      }
    })
    .catch(function(err) {
      console.log(err)
    });
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
