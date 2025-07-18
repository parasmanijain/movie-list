import { Request, Response } from 'express';
import { Category } from '../schemaModels/category';
import { Award } from '../schemaModels/award';

export const getCategoryList = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Category.find({ award: { $exists: false } }, null, {
      sort: { name: 1 }
    })
      .populate('movies')
      .populate('award');

    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const getTopCategory = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Category.aggregate([
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

export const getCategoryCount = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Category.aggregate([
      { $match: { award: { $exists: false } } },
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

export const addNewCategory = async (req: Request, res: Response) => {
  try {
    const { name, movies, award } = req.body;
    // get data from the view and add it to mongodb
    var query = { name: name, movies: movies };
    if (award) {
      query = { ...query, ...{ award: award } };
    }
    let doc = await Category.findOneAndUpdate(
      query,
      { $set: { name: name } },
      {
        new: true,
        upsert: true,
        useFindAndModify: false
      }
    );
    if (!doc) {
      res.status(500).send({ error: doc });
    }
    if (award) {
      const bulkAwardOps = [
        {
          updateOne: {
            filter: { _id: award },
            update: { $push: { categories: doc._id } },
            upsert: true,
            useFindAndModify: false
          }
        }
      ];
      let operation = await Award.bulkWrite(bulkAwardOps)
        .then((bulkWriteOpResult) => console.log('Award BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Award BULK update error:'));
      res.status(200).json({ message: 'Record updated successfully' });
    } else {
      res.status(200).send('Category Successfully Added');
    }
  } catch (err) {
    res.status(400).json(err);
  }
};
