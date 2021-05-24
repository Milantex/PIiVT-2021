import Ajv from "ajv";

const ajv = new Ajv();

interface IOrderStatus {
    status: 'pending' | 'rejected' | 'accepted' | 'completed';
}

const IOrderStatusValidator = ajv.compile({
    type: "object",
    properties: {
        status: {
            type: "string",
            pattern: "^(pending|rejected|accepted|completed)$",
        },
    },
    required: [
        "status",
    ],
    additionalProperties: false,
});

export { IOrderStatus };
export { IOrderStatusValidator };
