import React from "react";
import { Redirect } from "react-router-dom";
import { saveAuthToken, saveRefreshToken } from '../../api/api';
import EventRegister from "../../api/EventRegister";

class AdministratorLogoutState {
    logoutDone: boolean = false;
}

export default class AdministratorLogout extends React.Component {
    state: AdministratorLogoutState;

    constructor(props: any) {
        super(props);

        this.state = {
            logoutDone: false,
        }
    }

    componentDidMount() {
        saveAuthToken("administrator", "");
        saveRefreshToken("administrator", "");

        this.setState({
            logoutDone: true,
        });

        EventRegister.emit("AUTH_EVENT", "administrator_logout");
    }

    render() {
        if (this.state.logoutDone) {
            return (
                <Redirect to="/administrator/login" />
            );
        }

        return (
            <p>Loging out...</p>
        );
    }
}