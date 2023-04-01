import { Director } from '../schemaModels/director.js';

export const getDirectorList = async (req, res) => {
  try {
    const results = await Director.aggregate([
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

export const getTopDirector = async (req, res) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Director.aggregate([
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
    return res.status(500).send({ error: err });
  }
};

export const getDirectorCount = async (req, res) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Director.aggregate([
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
    return res.status(500).send({ error: err });
  }
};

export const getMovieCount = async (req, res) => {
  try {
    const results = await Director.aggregate([
      {
        $project: {
          total: { $size: '$movies' }
        }
      },
      {
        $group: {
          _id: '$total',
          director_count: { $sum: 1 }
        }
      },
      {
        $project: {
          movie_count: '$_id',
          director_count: 1
        }
      },
      { $sort: { movie_count: 1 } }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const addNewDirector = async (req, res) => {
  try {
    const newDirector = await Director.create(req.body);
    return res.status(200).json(newDirector);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

// Director.updateOne({'_id':'618acee6c5f642268fc6c6fe'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// });
