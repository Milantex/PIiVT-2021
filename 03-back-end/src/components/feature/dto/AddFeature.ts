import Ajv from "ajv";

interface IAddFeature {
    name: string;
    categoryId: number;
}

const ajv = new Ajv();

const IAddFeatureValidator = ajv.compile({
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 2,
            maxLength: 64,
        },
        categoryId: {
            type: "integer",
            minimum: 1,
        },
    },
    required: [
        "name",
        "categoryId",
    ],
    additionalProperties: false,
});

export { IAddFeature };
export { IAddFeatureValidator };
