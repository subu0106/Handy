const constant = {
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        UNPROCESSABLE_ENTITY: 422,
        INTERNAL_SERVER_ERROR: 500
    },
    DB_TABLES: {
        USERS: "users",
        OFFERS: "offers",
        REQUESTS: "requests",
        SERVICES: "services",
        PROVIDERS: "providers",
        PAIREDJOBS: "paired_jobs",
    },
    USER_TYPES: {
        ADMIN: "admin",
        CONSUMER: "consumer",
        PROVIDER: "provider"
    },
    REQUESTS_STATUS: {
        CLOSED: "closed",
        PENDING: "pending",
        ASSIGNED: "assigned"
    },
    OFFERS_STATUS: {
        PENDING: "pending",
        ACCEPTED: "accepted",
        REJECTED: "rejected"
    },
    SERVICES:{
        HVAC: "hvac",
        MOVING: "moving",
        CLEANING: "cleaning",
        PLUMBING: "plumbing",
        PAINTING: "painting",
        CARPENTRY: "carpentry",
        GARDENING: "gardening",
        LOCKSMITH: "locksmith",
        ELECTRICITY: "electricity",
        PEST_CONTROL: "pest_control",
    }
}

export default constant;
