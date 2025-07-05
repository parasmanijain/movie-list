import { Request, Response } from 'express';
import { Director } from '../schemaModels/director';

export const getDirectorList = async (req: Request, res: Response) => {
  try {
    const results = await Director.aggregate([
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

export const getTopDirector = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Director.aggregate([
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { length: -1 } },
      { $limit: 1 }
    ]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const getDirectorCount = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Director.aggregate([
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const getMovieCount = async (req: Request, res: Response) => {
  try {
    const results = await Director.aggregate([
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
    ]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const addNewDirector = async (req: Request, res: Response) => {
  try {
    const newDirector = await Director.create(req.body);
    res.status(200).json(newDirector);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

// Director.updateOne({'_id':'618acee6c5f642268fc6c6fe'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err)  err;
//      results;
// });
