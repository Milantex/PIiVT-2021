import React from "react";
import { Row, Col } from 'react-bootstrap';

class BasePageProperties {
    sidebar?: JSX.Element = undefined;
    match?: any;
}

export { BasePageProperties };

export default abstract class BasePage<Properties extends BasePageProperties> extends React.Component<Properties> {
    render() {
        const sidebarSizeOnMd = this.props.sidebar ? 3 : 0;
        const sidebarSizeOnLg = this.props.sidebar ? 4 : 0;

        return (
            <Row className="page-holder">
                <Col className="page-body"
                     sm={ 12 }
                     md={ 12 - sidebarSizeOnMd }
                     lg={ 12 - sidebarSizeOnLg }>
                    { this.renderMain() }
                </Col>

                <Col className="page-sidebar"
                    sm={ 12 }
                    md={ sidebarSizeOnMd }
                    lg={ sidebarSizeOnLg }>
                    { this.props.sidebar }
                </Col>
            </Row>
        );
    }

    abstract renderMain(): JSX.Element;
}
