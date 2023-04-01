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
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getTopLanguage = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
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
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getLanguageCount = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
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
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const addNewLanguage = async (req: Request, res: Response) => {
  const { name, code, movies } = req.body;
  // get data from the view and add it to mongodb
  var query = { name: name, code: code, movies: movies };
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
      return res.send('New Language Succesfully added.');
    }
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

// Language.updateOne({'_id':'618a5d02b958c5b30593f4f8'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// });
