const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://paras:paras@paras-db.j8cs9.mongodb.net/paras-db?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoose;