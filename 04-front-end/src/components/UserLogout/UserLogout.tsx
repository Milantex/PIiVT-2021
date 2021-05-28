import React from "react";
import { Redirect } from "react-router-dom";
import { saveAuthToken, saveRefreshToken } from '../../api/api';
import EventRegister from "../../api/EventRegister";

class UserLogoutState {
    logoutDone: boolean = false;
}

export default class UserLogout extends React.Component {
    state: UserLogoutState;

    constructor(props: any) {
        super(props);

        this.state = {
            logoutDone: false,
        }
    }

    componentDidMount() {
        saveAuthToken("user", "");
        saveRefreshToken("user", "");

        this.setState({
            logoutDone: true,
        });

        EventRegister.emit("AUTH_EVENT", "user_logout");
    }

    render() {
        if (this.state.logoutDone) {
            return (
                <Redirect to="/user/login" />
            );
        }

        return (
            <p>Loging out...</p>
        );
    }
}