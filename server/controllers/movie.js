const { Movie, Director, Language, Genre, Franchise, Category } = require('../models/schemaModel');

const getMovieList = (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 36;
    // get data from the view and add it to mongodb
    Movie.find({}, null, { sort: { name: 1 } })
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
    Movie.findById(req.query.movieID)
    .populate('language')
    .populate('director')
    .populate('genre')
    .populate('franchise')
    .populate('category').exec(function (err, movie) {
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
        const { name, language, director, imdb, rottenTomatoes, year, url, genre, franchise, category } = req.body;
        // get data from the view and add it to mongodb
        let query = {
            'name': name, 'language': language, 'director': director,
            'imdb': imdb, 'rottenTomatoes': rottenTomatoes, 'year': year, "url": url, "genre": genre
        };
        if (franchise) {
            query = { ...query, ...{ 'franchise': franchise } }
        }
        if (category) {
            query = { ...query, ...{ 'category': category } }
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
        if (newMovie.category) {
            const bulkCategoryOps = newMovie.category.map(doc => ({
                updateOne: {
                    filter: { _id: doc },
                    update: { "$push": { "movies": newMovie._id } },
                    upsert: true,
                    useFindAndModify: false
                }
            }));
            const categoryOperation = Category.bulkWrite(bulkCategoryOps)
                .then(bulkWriteOpResult => console.log('Category BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Category BULK update error:'));
            operations = { ...operations, categoryOperation };
        }
        let [someResult, anotherResult] = await Promise.all(operations
        )
        return res.status(200).json({ someResult, anotherResult });
    } catch (err) {
        return res.status(400).json(err);
    }
};

const updateExistingMovie = async (req, res) => {
    const { id, language, director, genre, franchise } = req.body;
    const keys = Object.keys(req.body);
    let object = {};
    keys.forEach(key => {
        if (['language', 'director', 'genre'].includes(key)) {
            object = { ...object, [key]: (req.body[key]).value }
        } else if(key === 'franchise') {
            object = { ...object, [key]: (req.body[key]).new }
        } else {
            object = {...object, [key]: req.body[key]}
        }
    })
    // get data from the view and add it to mongodb
    try {
        const existingMovieUpdated = await Movie.findByIdAndUpdate(id, req.body, { new: true });
        if (!existingMovieUpdated) throw err;
        let operations = {};
            if(language) {
                let languageOperations = [];
                const languageAddOperations = language.added.map(doc => ({
                    updateOne: {
                        filter: { _id: doc },
                        update: { "$push": { "movies": id } },
                        upsert: true,
                        useFindAndModify: false
                    }
                }));
                const languageRemoveOperations = language.removed.map(doc => ({
                    updateOne: {
                        filter: { _id: doc },
                        update: { "$pull": { "movies": id } },
                        useFindAndModify: false
                    }
                }));
                languageOperations = [...languageAddOperations, ...languageRemoveOperations];
            const languageOperation = Language.bulkWrite(languageOperations)
            .then(bulkWriteOpResult => console.log('Language BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Language BULK update error:'));
                operations = {...operations, ...languageOperation}
            }
            if(director) {
                let directorOperations = [];
                const directorAddOperations = director.added.map(doc => ({
                    updateOne: {
                        filter: { _id: doc },
                        update: { "$push": { "movies": id } },
                        upsert: true,
                        useFindAndModify: false
                    }
                }));
                const directorRemoveOperations = director.removed.map(doc => ({
                    updateOne: {
                        filter: { _id: doc },
                        update: { "$pull": { "movies": id } },
                        useFindAndModify: false
                    }
                }));
                directorOperations = [...directorAddOperations, ...directorRemoveOperations];
                const directorOperation = Director.bulkWrite(directorOperations)
                .then(bulkWriteOpResult => console.log('Director BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Director BULK update error:'));
                operations = {...operations, ...directorOperation}
            }
            if(genre) {
                let genreOperations = [];
                const genreAddOperations = genre.added.map(doc => ({
                    updateOne: {
                        filter: { _id: doc },
                        update: { "$push": { "movies": id } },
                        upsert: true,
                        useFindAndModify: false
                    }
                }));
                const genreRemoveOperations = genre.removed.map(doc => ({
                    updateOne: {
                        filter: { _id: doc },
                        update: { "$pull": { "movies": id } },
                        useFindAndModify: false
                    }
                }));
                genreOperations = [...genreAddOperations, ...genreRemoveOperations];
                const genreOperation = Genre.bulkWrite(genreOperations)
                .then(bulkWriteOpResult => console.log('Genre BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Genre BULK update error:'));
                operations = {...operations, ...genreOperation}
            }
            if(franchise) {
                let franchiseOperations = [];
                const franchiseAddOperations = [{
                    updateOne: {
                        filter: { _id: franchise.new },
                        update: { "$push": { "movies": id } },
                        upsert: true,
                        useFindAndModify: false
                    }
                }];
                const franchiseRemoveOperations = [{
                    updateOne: {
                        filter: { _id: franchise.current },
                        update: { "$pull": { "movies": id } },
                        useFindAndModify: false
                    }
                }];
                franchiseOperations = [...franchiseAddOperations, ...franchiseRemoveOperations];
                const franchiseOperation = Franchise.bulkWrite(franchiseOperations)
                .then(bulkWriteOpResult => console.log('Franchise BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Franchise BULK update error:'));
                operations = {...operations, ...franchiseOperation}
            }
        let [someResult, anotherResult] = await Promise.all(operations
        )
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
            { "$group": { _id: "$year", length: { $sum: 1 } } },
            {
                "$project": {
                    name: "$_id",
                    "length": 1
                }
            },
            { "$sort": { "_id": 1 } },

        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
}

const getMovieAwards = (req,res) => {
    Movie.aggregate(
        [
           { "$match": {"category": {"$ne": null}} },
           
            {
                "$project": {
                    "name": 1,
                    "year": 1,
                    "length": { "$size": "$category" }
                }
            },
            { "$sort": { "name": 1 } },

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
    getMovieAwards,
    addNewMovie,
    updateExistingMovie,
    getTopYear,
    getYearCount
};