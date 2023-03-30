const { Award } = require('../models/schemaModel');

const getAwardList = async (req, res) => {
  try {
    const results = await Award.aggregate([
      {
        $project: {
          name: 1
        }
      },
      { $sort: { name: 1 } }
    ]);
    return res.send(results);
  } catch (err) {
    return res.send(500, { error: err });
  }
};

const getAwardCategoryList = async (req, res) => {
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
    return res.send(results);
  } catch (err) {
    return res.send(500, { error: err });
  }
};

const getAwardCount = async (req, res) => {
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
    return res.send(results);
  } catch (err) {
    return res.send(500, { error: err });
  }
};

const addNewAward = async (req, res) => {
  // get data from the view and add it to mongodb
  var query = { name: req.body.name };
  const existing = req.body;
  try {
    const doc = await Award.findOneAndUpdate(query, existing, {
      upsert: true,
      useFindAndModify: false
    });
    if (doc) {
      return res.send('New Award Succesfully added.');
    }
  } catch (err) {
    return res.send(500, { error: err });
  }
};

module.exports = {
  getAwardList,
  getAwardCategoryList,
  getAwardCount,
  addNewAward
};
