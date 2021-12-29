const { Award } = require('../models/schemaModel');

const getAwardList =  (req, res) => {
    Award.aggregate(
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

const getAwardCategoryList =  (req, res) => {
    Award.aggregate(
        [
            {
                "$lookup": {
                    "from": 'categories',
                    "let": { "categories": "$categories" },
                    "as": 'categories',
                    "pipeline": [
                        {
                            "$match": { "$expr": { "$in": ["$_id", "$$categories"] } }

                        },
                        { "$sort": { "name": 1 } }
                    ]
                }
            }, {
                "$project": {
                    "name": 1,
                    "categories": {
                        "$map": {
                            "input": "$categories",
                            "as": "c",
                            "in": {
                                "name": "$$c.name",
                                "_id": "$$c._id"
                            }
                        }
                    }
                }
            },
            { "$sort": { "name": 1 } }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        })
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