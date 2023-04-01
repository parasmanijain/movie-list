import { Country } from '../schemaModels/country.js';

export const getCountryList = async (req, res) => {
  try {
    const results = await Country.aggregate([
      {
        $project: {
          name: 1
        }
      },
      { $sort: { name: 1 } }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const addNewCountry = async (req, res) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  try {
    const doc = await Country.findOneAndUpdate(query, existing, {
      upsert: true,
      useFindAndModify: false
    });
    if (doc) {
      return res.send('New Country Succesfully added.');
    }
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};
