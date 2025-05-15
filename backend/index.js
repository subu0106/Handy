const express = require('express');
const dotenv = require('dotenv').config();

const port = process.env.PORT || 5000;

const consumerRoutes = require("./src/routes/consumerRoutes");
const offerRoutes = require("./src/routes/offerRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const pairedJobsRoutes = require("./src/routes/pairedJobsRoutes");
const userRouter = require("./src/routes/userRoutes");

const app = express();

app.use(express.json());
app.use("/api/v1/consumers", consumerRoutes.router);
app.use("/api/v1/offers", offerRoutes.router);
app.use("/api/v1/requests", requestRoutes.router);
app.use("/api/v1/providers", providerRoutes.router);
app.use("/api/v1/pairedJobs", pairedJobsRoutes.router);
app.use("/api/v1/users", userRouter.router);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
