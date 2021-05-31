import BasePage from '../../../BasePage/BasePage';
import CategoryModel from '../../../../../../03-back-end/src/components/category/model';
import { Redirect } from 'react-router-dom';
import CategoryService from '../../../../services/CategoryService';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Fragment } from 'react';

interface CategoryDashboardAddState {
    categories: CategoryModel[];

    name: string;
    imagePath: string;
    selectedParent: string;

    message: string;

    redirectBackToCategories: boolean;
}

export default class CategoryDashboardAdd extends BasePage<{}> {
    state: CategoryDashboardAddState;

    constructor(props: any) {
        super(props);

        this.state = {
            categories: [],
            name: "",
            imagePath: "",
            selectedParent: "",
            message: "",
            redirectBackToCategories: false,
        }
    }

    componentDidMount() {
        isRoleLoggedIn("administrator")
        .then(loggedIn => {
            if (!loggedIn) return EventRegister.emit("AUTH_EVENT", "force_login");
            this.loadCategories();
        });
    }

    loadCategories() {
        CategoryService.getTopLevelCategories("administrator")
        .then(categories => {
            this.setState({
                categories: categories,
            });
        });
    }

    renderMain(): JSX.Element {
        if (this.state.redirectBackToCategories) {
            return (
                <Redirect to="/dashboard/category" />
            );
        }

        return (
            <Row>
                <Col sm={12} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <b>Add new category</b>
                            </Card.Title>
                            <Card.Text as="div">
                                <Form>
                                    <Form.Group>
                                        <Form.Label>Name:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter the name of the new cateogry"
                                            value={ this.state.name }
                                            onChange={ this.onChangeInput("name") }
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Full image URL:</Form.Label>
                                        <Form.Control
                                            type="url"
                                            placeholder="Enter the full URL of the new category's image..."
                                            value={ this.state.imagePath }
                                            onChange={ this.onChangeInput("imagePath") }
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group>
                                        <Form.Label>Parent category:</Form.Label>
                                        <Form.Control as="select"
                                            value={ this.state.selectedParent }
                                            onChange={ this.onChangeSelect("selectedParent") }>
                                            <option value="">Top level category</option>
                                            { this.state.categories.map(category => this.createSelectOptionGroup(category)) }
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group>
                                        <Button variant="primary" className="mt-3"
                                            onClick= { () => this.handleAddButtonClick() } >
                                            Add new category
                                        </Button>
                                    </Form.Group>

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

    private createSelectOptionGroup(category: CategoryModel, level: number = 0): JSX.Element {
        const levelPrefix = "» ".repeat(level);
        return (
            <Fragment key={ "category-and-subcategory-fragment-" + category.categoryId }>
                <option key={ "parent-category-option-" + category.categoryId } value={ category.categoryId }>
                    { levelPrefix }{ category.name }
                </option>
                { category.subcategories.map(subcategory => this.createSelectOptionGroup(subcategory, level + 1)) }
            </Fragment>
        );
    }

    private handleAddButtonClick() {
        let parentCategoryId: number|null = null;

        if (this.state.selectedParent !== "") {
            parentCategoryId = +(this.state.selectedParent);
        }

        CategoryService.addNewCategory({
            name: this.state.name,
            imagePath: this.state.imagePath,
            parentCategoryId: parentCategoryId,
        })
        .then(res => {
            if (res.success === false) {
                return this.setState({
                    message: res.message,
                });
            }

            this.setState({
                redirectBackToCategories: true,
            });
        });
    }

    private onChangeInput(field: "name" | "imagePath"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        }
    }

    private onChangeSelect(field: "selectedParent"): (event: React.ChangeEvent<HTMLSelectElement>) => void {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
            this.setState({
                [field]: event.target?.value + "",
            });
        }
    }
}
