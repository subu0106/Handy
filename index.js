const express = require('express');
const dotenv = require('dotenv').config();

const port = process.env.PORT || 5000;

const consumerRoutes = require("./src/routes/consumerRoutes");
const offerRoutes = require("./src/routes/offerRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const pairedJobsRoutes = require("./src/routes/pairedJobsRoutes");

const app = express();

app.use(express.json());
app.use("/api/v1/consumer", consumerRoutes.router);
app.use("/api/v1/offer", offerRoutes.router);
app.use("/api/v1/request", requestRoutes.router);
app.use("/api/v1/provider", providerRoutes.router);
app.use("/api/v1/pairedJob", pairedJobsRoutes.router);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
