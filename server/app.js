const { Language, Country, Movie, Director, Genre, Franchise, Universe } = require('./schemaModel');
const express = require('express');
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const { API_PORT } = require('./config');

// Franchise.syncIndexes(function (err, res) {
//     if (err) {
//         console.log("Error", err);
//         return err;
//     }
//     console.log("Succes:", res);
//     return res;
// });

// Language.updateOne({'_id':'618a5d02b958c5b30593f4f8'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// }); 

// Director.updateOne({'_id':'618acee6c5f642268fc6c6fe'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// }); 

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

app.get('/languages', (req, res) => {
    // get data from the view and add it to mongodb
    Language.find({}, null, { sort: { name: 1 } }).populate('movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
});
app.get('/genres', (req, res) => {
    // get data from the view and add it to mongodb
    Genre.find({}, null, { sort: { name: 1 } }).populate('movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
});
app.get('/franchises', (req, res) => {
    // get data from the view and add it to mongodb
    Franchise.find({}, null, { sort: { name: 1 } }).populate('movies').populate('universe').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        // const universeData = ((results.filter(result => !!result.universe)).sort((a, b) => {
        //     if (a.universe.name < b.universe.name) { return -1; }
        //     if (a.universe.name > b.universe.name) { return 1; }
        //     return 0;
        // }));
        const restData = (results.filter(result => !!!result.universe)).sort((a, b) => {
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        });
        return res.send(restData);
    });
});

app.get('/universes', (req, res) => {
    // get data from the view and add it to mongodb
    Universe.find({}, null, { sort: { name: 1 } }).populate('franchises').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
});

app.get('/countries', (req, res) => {
    // get data from the view and add it to mongodb
    Country.find({}, null, { sort: { name: 1 } }, (err, data) => {
        if (err) return res.send(500, { error: err });
        return res.send(data);
    });
});
app.get('/directors', (req, res) => {
    // get data from the view and add it to mongodb
    Director.find({}, null, { sort: { name: 1 } }).populate('country movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
});
app.get('/movies', (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 40;
    // get data from the view and add it to mongodb
    Movie.find({}, null, { sort: { name: 1 } })
        .skip((page - 1) * limit)
        .limit(limit).populate('language').populate('genre')
        .populate({
            path: 'franchise',
            populate: [{ path: 'universe' }]})
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
});
app.get('/movieDetails', (req, res) => {
    Movie.findById(req.query.movieID).populate('language').populate('director').populate('genre').populate('franchise').exec(function (err, movie) {
        if (err) return res.send(500, { error: err });
        return res.send(movie);
    }
    );
});

app.get('/topMovie', (req, res) => {
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
});

app.get('/topDirector', (req, res) => {
    // get data from the view and add it to mongodb
    Director.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "length": -1 } },
            { "$limit": 1 }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/directorsCount', (req, res) => {
    // get data from the view and add it to mongodb
    Director.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "name": 1 } },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/topYear', (req, res) => {
    // get data from the view and add it to mongodb
    Movie.aggregate(
        [
            { $group: { _id: "$year", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});
app.get('/topLanguage', (req, res) => {
    // get data from the view and add it to mongodb
    Language.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "length": -1 } },
            { "$limit": 1 }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/languagesCount', (req, res) => {
    // get data from the view and add it to mongodb
    Language.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "name": 1 } },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/topGenre', (req, res) => {
    // get data from the view and add it to mongodb
    Genre.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "length": -1 } },
            { "$limit": 1 }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/genresCount', (req, res) => {
    // get data from the view and add it to mongodb
    Genre.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "name": 1 } },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/topFranchise', (req, res) => {
    // get data from the view and add it to mongodb
    Franchise.aggregate(
        [
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "length": -1 } },
            { "$limit": 1 }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/franchisesCount', (req, res) => {
    // get data from the view and add it to mongodb
    Franchise.aggregate(
        [
            { "$match" : { "universe" : {"$exists": false} } },
            {
                "$project": {
                    "name": 1,
                    "length": { "$size": "$movies" }
                }
            },
            { "$sort": { "name": 1 } },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});

app.get('/universesCount', (req, res) => {
    // get data from the view and add it to mongodb
    Universe.aggregate(
        [{
            $lookup: {
              from: 'franchises',
              localField: '_id',
              foreignField: 'universe',
              as: 'franchises'
            }
          },  {
                "$project": {
                    "name": 1,
                    "franchise": {
                        "$map": {
                          "input": "$franchises",
                          "in": {
                            "name": "$$this.name",
                            "length": {
                              "$size": "$$this.movies"
                            }
                          }
                      }
                }
            }},
            { "$sort": { "name": 1 } },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
});



app.post('/genre', (req, res) => {
    const { name, movies } = req.body;
    // get data from the view and add it to mongodb
    var query = { 'name': name, 'movies': movies };
    Genre.findOneAndUpdate(query, { "$set": { "name": name } }, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Genre Succesfully added.');
    });
});

app.post('/franchise', (req, res) => {
    const { name, movies, universe } = req.body;
    // get data from the view and add it to mongodb
    var query = { 'name': name, 'movies': movies, 'universe': universe };
    Franchise.findOneAndUpdate(query, { "$set": { "name": name } }, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Franchise Succesfully added.');
    });
});

app.post('/language', (req, res) => {
    const { name, code, movies } = req.body;
    // get data from the view and add it to mongodb
    var query = { 'name': name, 'code': code, 'movies': movies };
    Language.findOneAndUpdate(query, { "$set": { "name": name, "code": code } }, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Language Succesfully added.');
    });
});

app.post('/country', (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name };
    const existing = req.body;
    Country.findOneAndUpdate(query, existing, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Country Succesfully added.');
    });
});

app.post('/universe', (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name };
    const existing = req.body;
    Universe.findOneAndUpdate(query, existing, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Universe Succesfully added.');
    });
});

app.post('/director', async (req, res) => {
    try {
        const newDirector = await Director.create(req.body);
        return res.status(200).json(newDirector);
    } catch (err) {
        return res.status(400).json(err);
    }
});
app.post('/movie', async (req, res) => {
    // get data from the view and add it to mongodb
    try {
        const newMovie = await Movie.create(req.body);
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
        const bulkFranchiseOps = {
            updateOne: {
                filter: { _id: newMovie.franchise },
                update: { "$push": { "movies": newMovie._id } },
                upsert: true,
                useFindAndModify: false
            }
        }
        const bulkGenreOps = newMovie.genre.map(doc => ({
            updateOne: {
                filter: { _id: doc },
                update: { "$push": { "movies": newMovie._id } },
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
                .catch(console.error.bind(console, 'Language BULK update error:')),
            Franchise.bulkWrite(bulkFranchiseOps)
                .then(bulkWriteOpResult => console.log('Franchise BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Franchise BULK update error:')),
            Genre.bulkWrite(bulkGenreOps)
                .then(bulkWriteOpResult => console.log('Genre BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Genre BULK update error:')))
        return res.status(200).json({ someResult, anotherResult });
    } catch (err) {
        return res.status(400).json(err);
    }
});

app.post('/updateMovie', async (req, res) => {
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
});

function setupCORS(req, res, next) {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key');
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
}
app.all('/*', setupCORS);

// app.delete('/todo/:item', (req, res) => {
//      // delete the requested item from mongodb
//      Todo.find({item: req.params.item.replace(/\-/g, " ")}).remove((err,data)=> {
//         if(err) throw err;
//         res.json(data); 
//      })      
// });
app.listen(API_PORT, () => {
    console.log("Server has started!")
});