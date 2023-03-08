import { Request, Response } from 'express';
import { Director } from '../models/schemaModel';

export const getDirectorList = (req: Request, res: Response) => {
  Director.aggregate(
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

export const getTopDirector = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Director.aggregate(
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

export const getDirectorCount = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Director.aggregate(
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

export const getMovieCount = (req: Request, res: Response) => {
  Director.aggregate(
    [
      {
        $project: {
          total: { $size: '$movies' }
        }
      },
      {
        $group: {
          _id: '$total',
          director_count: { $sum: 1 }
        }
      },
      {
        $project: {
          movie_count: '$_id',
          director_count: 1
        }
      },
      { $sort: { movie_count: 1 } }
    ],
    function (err: any, results: any) {
      if (err) return res.status(500).send({ error: err });
      return res.send(results);
    }
  );
};

export const addNewDirector = async (req: Request, res: Response) => {
  try {
    const newDirector = await Director.create(req.body);
    return res.status(200).json(newDirector);
  } catch (err) {
    return res.status(400).json(err);
  }
};
