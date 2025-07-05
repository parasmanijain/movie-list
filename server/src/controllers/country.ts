import { Request, Response } from 'express';
import { Country } from '../schemaModels/country';

export const getCountryList = async (req: Request, res: Response) => {
  try {
    const results = await Country.aggregate([
      {
        $project: {
          name: 1
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const addNewCountry = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  try {
    const doc = await Country.findOneAndUpdate(query, existing, {
      upsert: true,
      useFindAndModify: false
    });
    if (doc) {
      res.status(200).send('New Country Succesfully added.');
    }
  } catch (err) {
    res.status(500).send({ error: err });
  }
};
