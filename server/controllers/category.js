const { Category, Award } = require('../models/schemaModel');

const getCategoryList = (req, res) => {
  // get data from the view and add it to mongodb
  Category.find({ award: { $exists: false } }, null, { sort: { name: 1 } })
    .populate('movies')
    .populate('award')
    .then((results) => {
      return res.send(results);
    })
    .catch((err) => {
      return res.send(500, { error: err });
    });
};

const getTopCategory = (req, res) => {
  // get data from the view and add it to mongodb
  Category.aggregate(
    [
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { length: -1 } },
      { $limit: 1 }
    ],
    function (err, results) {
      if (err) return res.send(500, { error: err });
      return res.send(results);
    }
  );
};

const getCategoryCount = (req, res) => {
  // get data from the view and add it to mongodb
  Category.aggregate(
    [
      { $match: { award: { $exists: false } } },
      {
        $project: {
          name: 1,
          length: { $size: '$movies' }
        }
      },
      { $sort: { name: 1 } }
    ],
    function (err, results) {
      if (err) return res.send(500, { error: err });
      return res.send(results);
    }
  );
};

const addNewCategory = async (req, res) => {
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
      return res.send(500, { error: err });
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
      return res.status(200).json({ message: 'Record updated successfully' });
    } else {
      return res.send(200, 'Category Successfully Added');
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports = {
  getCategoryList,
  getTopCategory,
  getCategoryCount,
  addNewCategory
};
