import React from 'react';
import { Container } from 'react-bootstrap';
import TopMenu from '../TopMenu/TopMenu';
import './Application.sass';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from '../HomePage/HomePage';
import CategoryPage from '../CategoryPage/CategoryPage';
import ContactPage from '../ContactPage/ContactPage';
import EventRegister from '../../api/EventRegister';
import api from '../../api/api';
import UserLogin from '../UserLogin/UserLogin';
import UserLogout from '../UserLogout/UserLogout';

class ApplicationState {
  authorizedRole: "user" | "administrator" | "visitor" = "visitor";
}

export default class Application extends React.Component {
  state: ApplicationState;

  constructor(props: any) {
    super(props);

    this.state = {
      authorizedRole: "visitor",
    };
  }

  componentDidMount() {
    EventRegister.on("AUTH_EVENT", this.authEventHandler.bind(this));

    this.checkRole("user");
    this.checkRole("administrator");
  }

  componentWillUnmount() {
    EventRegister.off("AUTH_EVENT", this.authEventHandler.bind(this));
  }

  private authEventHandler(message: string) {
    console.log('Application: authEventHandler: ', message);

    if (message === "force_login" || message === "user_logout" || message === "admninistrator_logout") {
      return this.setState({ authorizedRole: "visitor" });
    }

    if (message === "user_login") {
      return this.setState({ authorizedRole: "user" });
    }

    if (message === "admninistrator_login") {
      return this.setState({ authorizedRole: "admninistrator" });
    }
  }

  private checkRole(role: "user" | "administrator") {
    api("get", "/auth/" + role + "/ok", role)
      .then(res => {
        if (res?.data === "OK") {
          this.setState({
            authorizedRole: role,
          });
          EventRegister.emit("AUTH_EVENT", role + "_login");
        }
      })
      .catch(() => {});
  }

  render() {
    return (
      <BrowserRouter>
        <Container className="Application">
          <div className="Application-header">
            Front-end aplikacije
          </div>
  
          <TopMenu currentMenuType={ this.state.authorizedRole } />
  
          <div className="Application-body">
            <Switch>
              <Route exact path="/" component={ HomePage } />
  
              <Route path="/category/:cid?"
                     render={
                       (props: any) => {
                         return ( <CategoryPage {...props} /> );
                       }
                     } />
  
              <Route path="/contact">
                <ContactPage
                  title="Our location in Belgrade"
                  address="Danijelova 32, 11010 Beograd, Srbija"
                  phone="+381 11 30 94 094" />
              </Route>
  
              <Route path="/profile">
                My profile
              </Route>
  
              <Route path="/user/login" component={UserLogin} />
              <Route path="/user/logout" component={UserLogout} />
            </Switch>
          </div>
  
          <div>
              &copy; 2021...
          </div>
        </Container>
      </BrowserRouter>
    );
  }
}
