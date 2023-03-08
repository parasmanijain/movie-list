import { Request, Response } from 'express';
import { Genre } from '../models/schemaModel';

export const getGenreList = (req: Request, res: Response) => {
  Genre.aggregate(
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

export const getTopGenre = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Genre.aggregate(
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

export const getGenreCount = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Genre.aggregate(
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

export const addNewGenre = (req: Request, res: Response) => {
  const { name, movies } = req.body;
  // get data from the view and add it to mongodb
  var query = { name: name, movies: movies };
  Genre.findOneAndUpdate(
    query,
    { $set: { name: name } },
    {
      upsert: true,
      useFindAndModify: false
    }
  ).then((err: any) => {
    if (err) return res.status(500).send({ error: err });
    return res.send('New Genre Succesfully added.');
  });
};
