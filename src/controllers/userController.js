const constant = require('../helpers/constants');
const pool = require('../helpers/dbHelper');

const retrieveUser = async(req, res)=>{
    console.log("IN GET USER");
    const user_id = req.params.user_id;
    const statement = `SELECT * FROM public.user WHERE (user_id = $1);`;
    try {
        console.log("User ID: ", user_id);
        const {rows} = await pool.query(statement, [user_id]);

        if (rows.length > 0) {
            const user = rows[0];
            res.status(constant.HTTP_STATUS.OK).json(user);
        } else {
            res.status(404).json({message: "User not found"});
        }
    } catch(err){
            throw new Error(err.stack);
    }
}

module.exports = retrieveUser;
