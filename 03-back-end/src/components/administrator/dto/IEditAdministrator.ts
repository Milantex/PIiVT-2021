import Ajv from "ajv";

interface IEditAdministrator {
    password: string;
    isActive: boolean;
}

const ajv = new Ajv();

const IEditAdministratorValidator = ajv.compile({
    type: "object",
    properties: {
        password: {
            type: "string",
            minLength: 6,
            maxLength: 255,
        },
        isActive: {
            type: "boolean",
        }
    },
    required: [
        "password",
        "isActive",
    ],
    additionalProperties: false,
});

export { IEditAdministrator };
export { IEditAdministratorValidator };
