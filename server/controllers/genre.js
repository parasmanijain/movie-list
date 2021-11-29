const { Genre } = require('../models/schemaModel');

const getGenre = (req, res) => {
    // get data from the view and add it to mongodb
    Genre.find({}, null, { sort: { name: 1 } }).populate('movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

module.exports = {
    getGenre
};