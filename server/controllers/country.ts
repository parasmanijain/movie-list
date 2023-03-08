import { Request, Response } from 'express';
import { Country } from '../models/schemaModel';

export const getCountryList = (req: Request, res: Response) => {
  Country.aggregate(
    [
      {
        $project: {
          name: 1
        }
      },
      { $sort: { name: 1 } }
    ],
    function (err: any, results: any) {
      if (err) return res.status(500).send({ error: err });
      return res.send(results);
    }
  );
};

export const addNewCountry = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  Country.findOneAndUpdate(query, existing, {
    upsert: true,
    useFindAndModify: false
  }).then((err: any) => {
    if (err) return res.status(500).send({ error: err });
    return res.send('New Country Succesfully added.');
  });
};
