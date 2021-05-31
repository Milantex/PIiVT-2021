import BasePage from '../BasePage/BasePage';
import { Card, Col, Form, Row, Button } from 'react-bootstrap';
import AuthService from '../../services/AuthService';
import { Redirect } from 'react-router-dom';

class UserRegistrationState {
    email: string = "";
    password: string = "";
    forename: string = "";
    surname: string = "";
    phoneNumber: string = "";
    postalAddress: string = "";

    message: string = "";
    isRegistered: boolean = false;
}

export default class UserRegistration extends BasePage<{}> {
    state: UserRegistrationState;

    constructor(props: any) {
        super(props);

        this.state = {
            email: "",
            password: "",
            forename: "",
            surname: "",
            phoneNumber: "",
            postalAddress: "",

            message: "",
            isRegistered: false,
        }
    }

    renderMain(): JSX.Element {
        if (this.state.isRegistered) {
            return (
                <Redirect to="/user/login" />
            );
        }

        return (
            <Row>
                <Col sm={12} lg={{ span: 10, offset: 1 }}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <b>User Register</b>
                            </Card.Title>
                            <Card.Text as="div">
                                <Form>
                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>E-mail:</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="Enter your e-mail here..."
                                                    value={ this.state.email }
                                                    onChange={ this.onChangeInput("email") }
                                                />
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Password:</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter your password here..."
                                                    value={ this.state.password }
                                                    onChange={ this.onChangeInput("password") }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Forename:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter your forename here..."
                                                    value={ this.state.forename }
                                                    onChange={ this.onChangeInput("forename") }
                                                />
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Surname:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter your surname here..."
                                                    value={ this.state.surname }
                                                    onChange={ this.onChangeInput("surname") }
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Postal address:</Form.Label>
                                                <Form.Control as="textarea"
                                                    rows={3}
                                                    placeholder="Enter your adress here..."
                                                    value={ this.state.postalAddress }
                                                    onChange={ this.onChangeInput("postalAddress") }
                                                />
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Phone number:</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    placeholder="Enter your phone number here..."
                                                    value={ this.state.phoneNumber }
                                                    onChange={ this.onChangeInput("phoneNumber") }
                                                />
                                            </Form.Group>

                                            <Form.Group className="d-grid">
                                                <Button variant="primary" className="mt-3"
                                                    onClick= { this.handleRegisterButtonClick.bind(this) } >
                                                    Register
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {
                                        this.state.message
                                        ? (<p className="mt-3">{ this.state.message }</p>)
                                        : ""
                                    }
                                </Form>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    }

    private handleRegisterButtonClick() {
        AuthService.attemptUserRegistration({
            email: this.state.email,
            password: this.state.password,
            forename: this.state.forename,
            surname: this.state.surname,
            postalAddress: this.state.postalAddress,
            phoneNumber: this.state.phoneNumber,
        })
        .then(res => {
            if (res.success) {
                return this.setState({
                    isRegistered: true,
                });
            }

            console.log(res);

            this.setState({
                message: res.message,
            });
        });
    }

    private onChangeInput(field: "email" | "password" | "forename" | "surname" | "phoneNumber" | "postalAddress"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        }
    }
}
