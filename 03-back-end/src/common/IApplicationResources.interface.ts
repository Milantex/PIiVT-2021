import * as mysql2 from "mysql2/promise";

export default interface IApplicationResources {
    databaseConnection: mysql2.Connection;
}
