const { Franchise, Universe } = require('../models/schemaModel');

const getFranchiseList = async (req, res) => {
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
    return res.send(results);
  } catch (err) {
    return res.send(500, { error: err });
  }
};

const getTopFranchise = async (req, res) => {
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
    return res.send(results);
  } catch (err) {
    return res.send(500, { error: err });
  }
};

const getFranchiseCount = async (req, res) => {
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
    return res.send(results);
  } catch (err) {
    return res.send(500, { error: err });
  }
};

const addNewFranchise = async (req, res) => {
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
      return res.send(500, { error: err });
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
    return res.status(200).json({ message: 'Records updated succesfully' });
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports = {
  getFranchiseList,
  getTopFranchise,
  getFranchiseCount,
  addNewFranchise
};
