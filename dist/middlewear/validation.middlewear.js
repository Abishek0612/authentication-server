"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const api_errors_1 = require("../utils/api-errors");
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return next(new api_errors_1.BadRequestError(errorMessage));
        }
        next();
    };
};
exports.validate = validate;
