import BasePage, { BasePageProperties } from "../BasePage/BasePage";

class ContactPageProperies extends BasePageProperties {
    title?: string = "";
    phone: string = "";
    address: string = "";
}

export default class ContactPage extends BasePage<ContactPageProperies> {
    renderMain() {
        return (
            <div>
                <h1>{ this.props.title ?? "Contact us" }</h1>
                <p>
                    We are located at: <br />
                    { this.props.address }
                </p>
                <p>Phone: { this.props.phone }</p>
            </div>
        );
    }
}
