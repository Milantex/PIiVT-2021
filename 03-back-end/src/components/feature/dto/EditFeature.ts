import Ajv from "ajv";

interface IEditFeature {
    name: string;
}

const ajv = new Ajv();

const IEditFeatureValidator = ajv.compile({
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 2,
            maxLength: 64,
        }
    },
    required: [
        "name",
    ],
    additionalProperties: false,
});

export { IEditFeature };
export { IEditFeatureValidator };
