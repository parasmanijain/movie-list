import { Request, Response } from 'express';
import { Franchise } from '../schemaModels/franchise';
import { Universe } from '../schemaModels/universe';

export const getFranchiseList = async (req: Request, res: Response) => {
  try {
    const results = await Franchise.aggregate([
      {
        $match: {
          universe: { $exists: false }
        }
      },
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

export const getTopFranchise = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Franchise.aggregate([
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

export const getFranchiseCount = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Franchise.aggregate([
      { $match: { universe: { $exists: false } } },
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

export const addNewFranchise = async (req: Request, res: Response) => {
  try {
    const { name, movies, universe } = req.body;
    // get data from the view and add it to mongodb
    var query = { name: name, movies: movies };
    if (universe) {
      query = { ...query, ...{ universe: universe } };
    }
    let doc = await Franchise.findOneAndUpdate(
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
    if (universe) {
      const bulkUniverseOps = [
        {
          updateOne: {
            filter: { _id: universe },
            update: { $push: { franchises: doc._id } },
            upsert: true,
            useFindAndModify: false
          }
        }
      ];

      let operation = await Universe.bulkWrite(bulkUniverseOps)
        .then((bulkWriteOpResult) => console.log('Universe BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Universe BULK update error:'));
    }
    res.status(200).json({ message: 'Records updated succesfully' });
  } catch (err) {
    res.status(400).json(err);
  }
};
