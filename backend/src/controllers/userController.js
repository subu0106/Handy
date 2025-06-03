const constant = require('../helpers/constants');
const db = require('../helpers/dbHelper');

const getUserInformationbyId = async (user_id) => {
    const condition = 'WHERE (user_id = $1)';
    try {
        const user = await db.getOne(table=constant.DB_TABLES.USERS, conditions=condition, params=[user_id]);
        if (!user){
            return null;
        }else{
            // check user_type and return response accordingly.
            if (user.user_type && user.user_type === constant.USER_TYPES.PROVIDER){
                const providerDetails = await db.getOne(table=constant.DB_TABLES.PROVIDERS, conditions='WHERE (user_id = $1)', params=[user_id]);
                

                // obtain service_id to service_name mapping
                const servicesDetails = await db.getAll(table = constant.DB_TABLES.SERVICES,conditions='', params=[]);
                const serviceMap = new Map();
                servicesDetails.forEach((service)=>{
                    serviceMap.set(service.service_id, service.name);
                });
                
                // resolve service_id to service_name
                const serviceIdArray = providerDetails.services_array;
                for (let i = 0; i < serviceIdArray.length; i++){
                    serviceIdArray[i] = serviceMap.get(serviceIdArray[i]);
                };

                // prepare provider object
                const provider = {
                    ...user,
                    ... providerDetails
                };
                return provider;
            } else if (user.user_type && user.user_type === constant.USER_TYPES.CONSUMER){
                return user;
            } else {
                return null;
            }
        }
    } catch(err){
        throw err;
    }
}

const getUserById = async(req, res)=> {
    const user_id = req.params.user_id;
    try {
        const user = await getUserInformationbyId(user_id);
        if (!user) {
            res.status(constant.HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
        } else {
            res.status(constant.HTTP_STATUS.OK).json(user);
        }
    } catch (err) {
        res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}

module.exports = {getUserById, getUserInformationbyId};
