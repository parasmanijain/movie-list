import { Request, Response } from 'express';
import { Franchise } from '../schemaModels/franchise.js';
import { Universe } from '../schemaModels/universe.js';
import { logInfo, logError } from '../utils/logger.js';

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
    let query: { name: string; movies: any; universe?: any } = { name: name, movies: movies };
    if (universe) {
      query = { ...query, universe: universe };
    }
    const doc = await Franchise.findOneAndUpdate(
      query,
      { $set: { name: name } },
      {
        new: true,
        upsert: true,
        useFindAndModify: false
      }
    );
    if (!doc) {
      res.status(500).send({ error: 'Failed to create or update franchise' });
      return;
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

      const operation = await Universe.bulkWrite(bulkUniverseOps)
        .then((bulkWriteOpResult) =>
          logInfo(
            'POST /franchise [addNewFranchise]',
            `Universe BULK update OK: ${JSON.stringify(bulkWriteOpResult)}`
          )
        )
        .catch((err) =>
          logError('POST /franchise [addNewFranchise]', 'Universe BULK update error', 500, err)
        );
    }
    res.status(200).json({ message: 'Records updated successfully' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    logError('POST /franchise [addNewFranchise]', errorMessage, 400, err);
    res.status(400).json({ error: errorMessage });
  }
};
