const { Genre } = require('../models/schemaModel');

const getGenreList = (req, res) => {
    // get data from the view and add it to mongodb
    Genre.find({}, null, { sort: { name: 1 } }).populate('movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getTopGenre =  (req, res) => {
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
};

const getGenreCount = (req, res) => {
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
}

const addNewGenre = (req, res) => {
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
}

module.exports = {
    getGenreList,
    getTopGenre,
    getGenreCount,
    addNewGenre
};