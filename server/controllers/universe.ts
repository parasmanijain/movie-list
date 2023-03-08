import { Request, Response } from 'express';
import { Universe } from '../models/schemaModel';

export const getUniverseList = (req: Request, res: Response) => {
  Universe.aggregate(
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

export const getUniverseFranchiseList = (req: Request, res: Response) => {
  Universe.aggregate(
    [
      {
        $lookup: {
          from: 'franchises',
          let: { franchises: '$franchises' },
          as: 'franchises',
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$franchises'] } }
            },
            { $sort: { name: 1 } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          franchises: {
            $map: {
              input: '$franchises',
              as: 'f',
              in: {
                name: '$$f.name',
                _id: '$$f._id'
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

export const getUniverseCount = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  Universe.aggregate(
    [
      {
        $lookup: {
          from: 'franchises',
          localField: '_id',
          foreignField: 'universe',
          as: 'franchises'
        }
      },
      {
        $project: {
          name: 1,
          franchise: {
            $map: {
              input: '$franchises',
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

export const addNewUniverse = (req: Request, res: Response) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  Universe.findOneAndUpdate(query, existing, {
    upsert: true,
    useFindAndModify: false
  }).then((err: any) => {
    if (err) return res.status(500).send({ error: err });
    return res.send('New Universe Succesfully added.');
  });
};
