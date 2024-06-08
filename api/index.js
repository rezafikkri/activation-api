const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const supabase = require('./database');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse various different custom JSON types as JSON
let jsonParser = bodyParser.json();
if (process.env.APP_ENV === 'dev') {
 jsonParser = bodyParser.json({ type: 'application/*+json' });
}
app.use(jsonParser);

app.get('/', async (req, res) => {
  return res.status(200).json({
    status: true,
    message: 'This is api for tidyfiles app activation',
  });
});

app.post('/api/check/activate', async (req, res) => {
  try {
    const activationKey = req.body.activationKey;
    // verify activation key
    jwt.verify(activationKey, process.env.ACTIVATION_SECRET);
    // check activation key exists in database (using prisma)
    const { data, error } = await supabase
      .from('activation_key')
      .select('key')
      .eq('key', activationKey);

    if (data.length > 0) {
      return res.status(200).json({
        status: true,
      });
    }

    throw new Error(error);
  } catch (error) {
    return res.status(400).json({
      status: false,
      error,
    });
  }
});

app.listen(3030, () => console.log('Server ready on port 3030.'));

module.exports = app;
