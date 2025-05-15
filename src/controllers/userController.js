const constant = require('../helpers/constants');
const db = require('../helpers/dbHelper');

const getUserById = async(req, res)=> {
    const user_id = req.params.user_id;
    const condition = 'WHERE (user_id = $1)';
    try {
        // const user = await db.getOne(constant.DB_TABLES.USERS, condition, [user_id]);
        const user = await db.getOne('public.users', condition, [user_id]);
        if (!user){
            res.status(constant.HTTP_STATUS.NOT_FOUND).json({message: "User not found"});
        }else{
            // check user_type and return response accordingly.
            if (user.user_type && user.user_type === constant.USER_TYPES.PROVIDER){
                // const provider = await db.getOne(constant.DB_TABLES.PROVIDERS, 'WHERE (user_id = $1)', [user_id]);
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
                
                res.status(constant.HTTP_STATUS.OK).json(provider);
            } else if (user.user_type && user.user_type === constant.USER_TYPES.CONSUMER){
                res.status(constant.HTTP_STATUS.OK).json(user);
            } else {
                res.status(constant.HTTP_STATUS.UNPROCESSABLE_ENTITY).json({message: "User type not found"});
            }
        }
    } catch(err){
        res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        throw err;
    }
}

module.exports = getUserById;
