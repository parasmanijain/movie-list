const { Award } = require('../models/schemaModel');

const getAwardList =  (req, res) => {
    // get data from the view and add it to mongodb
    Award.find({}, null, { sort: { name: 1 } })
    .exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getAwardCategoryList =  (req, res) => {
    // get data from the view and add it to mongodb
    Award.find({}, null, { sort: { name: 1 } })
    .populate({path: 'categories', options: { sort: { 'name': 1 } } })
    .exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getAwardCount = (req, res) => {
    // get data from the view and add it to mongodb
    Award.aggregate(
        [{
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'award',
                as: 'categories'
            }
        }, {
            "$project": {
                "name": 1,
                "category": {
                    "$map": {
                        "input": "$categories",
                        "in": {
                            "name": "$$this.name",
                            "length": {
                                "$size": "$$this.movies"
                            }
                        }
                    }
                }
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

const addNewAward = (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name };
    const existing = req.body;
    Award.findOneAndUpdate(query, existing, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Award Succesfully added.');
    });
}

module.exports = {
    getAwardList,
    getAwardCategoryList,
    getAwardCount,
    addNewAward
};