import { Request, Response } from 'express';
import { Award } from '../schemaModels/award';

export const getAwardList = async (req: Request, res: Response) => {
  try {
    const results = await Award.aggregate([
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

export const getAwardCategoryList = async (req: Request, res: Response) => {
  try {
    const results = await Award.aggregate([
      {
        $lookup: {
          from: 'categories',
          let: { categories: '$categories' },
          as: 'categories',
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$categories'] } }
            },
            { $sort: { name: 1 } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          categories: {
            $map: {
              input: '$categories',
              as: 'c',
              in: {
                name: '$$c.name',
                _id: '$$c._id'
              }
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const getAwardCount = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Award.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'award',
          as: 'categories'
        }
      },
      {
        $project: {
          name: 1,
          category: {
            $map: {
              input: '$categories',
              in: {
                name: '$$this.name',
                length: {
                  $size: '$$this.movies'
                }
              }
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const addNewAward = async (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  try {
    const doc = await Award.findOneAndUpdate(query, existing, {
      upsert: true,
      useFindAndModify: false
    });
    if (doc) {
      res.status(200).send('New Award Succesfully added.');
    }
  } catch (err) {
    res.status(500).send({ error: err });
  }
};
