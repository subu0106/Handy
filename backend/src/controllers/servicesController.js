const constant = require("../helpers/constants");
const db = require("./../helpers/dbHelper");
const { getUserInformationbyId } = require("./userController");

const getServiceProviders = async (req, res) => {
    const service_id = req.params.service_id;
    const condition = 'WHERE (service_id = $1)';
    try{
        const service = await db.getOne(table=constant.DB_TABLES.SERVICES, conditions=condition, params=[service_id]);

        if (!service){
            res.status(constant.HTTP_STATUS.NOT_FOUND).json({ message: "Service not found" });
        } else {
            const providersIdArray = service.providers_array;

            const providerInfoArray = [];
        
            // resolve provider_id to provider object
            for (const provider_id of providersIdArray) {
                const { name, email, phone, avatar, availability, average_rating, review_count } = await getUserInformationbyId(provider_id);
                const providerInfo = {
                    name,
                    email,
                    phone,
                    avatar,
                    availability,
                    average_rating,
                    review_count
                };
                providerInfoArray.push(providerInfo);
            }
            res.status(constant.HTTP_STATUS.OK).json(providerInfoArray);
        }
        

    } catch(err){
        res.status(constant.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getServiceProviders
};
