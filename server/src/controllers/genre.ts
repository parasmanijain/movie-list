import { Request, Response } from 'express';
import { Genre } from '../schemaModels/genre';

export const getGenreList = async (req: Request, res: Response) => {
  try {
    const results = await Genre.aggregate([
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

export const getTopGenre = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Genre.aggregate([
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { length: -1 } },
      { $limit: 1 }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getGenreCount = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Genre.aggregate([
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { name: 1 } }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const addNewGenre = async (req: Request, res: Response) => {
  const { name, movies } = req.body;
  // get data from the view and add it to mongodb
  var query = { name: name, movies: movies };
  try {
    const doc = await Genre.findOneAndUpdate(
      query,
      { $set: { name: name } },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
    if (doc) {
      return res.send('New Genre Succesfully added.');
    }
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};
