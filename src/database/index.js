const mongoose = require('mongoose');
const options = {
    keepAlive: true,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
};

module.exports = () => {
    mongoose.connect(process.env.DB_URL, options)
        .then(async () => {
            console.info(`successfully connected`);
        })
        .catch(err => {
            console.error(`There was a db connection error ${err}`);
            process.exit(0);
        });
    mongoose.set('useCreateIndex', true);
    const db = mongoose.connection;
    db.once('disconnected', () => {
        console.error(`db successfully disconnected from`);
    });
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.error('dBase connection closed due to app termination');
            process.exit(0);
        });
    });
}