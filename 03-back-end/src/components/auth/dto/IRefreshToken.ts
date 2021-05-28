import Ajv from "ajv";

interface IRefreshToken {
    refreshToken: string;
}

const ajv = new Ajv();

const IRefreshTokenValidator = ajv.compile({
    type: "object",
    properties: {
        refreshToken: {
            type: "string"
        }
    },
    required: [ "refreshToken", ],
    additionalProperties: false,
});

export { IRefreshToken };
export { IRefreshTokenValidator };
