const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://smitkothia123:NSejvV_2gadf@restaurantcluster.6mazt.mongodb.net/comp3133_101395481_assignment1?retryWrites=true&w=majority&appName=RestaurantCluster", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
