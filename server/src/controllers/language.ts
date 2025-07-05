import { Request, Response } from 'express';
import { Language } from '../schemaModels/language';

export const getLanguageList = async (req: Request, res: Response) => {
  try {
    const results = await Language.aggregate([
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

export const getTopLanguage = async (req: Request, res: Response) => {
  try {
    const results = await Language.aggregate([
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

export const getLanguageCount = async (req: Request, res: Response) => {
  try {
    const results = await Language.aggregate([
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

export const addNewLanguage = async (req: Request, res: Response) => {
  const { name, code, movies } = req.body;
  const query = { name: name, code: code, movies: movies };
  try {
    const doc = await Language.findOneAndUpdate(
      query,
      { $set: { name: name, code: code } },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
    if (doc) {
      res.status(200).send('New Language Successfully added.');
    }
  } catch (err) {
    res.status(500).send({ error: err });
  }
};
