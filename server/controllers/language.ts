import { Request, Response } from 'express';
import { Language } from '../models/schemaModel';

export const getLanguageList = (req: Request, res: Response) => {
  Language.aggregate(
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

export const getTopLanguage = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Language.aggregate(
    [
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { length: -1 } },
      { $limit: 1 }
    ],
    function (err: any, results: any) {
      if (err) return res.status(500).send({ error: err });
      return res.send(results);
    }
  );
};

export const getLanguageCount = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Language.aggregate(
    [
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
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

export const addNewLanguage = (req: Request, res: Response) => {
  const { name, code, movies } = req.body;
  // get data from the view and add it to mongodb
  var query = { name: name, code: code, movies: movies };
  Language.findOneAndUpdate(
    query,
    { $set: { name: name, code: code } },
    {
      upsert: true,
      useFindAndModify: false
    }
  ).then((err: any) => {
    if (err) return res.status(500).send({ error: err });
    return res.send('New Language Succesfully added.');
  });
};
