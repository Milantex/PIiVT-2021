import Ajv from "ajv";

interface IAddUser {
    email: string;
    password: string;
    forename: string;
    surname: string;
    phoneNumber: string;
    postalAddress: string;
}

const ajv = new Ajv();

const IAddUserValidator = ajv.compile({
    type: "object",
    properties: {
        email: {
            type: "string",
            minLength: 8,
            maxLength: 255,
        },
        password: {
            type: "string",
            minLength: 6,
            maxLength: 255,
        },
        forename: {
            type: "string",
            minLength: 2,
            maxLength: 64,
        },
        surname: {
            type: "string",
            minLength: 2,
            maxLength: 64,
        },
        phoneNumber: {
            type: "string",
            minLength: 5,
            maxLength: 24,
        },
        postalAddress: {
            type: "string",
            minLength: 10,
            maxLength: 64 * 1024,
        },
    },
    required: [
        "email",
        "password",
        "forename",
        "surname",
        "phoneNumber",
        "postalAddress",
    ],
    additionalProperties: false,
});

export { IAddUser };
export { IAddUserValidator };
