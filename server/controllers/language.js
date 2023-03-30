const { Language } = require('../models/schemaModel');

const getLanguageList = (req, res) => {
    Language.aggregate(
        [
            {
                "$project": {
                    "name": 1
                }
            },
            { "$sort": { "name": 1 } }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        })
};

const getTopLanguage = (req, res) => {
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
};

const getLanguageCount = (req, res) => {
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
};

const addNewLanguage = (req, res) => {
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
};

// Language.updateOne({'_id':'618a5d02b958c5b30593f4f8'}, {"$pull": {movies: null}}).exec(function (err, results) {
//     console.log(results);
//     if (err) return err;
//     return results;
// }); 

module.exports = {
    getLanguageList,
    getTopLanguage,
    getLanguageCount,
    addNewLanguage
};