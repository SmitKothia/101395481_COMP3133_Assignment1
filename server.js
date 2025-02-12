const express = require('express');
const cors = require('cors');  // Import CORS
const { graphqlHTTP } = require('express-graphql');
const connectDB = require('./db');
const schema = require('./schema');

const app = express();

// Debugging: Log incoming requests
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    console.log(`Headers:`, req.headers);
    console.log(`Body:`, req.body);
    next();
});

// Connect to MongoDB
connectDB();

// Middleware for JSON
app.use(express.json());
app.use(cors());  // 

// GraphQL API Route
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true  
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
