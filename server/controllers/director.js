const { Director } = require('../models/schemaModel');

const getDirectorList =  (req, res) => {
    // get data from the view and add it to mongodb
    Director.find({}, null, { sort: { name: 1 } }).populate('country movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getTopDirector = (req, res) => {
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
}

const getDirectorCount = (req, res) => {
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
};

const addNewDirector = async (req, res) => {
    try {
        const newDirector = await Director.create(req.body);
        return res.status(200).json(newDirector);
    } catch (err) {
        return res.status(400).json(err);
    }
};

// Director.updateOne({'_id':'618acee6c5f642268fc6c6fe'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// });

module.exports = {
    getDirectorList,
    getTopDirector,
    getDirectorCount,
    addNewDirector
};