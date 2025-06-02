const admin = require("./../helpers/firebaseAdmin");
const constants = require("./../helpers/constants")

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }
    const authToken = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken=authToken);
        next();
    } catch(error) {
        console.log(error);
        return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json({message: "Unauthorized Access Token"});
    }
}

module.exports = {authenticateToken}
