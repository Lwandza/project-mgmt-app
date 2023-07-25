const colors = require('colors');
const cors = require('cors')
const express = require("express");
require('dotenv').config();
const { graphqlHTTP } = require("express-graphql");
const schema = require('./schema/schema');
const connectDb = require('./config/db')
const port = process.env.Port || 5000;

const app = express();
// Connect Database
connectDb();
app.use(cors())
app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
    //   rootValue: root,
      graphiql: process.env.NODE_ENV === 'development',
    })
  )

app.listen(port, console.log(`Server running on port ${port}`));