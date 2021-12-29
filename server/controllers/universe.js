const { Universe } = require('../models/schemaModel');

const getUniverseList = (req, res) => {
    Universe.aggregate(
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

const getUniverseFranchiseList = (req, res) => {
    Universe.aggregate(
        [
            {
                "$lookup": {
                    "from": 'franchises',
                    "let": { "franchises": "$franchises" },
                    "as": 'franchises',
                    "pipeline": [
                        {
                            "$match": { "$expr": { "$in": ["$_id", "$$franchises"] } }

                        },
                        { "$sort": { "name": 1 } }
                    ]
                }
            }, {
                "$project": {
                    "name": 1,
                    "franchises": {
                        "$map": {
                            "input": "$franchises",
                            "as": "f",
                            "in": {
                                "name": "$$f.name",
                                "_id": "$$f._id"
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

const getUniverseCount = (req, res) => {
    // get data from the view and add it to mongodb
    Universe.aggregate(
        [{
            $lookup: {
                from: 'franchises',
                localField: '_id',
                foreignField: 'universe',
                as: 'franchises'
            }
        }, {
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

const addNewUniverse = (req, res) => {
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
}

module.exports = {
    getUniverseList,
    getUniverseFranchiseList,
    getUniverseCount,
    addNewUniverse
};