import IConfig from '../common/IConfig.interface';
import * as dotenv from "dotenv";

const dotEnvResult = dotenv.config();

if (dotEnvResult.error) throw "Environment configuration file error: " + dotEnvResult.error;

const Config: IConfig = {
    server: {
        port: 40080,
        static: {
            route: "/static",
            path: "./static/",
            cacheControl: false,
            dotfiles: "deny",
            etag: false,
            index: false,
            maxAge: 360000,
        },
    },
    database: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root",
        database: "aplikacija",
        charset: "utf8",
        timezone: "+01:00",
    },
    fileUpload: {
        maxSize: 5 * 1024 * 1024,
        maxFiles: 5,
        timeout: 60000,
        temporaryDirectory: '../temp/',
        uploadDestinationDirectory: 'static/uploads/',
        photos: {
            limits: {
                minWidth: 320,
                minHeight: 200,
                maxWidth: 1920,
                maxHeight: 1440,
            },
            resizes: [
                {
                    sufix: "-medium",
                    fit: "cover",
                    width: 800,
                    hieght: 600,
                },
                {
                    sufix: "-small",
                    fit: "cover",
                    width: 400,
                    hieght: 300,
                },
                {
                    sufix: "-thumb",
                    fit: "cover",
                    width: 250,
                    hieght: 200,
                },
            ],
        },
    },
    mail: {
        hostname: process.env?.MAIL_HOST,
        port: +(process.env?.MAIL_PORT),
        secure: process.env?.MAIL_SECURE === "true",
        username: process.env?.MAIL_USERNAME,
        password: process.env?.MAIL_PASSWORD,
        fromEmail: process.env?.MAIL_FROM,
        debug: true,
    },
};

export default Config;
