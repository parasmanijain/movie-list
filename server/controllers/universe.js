import { Universe } from '../schemaModels/universe.js';

export const getUniverseList = async (req, res) => {
  try {
    const results = await Universe.aggregate([
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

export const getUniverseFranchiseList = async (req, res) => {
  try {
    const results = await Universe.aggregate([
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
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getUniverseCount = async (req, res) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Universe.aggregate([
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
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const addNewUniverse = async (req, res) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  try {
    const doc = await Universe.findOneAndUpdate(query, existing, {
      upsert: true,
      useFindAndModify: false
    });
    if (doc) {
      return res.send('New Universe Succesfully added.');
    }
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};
