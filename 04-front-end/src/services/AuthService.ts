import api from "../api/api";
import { saveAuthToken, saveRefreshToken } from '../api/api';
import EventRegister from '../api/EventRegister';

export interface IUserData {
    email: string;
    password: string;
    forename: string;
    surname: string;
    postalAddress: string;
    phoneNumber: string;
}

export interface IRegistrationResult {
    success: boolean;
    message?: string;
}

export default class AuthService {
    public static attemptUserLogin(email: string, password: string) {
        api("post", "/auth/user/login", "user", {
            email: email,
            password: password,
        }, false)
        .then(res => {
            if (res.status === "ok") {
                const authToken    = res.data?.authToken ?? "";
                const refreshToken = res.data?.refreshToken ?? "";

                saveAuthToken("user", authToken);
                saveRefreshToken("user", refreshToken);

                EventRegister.emit("AUTH_EVENT", "user_login");
            } else {
                EventRegister.emit("AUTH_EVENT", "user_login_failed", res.data);
            }
        })
        .catch(err => {
            EventRegister.emit("AUTH_EVENT", "user_login_failed", err);
        });
    }

    public static attemptUserRegistration(data: IUserData): Promise<IRegistrationResult> {
        return new Promise<IRegistrationResult>(resolve => {
            api("post", "/auth/user/register", "user", data)
            .then(res => {
                console.log(res);
                if (res?.status === "error") {
                    if (Array.isArray(res?.data.data)) {
                        return resolve({
                            success: false,
                            message: res?.data.data[0].instancePath.replace("/", '') + " " + res?.data.data[0].message
                        });
                    }

                    return resolve({
                        success: false,
                        message: JSON.stringify(res?.data?.data)
                    });
                }

                resolve({
                    success: true,
                });
            });
        });
    }

    public static attemptAdministratorLogin(username: string, password: string) {
        api("post", "/auth/administrator/login", "administrator", {
            username: username,
            password: password,
        }, false)
        .then(res => {
            if (res.status === "ok") {
                const authToken    = res.data?.authToken ?? "";
                const refreshToken = res.data?.refreshToken ?? "";

                saveAuthToken("administrator", authToken);
                saveRefreshToken("administrator", refreshToken);

                EventRegister.emit("AUTH_EVENT", "administrator_login");
            } else {
                EventRegister.emit("AUTH_EVENT", "administrator_login_failed", res.data);
            }
        })
        .catch(err => {
            EventRegister.emit("AUTH_EVENT", "administrator_login_failed", err);
        });
    }
}
