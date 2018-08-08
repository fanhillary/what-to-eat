const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000

// help to parse JSON sent from slack
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/', (req, res) => {
    // response.write(req.body.text);
    res.status(200).send(req.body.text);

    let data = {
      response_type: 'in_channel',
      text: 'Here are three random options of restaurants within your area!',
    };
    res.json(data);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
