import Ajv from "ajv";
import { ArticleFeatureValue } from "../model";

interface IEditArticle {
    title: string;
    excerpt: string;
    description: string;
    isActive: boolean;
    isPromoted: boolean;
    price: number;
    features: ArticleFeatureValue[];
}

const ajv = new Ajv();

const IEditArticleValidator = ajv.compile({
    type: "object",
    properties: {
        title: {
            type: "string",
            minLength: 2,
            maxLength: 128,
        },
        excerpt: {
            type: "string",
            minLength: 2,
            maxLength: 255,
        },
        description: {
            type: "string",
            minLength: 2,
            maxLength: 64 * 1024,
        },
        isActive: {
            type: "boolean",
        },
        isPromoted: {
            type: "boolean",
        },
        price: {
            type: "number",
            minimum: 0.01,
            multipleOf: 0.01,
        },
        features: {
            type: "array",
            minItems: 0,
            uniqueItems: true,
            items: {
                type: "object",
                properties: {
                    featureId: {
                        type: "number",
                        minimum: 1,
                    },
                    value: {
                        type: "string",
                        minLength: 2,
                        maxLength: 64,
                    }
                },
                required: [
                    "featureId",
                    "value",
                ],
                additionalProperties: false,
            },
        },
    },
    required: [
        "title",
        "excerpt",
        "description",
        "isActive",
        "isPromoted",
        "price",
        "features",
    ],
    additionalProperties: false,
});

export { IEditArticle };
export { IEditArticleValidator };
