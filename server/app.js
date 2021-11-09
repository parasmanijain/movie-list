const express = require('express');
const mongoose = require('mongoose');
const app = express();
mongoose.connect('mongodb+srv://paras:paras@paras-db.j8cs9.mongodb.net/paras-db?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


const languageSchema = new mongoose.Schema({
    name: { type: String },
    code: { type: String },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
const directorSchema = new mongoose.Schema({
    name: { type: String },
    url: { type: String },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
const countrySchema = new mongoose.Schema({
    name: { type: String },
});
const movieSchema = new mongoose.Schema({
    name: { type: String },
    language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
    director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director' },
    year: { type: String },
    url: { type: String },
    imdb: { type: Number },
    rottenTomatoes: { type: Number }
});

directorSchema.index({ name: 1, country: 1, url: 1 }, { unique: true });
movieSchema.index({ name: 1, language: 1, director: 1, year: 1, url: 1, imdb: 1, rottenTomatoes: 1 }, { unique: true });
const Language = mongoose.model('Language', languageSchema);
const Country = mongoose.model('Country', countrySchema);
const Director = mongoose.model('Director', directorSchema);
const Movie = mongoose.model('Movie', movieSchema);
// Language.update({'_id':'5fb8aa6779e2affc100fe5fa'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// });          
app.get('/languages', (req, res) => {
    // get data from the view and add it to mongodb
    Language.find({}, null, { sort: { name: 1 } }).populate('movies').exec(function (err, results) {
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
    let limit = parseInt(req.query.limit) || 32;
    // get data from the view and add it to mongodb
    Movie.find({}, null, { sort: { name: 1 } })
        .skip((page - 1) * limit)
        .limit(limit).populate('language')
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
    Movie.findById(req.query.movieID, function (err, movie) {
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


app.post('/language', (req, res) => {
    const { name, code, movies } = req.body;
    // get data from the view and add it to mongodb
    var query = { 'name': name, 'code': code, 'movies': movies };
    Language.findOneAndUpdate(query, { "$set": { "name": name, "code": code } }, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('Succesfully saved.');
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
        return res.send('Succesfully saved.');
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
        let [someResult, anotherResult] = await Promise.all([Director.findOneAndUpdate(
            { _id: newMovie.director },
            { "$push": { "movies": newMovie._id } },
            { upsert: true, useFindAndModify: false }),
        Language.findOneAndUpdate(
            { _id: newMovie.language },
            { "$push": { "movies": newMovie._id } },
            { upsert: true, useFindAndModify: false })]);
        return res.status(200).json({ someResult, anotherResult });
    } catch (err) {
        return res.status(400).json(err);
    }
});

app.post('/updateMovie', async (req, res) => {
    // get data from the view and add it to mongodb
    try {
        const newMovie = await Movie.updateOne({ _id: req.body._id }, req.body, { upsert: true });
        if (!newMovie) throw err;
        let [someResult, anotherResult] = await Promise.all([Director.findOneAndUpdate(
            { _id: newMovie.director },
            { "$push": { "movies": newMovie._id } },
            { upsert: true, useFindAndModify: false }),
        Language.findOneAndUpdate(
            { _id: newMovie.language },
            { "$push": { "movies": newMovie._id } },
            { upsert: true, useFindAndModify: false })]);
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
app.listen(8000,() => {
	console.log("Server has started!")
});