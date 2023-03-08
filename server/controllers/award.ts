import { Request, Response } from 'express';
import { Award } from '../models/schemaModel';

export const getAwardList = (req: Request, res: Response) => {
  Award.aggregate(
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

export const getAwardCategoryList = (req: Request, res: Response) => {
  Award.aggregate(
    [
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
    ],
    function (err: any, results: any) {
      if (err) return res.status(500).send({ error: err });
      return res.send(results);
    }
  );
};

export const getAwardCount = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Award.aggregate(
    [
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
    ],
    function (err: any, results: any) {
      if (err) return res.status(500).send({ error: err });
      return res.send(results);
    }
  );
};

export const addNewAward = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  Award.findOneAndUpdate(query, existing, {
    upsert: true,
    useFindAndModify: false
  }).then((err: any) => {
    if (err) return res.status(500).send({ error: err });
    return res.send('New Award Succesfully added.');
  });
};
