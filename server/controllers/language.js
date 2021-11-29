const { Language } = require('../models/schemaModel');

const getLanguage = (req, res) => {
    // get data from the view and add it to mongodb
    Language.find({}, null, { sort: { name: 1 } }).populate('movies').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

module.exports = {
getLanguage
};