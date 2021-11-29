const { Movie, Director, Language, Genre, Franchise } = require('../models/schemaModel');

const getMovieList =  (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 40;
    // get data from the view and add it to mongodb
    Movie.find({}, null, { sort: { name: 1 } })
        .skip((page - 1) * limit)
        .limit(limit).populate('language').populate('genre')
        .populate({
            path: 'franchise',
            populate: [{ path: 'universe' }]
        })
        .populate({
            path: 'director',
            populate: [{ path: 'country' }, { path: 'movies', options: { sort: { year: 1 } } }]
        })
        .exec(function (err, results) {
            if (err) return res.send(500, { error: err });
            Movie.countDocuments({}).exec((count_error, count) => {
                if (err) {
                    return res.json(count_error);
                }
                return res.json({
                    total: count,
                    page: page,
                    pageSize: results.length,
                    movies: results
                });
            });
        });
};

const getMovieDetails = (req, res) => {
    Movie.findById(req.query.movieID).populate('language').populate('director').populate('genre').populate('franchise').exec(function (err, movie) {
        if (err) return res.send(500, { error: err });
        return res.send(movie);
    }
    );
};

const getTopMovie = (req, res) => {
    // get data from the view and add it to mongodb
    Movie.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "year": 1,
                    "imdb": 1,
                    "rottenTomatoes": 1
                }
            },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
};

const addNewMovie = async (req, res) => {
    try {
        const { name, language, director, imdb, rottenTomatoes, year, url, genre, franchise } = req.body;
        // get data from the view and add it to mongodb
        let query = {
            'name': name, 'language': language, 'director': director,
            'imdb': imdb, 'rottenTomatoes': rottenTomatoes, 'year': year, "url": url, "genre": genre
        };
        if (franchise) {
            query = { ...query, ...{ 'franchise': franchise } }
        }
        const newMovie = await Movie.create(query);
        if (!newMovie) throw err;
        const bulkDirectorOps = newMovie.director.map(doc => ({
            updateOne: {
                filter: { _id: doc },
                update: { "$push": { "movies": newMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));
        const bulkLanguageOps = newMovie.language.map(doc => ({
            updateOne: {
                filter: { _id: doc },
                update: { "$push": { "movies": newMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));


        const bulkGenreOps = newMovie.genre.map(doc => ({
            updateOne: {
                filter: { _id: doc },
                update: { "$push": { "movies": newMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));
        let operations = {};
        const directorOption = Director.bulkWrite(bulkDirectorOps)
            .then(bulkWriteOpResult => console.log('Director BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Director BULK update error:'));
        const languageOperation = Language.bulkWrite(bulkLanguageOps)
            .then(bulkWriteOpResult => console.log('Language BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Language BULK update error:'));
        const genreOperation = Genre.bulkWrite(bulkGenreOps)
            .then(bulkWriteOpResult => console.log('Genre BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Genre BULK update error:'));
        operations = { ...directorOption, ...languageOperation, ...genreOperation };
        if (newMovie.franchise) {
            const bulkFranchiseOps = [{
                updateOne: {
                    filter: { _id: newMovie.franchise },
                    update: { "$push": { "movies": newMovie._id } },
                    upsert: true,
                    useFindAndModify: false
                }
            }];
            const franchiseOperation = Franchise.bulkWrite(bulkFranchiseOps)
                .then(bulkWriteOpResult => console.log('Franchise BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Franchise BULK update error:'));
            operations = { ...operations, franchiseOperation };
        }
        console.log("operaitons:", operations);
        let [someResult, anotherResult] = await Promise.all(operations
        )

        return res.status(200).json({ someResult, anotherResult });
    } catch (err) {
        return res.status(400).json(err);
    }
};

const updateExistingMovie = async (req, res) => {
    // get data from the view and add it to mongodb
    try {
        const oldMovie = await Movie.findById(req.query.movieID).populate('language').populate('director');
        if (!oldMovie) throw err;
        console.log(oldMovie);
        let bulkDirectorOps = oldMovie.director.map(doc => ({
            deleteOne: {
                filter: { _id: doc },
                update: { "$pull": { "movies": oldMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));
        let bulkLanguageOps = oldMovie.language.map(doc => ({
            deleteOne: {
                filter: { _id: doc },
                update: { "$pull": { "movies": oldMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));
        let [someResult, anotherResult] = await Promise.all(
            Director.bulkWrite(bulkDirectorOps)
                .then(bulkWriteOpResult => console.log('Director BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Director BULK update error:')),
            Language.bulkWrite(bulkLanguageOps)
                .then(bulkWriteOpResult => console.log('Language BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Language BULK update error:')));
        const oldMovieDelete = await Movie.findByIdAndDelete(req.query.movieID);
        if (!oldMovieDelete) throw err;
        const newMovie = await Movie.updateOne({ _id: req.body._id }, req.body, { upsert: true });
        if (!newMovie) throw err;
        bulkDirectorOps = newMovie.director.map(doc => ({
            updateOne: {
                filter: { _id: doc },
                update: { "$push": { "movies": newMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));
        bulkLanguageOps = newMovie.language.map(doc => ({
            updateOne: {
                filter: { _id: doc },
                update: { "$push": { "movies": newMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }));
        [someResult, anotherResult] = await Promise.all(
            Director.bulkWrite(bulkDirectorOps)
                .then(bulkWriteOpResult => console.log('Director BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Director BULK update error:')),
            Language.bulkWrite(bulkLanguageOps)
                .then(bulkWriteOpResult => console.log('Language BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Language BULK update error:')))
        return res.status(200).json({ someResult, anotherResult });
    } catch (err) {
        return res.status(400).json(err);
    }
}

const getTopYear = (req, res) => {
    // get data from the view and add it to mongodb
    Movie.aggregate(
        [
            { "$group": { _id: "$year", count: { $sum: 1 } } },
            { "$sort": { count: -1 } },
            { "$limit": 1 }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
}

const getYearCount = (req, res) => {
    // get data from the view and add it to mongodb
    Movie.aggregate(
        [
            { "$group": { _id: "$year", count: { $sum: 1 } } },
            { "$sort": { "_id": 1 } },
           
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
}

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

module.exports = {
    getMovieList,
    getMovieDetails,
    getTopMovie,
    addNewMovie,
    updateExistingMovie,
    getTopYear,
    getYearCount
};