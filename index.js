const express = require('express');
const dotenv = require('dotenv').config();

const port = process.env.PORT || 5000;

const router = require("./src/routes/userRoutes");

const app = express();

app.use(express.json());
app.use("/api/v1", router);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
