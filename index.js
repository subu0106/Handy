const express = require('express');
const dotenv = require('dotenv').config();

const port = process.env.PORT || 5000;

const {router} = require("./src/routes/sampleRouter");

const app = express();

app.use(express.json());
app.use("/", router);
app.use(require("./src/middleware/sampleErrorHandler"));

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
