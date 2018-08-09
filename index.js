// required modules
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
var fetch = require('node-fetch');

const app = express();

// port for local production
const PORT = process.env.PORT || 5000

// api key for yelp
const API_KEY = "bbMQ5abnmtXWaAw4oxCzndXmBVIWV77bxuJObPe1nYlETEdzNkdJncBeqBvSEyTqyUwJDaEcn4DYw9pOUa-Bp681KLt1Q15NY6b54iogbRS7nrb1JvtWGpikOkZqW3Yx";

// const for converting meters to miles
const CONVERT_TO_MILES = 0.000621371192;
const CONVERT_TO_METERS = 1609.34;
const DEFAULT_RADIUS = 24140; // in meters 15 miles default
// help to parse JSON sent from slack
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

  // response for slack command post request
  .post('/', (req, res) => {

    // split the parameters by word 'within"
    var text = req.body.text.split("within");
    if (text[0]) { // TODO: luxury item - handle current location in the future
      var location = text[0];
    } else {
      res.send("Please specify a location");
    }
    if (text[1]) {
      var radius = Math.round(parseInt(text[1], 10)*CONVERT_TO_METERS);
    } else {
      // default radius is 15 miles
      var radius = DEFAULT_RADIUS;
    }

    // TODO: luxury item - only show open now options 
    let url = "https://api.yelp.com/v3/businesses/search?location="+location+"&radius="+radius;

    // yelp get request for businesses matching search request
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization:"Bearer " + API_KEY,
      },
    })
    .then(function(response) {
      response.json().then(function(data) { // need to convert to json for parsing
        
        // if businesses are found 
        if (data['total'] > 0) {
          var list_businesses = data['businesses'];
          var three_random = [];

          // obtain three random businesses from business data
          while (three_random.length < 3) {
            let random_business = list_businesses[Math.floor(Math.random()*list_businesses.length)];
            if (!three_random.includes(random_business)) {
              three_random.push(random_business);
            } 
          }

          // create json for slack response
          let responseJson = {
            response_type: 'in_channel',
            text: 'Here are three random options of restaurants within your area!',
            attachments: [ // TODO: syntax - figure out how to reduce repeated code
              {
                "title": three_random[0].name,
                "title_link": three_random[0].url,
                // TODO: clean up display of addresses for food trucks
                "text": three_random[0].location.address1 + ", " + three_random[0].location.city,
                'thumb_url': three_random[0].image_url,
                "fields": [
                  {
                    "title": "Rating",
                    "value": three_random[0].rating + " Stars",
                    "short": true
                  }, 
                  {
                    "title": "Pricing",
                    "value": three_random[0].price,
                    "short": true
                  },
                  {
                    "title": "Distance",
                    "value": (Math.round((three_random[0].distance*CONVERT_TO_MILES)*100)/100) + " miles",
                    "short": true
                  }
                ]
              },
              {
                "title": three_random[1].name,
                "title_link": three_random[1].url,
                "text": three_random[1].location.address1 + ", " + three_random[1].location.city,
                'thumb_url': three_random[1].image_url,
                "fields": [
                  {
                    "title": "Rating",
                    "value": three_random[1].rating + " Stars",
                    "short": true
                  }, 
                  {
                    "title": "Pricing",
                    "value": three_random[1].price,
                    "short": true
                  },
                  {
                    "title": "Distance",
                    "value": (Math.round((three_random[1].distance*CONVERT_TO_MILES)*100)/100) + " miles",
                    "short": true
                  }
                ]
              },
              {
                "title": three_random[2].name,
                "title_link": three_random[2].url,
                "text": three_random[2].location.address1 + ", " + three_random[2].location.city,
                'thumb_url': three_random[2].image_url,
                "fields": [
                  {
                    "title": "Rating",
                    "value": three_random[2].rating + " Stars",
                    "short": true
                  }, 
                  {
                    "title": "Pricing",
                    "value": three_random[2].price,
                    "short": true
                  },
                  {
                    "title": "Distance",
                    "value": (Math.round((three_random[2].distance*CONVERT_TO_MILES)*100)/100) + " miles",
                    "short": true
                  }
                ]
              }
            ]
          };
          res.status(200).send(res.json(responseJson));
        } else {
          res.status(200).send("No results found in specified location and given radius");
        }
      }).catch(function(err) {
        console.log(err)
      });
    })
    .catch(function(err) {
      console.log(err)
    });
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
