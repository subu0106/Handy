const sampleGet = (req, res) => {
    console.log("IN GET")
    res.status(200).json({
        "message": "sample message from get request"
    });
}

const samplePost = (req, res) => {
    console.log("IN POST")
    const {title, name} = req.body;
    if (!name){
        res.status(400);
        throw new Error("Name is mandatory");
    };
    res.status(201).json({"message": `sample message from put request ${req.body.name}`});
};

module.exports = {sampleGet, samplePost};