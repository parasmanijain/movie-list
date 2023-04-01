import { Director } from '../schemaModels/director.js';
import { Language } from '../schemaModels/language.js';
import { Movie } from '../schemaModels/movie.js';
import { Franchise } from '../schemaModels/franchise.js';
import { Category } from '../schemaModels/category.js';

export const getMovieList = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 36;
  // get data from the view and add it to mongodb
  try {
    const results = await Movie.find({}, null, {
      sort: { name: 1 },
      collation: { locale: 'en_US', numericOrdering: true }
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('language')
      .populate('genre')
      .populate({
        path: 'franchise',
        populate: [{ path: 'universe' }]
      })
      .populate({
        path: 'category',
        populate: [{ path: 'award' }]
      })
      .populate({
        path: 'director',
        populate: [{ path: 'country' }, { path: 'movies', options: { sort: { year: 1 } } }]
      });
    if (results) {
      const count = await Movie.countDocuments({});
      if (count) {
        return res.json({
          total: count,
          page: page,
          pageSize: results.length,
          movies: results
        });
      }
    }
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const results = await Movie.findById(req.query.movieID)
      .populate('language')
      .populate('director')
      .populate('genre')
      .populate('franchise')
      .populate('category');
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getTopMovie = async (req, res) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Movie.aggregate([
      {
        $project: {
          name: 1,
          year: 1,
          imdb: 1,
          rottenTomatoes: 1
        }
      }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const addNewMovie = async (req, res) => {
  try {
    const {
      name,
      language,
      director,
      imdb,
      rottenTomatoes,
      year,
      url,
      genre,
      franchise,
      category
    } = req.body;
    // get data from the view and add it to mongodb
    let query = {
      name: name,
      language: language,
      director: director,
      imdb: imdb,
      rottenTomatoes: rottenTomatoes,
      year: year,
      url: url,
      genre: genre
    };
    if (franchise) {
      query = { ...query, ...{ franchise: franchise } };
    }
    if (category) {
      query = { ...query, ...{ category: category } };
    }
    const newMovie = await Movie.create(query);
    if (!newMovie) throw err;
    const bulkDirectorOps = newMovie.director.map((doc) => ({
      updateOne: {
        filter: { _id: doc },
        update: { $push: { movies: newMovie._id } },
        upsert: true,
        useFindAndModify: false
      }
    }));
    const bulkLanguageOps = newMovie.language.map((doc) => ({
      updateOne: {
        filter: { _id: doc },
        update: { $push: { movies: newMovie._id } },
        upsert: true,
        useFindAndModify: false
      }
    }));
    const bulkGenreOps = newMovie.genre.map((doc) => ({
      updateOne: {
        filter: { _id: doc },
        update: { $push: { movies: newMovie._id } },
        upsert: true,
        useFindAndModify: false
      }
    }));
    let operations = {};
    const directorOption = await Director.bulkWrite(bulkDirectorOps)
      .then((bulkWriteOpResult) => console.log('Director BULK update OK:', bulkWriteOpResult))
      .catch(console.error.bind(console, 'Director BULK update error:'));
    const languageOperation = await Language.bulkWrite(bulkLanguageOps)
      .then((bulkWriteOpResult) => console.log('Language BULK update OK:', bulkWriteOpResult))
      .catch(console.error.bind(console, 'Language BULK update error:'));
    const genreOperation = await Genre.bulkWrite(bulkGenreOps)
      .then((bulkWriteOpResult) => console.log('Genre BULK update OK:', bulkWriteOpResult))
      .catch(console.error.bind(console, 'Genre BULK update error:'));
    if (newMovie.franchise) {
      const bulkFranchiseOps = [
        {
          updateOne: {
            filter: { _id: newMovie.franchise },
            update: { $push: { movies: newMovie._id } },
            upsert: true,
            useFindAndModify: false
          }
        }
      ];
      const franchiseOperation = await Franchise.bulkWrite(bulkFranchiseOps)
        .then((bulkWriteOpResult) => console.log('Franchise BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Franchise BULK update error:'));
    }
    if (newMovie.category) {
      const bulkCategoryOps = newMovie.category.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $push: { movies: newMovie._id } },
          upsert: true,
          useFindAndModify: false
        }
      }));
      const categoryOperation = await Category.bulkWrite(bulkCategoryOps)
        .then((bulkWriteOpResult) => console.log('Category BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Category BULK update error:'));
    }
    return res.status(200).json({ message: 'Records updated succesfully' });
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const updateExistingMovie = async (req, res) => {
  const { id, language, director, genre, franchise } = req.body;
  const keys = Object.keys(req.body);
  let object = {};
  keys.forEach((key) => {
    if (['language', 'director', 'genre'].includes(key)) {
      object = { ...object, [key]: req.body[key].value };
    } else if (key === 'franchise') {
      object = { ...object, [key]: req.body[key].new };
    } else {
      object = { ...object, [key]: req.body[key] };
    }
  });
  // get data from the view and add it to mongodb
  try {
    const existingMovieUpdated = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    if (!existingMovieUpdated) throw err;
    if (language) {
      let languageOperations = [];
      const languageAddOperations = language.added.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $push: { movies: id } },
          upsert: true,
          useFindAndModify: false
        }
      }));
      const languageRemoveOperations = language.removed.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $pull: { movies: id } },
          useFindAndModify: false
        }
      }));
      languageOperations = [...languageAddOperations, ...languageRemoveOperations];
      const languageOperation = await Language.bulkWrite(languageOperations)
        .then((bulkWriteOpResult) => console.log('Language BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Language BULK update error:'));
    }
    if (director) {
      let directorOperations = [];
      const directorAddOperations = director.added.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $push: { movies: id } },
          upsert: true,
          useFindAndModify: false
        }
      }));
      const directorRemoveOperations = director.removed.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $pull: { movies: id } },
          useFindAndModify: false
        }
      }));
      directorOperations = [...directorAddOperations, ...directorRemoveOperations];
      const directorOperation = await Director.bulkWrite(directorOperations)
        .then((bulkWriteOpResult) => console.log('Director BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Director BULK update error:'));
    }
    if (genre) {
      let genreOperations = [];
      const genreAddOperations = genre.added.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $push: { movies: id } },
          upsert: true,
          useFindAndModify: false
        }
      }));
      const genreRemoveOperations = genre.removed.map((doc) => ({
        updateOne: {
          filter: { _id: doc },
          update: { $pull: { movies: id } },
          useFindAndModify: false
        }
      }));
      genreOperations = [...genreAddOperations, ...genreRemoveOperations];
      const genreOperation = await Genre.bulkWrite(genreOperations)
        .then((bulkWriteOpResult) => console.log('Genre BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Genre BULK update error:'));
    }
    if (franchise) {
      let franchiseOperations = [];
      const franchiseAddOperations = [
        {
          updateOne: {
            filter: { _id: franchise.new },
            update: { $push: { movies: id } },
            upsert: true,
            useFindAndModify: false
          }
        }
      ];
      const franchiseRemoveOperations = [
        {
          updateOne: {
            filter: { _id: franchise.current },
            update: { $pull: { movies: id } },
            useFindAndModify: false
          }
        }
      ];
      franchiseOperations = [...franchiseAddOperations, ...franchiseRemoveOperations];
      const franchiseOperation = await Franchise.bulkWrite(franchiseOperations)
        .then((bulkWriteOpResult) => console.log('Franchise BULK update OK:', bulkWriteOpResult))
        .catch(console.error.bind(console, 'Franchise BULK update error:'));
    }
    return res.status(200).json({ message: 'Records updated succesfully' });
  } catch (err) {
    return res.status(400).json(err);
  }
};

export const getTopYear = async (req, res) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Movie.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getYearCount = async (req, res) => {
  // get data from the view and add it to mongodb
  try {
    const results = await Movie.aggregate([
      { $group: { _id: '$year', length: { $sum: 1 } } },
      {
        $project: {
          name: '$_id',
          length: 1
        }
      },
      { $sort: { _id: 1 } }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

export const getMovieAwards = async (req, res) => {
  try {
    const results = await Movie.aggregate([
      { $match: { category: { $ne: null } } },
      {
        $project: {
          count: {
            $gte: [{ $size: '$category' }, 1]
          },
          name: 1,
          year: 1,
          length: { $size: '$category' }
        }
      },
      {
        $match: {
          count: true
        }
      },
      {
        $project: {
          name: 1,
          year: 1,
          length: 1
        }
      },
      { $sort: { name: 1 } }
    ]);
    return res.send(results);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
};

// Movie.find({"franchise":{ $type: 7 }}).exec(function(err,results) {
//     results.forEach( function(x) {
//         Movie.updateOne({"_id": x._id}, {"$set": {"franchise": [ x.director ] }}).exec(function (err, res) {
//             if (err) {
//                 console.log(err);
//                 return err;
//             }
//             console.log(res);
//             return res;
//         });
//      });
// });

// Movie.syncIndexes(function (err, res) {
//     if (err) {
//         console.log("Error", err);
//         return err;
//     }
//     console.log("Succes:", res);
//     return res;
// });
