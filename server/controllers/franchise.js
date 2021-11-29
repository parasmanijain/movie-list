const { Franchise, Universe } = require('../models/schemaModel');

const getFranchiseList =  (req, res) => {
    // get data from the view and add it to mongodb
    Franchise.find({"universe": { "$exists": false }}, null, { sort: { name: 1 } }).populate('movies').populate('universe').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getTopFranchise = (req, res) => {
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
}

const getFranchiseCount = (req, res) => {
    // get data from the view and add it to mongodb
    Franchise.aggregate(
        [
            { "$match": { "universe": { "$exists": false } } },
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

const addNewFranchise = async (req, res) => {
    try {
        const { name, movies, universe } = req.body;
        // get data from the view and add it to mongodb
        var query = { 'name': name, 'movies': movies };
        if (universe) {
            query = { ...query, ...{ 'universe': universe } }
        }
        let doc = await Franchise.findOneAndUpdate(query, { "$set": { "name": name } }, {
            new: true,
            upsert: true,
            useFindAndModify: false
        });
        if (!doc) {
            return res.send(500, { error: err });
        }
        if (universe) {
            const bulkUniverseOps = [{
                updateOne: {
                    filter: { _id: universe },
                    update: { "$push": { "franchises": doc._id } },
                    upsert: true,
                    useFindAndModify: false
                }
            }];
            let [someResult, anotherResult] = await Promise.all(Universe.bulkWrite(bulkUniverseOps)
                .then(bulkWriteOpResult => console.log('Universe BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Universe BULK update error:'))
            )

            return res.status(200).json({ someResult, anotherResult });
        } else {
            return res.send(200, "Franchise Successfully Added");
        }


    }

    catch (err) {
        return res.status(400).json(err);
    }
}

module.exports = {
    getFranchiseList,
    getTopFranchise,
    getFranchiseCount,
    addNewFranchise
};