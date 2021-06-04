import BasePage from '../../../BasePage/BasePage';
import CategoryModel from '../../../../../../03-back-end/src/components/category/model';
import { Redirect } from 'react-router-dom';
import CategoryService from '../../../../services/CategoryService';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Fragment } from 'react';
import ArticleService, { IAddArticle } from '../../../../services/ArticleService';
import FeatureModel from '../../../../../../03-back-end/src/components/feature/model';

interface ArticleDashboardAddState {
    categories: CategoryModel[];

    title: string;
    excerpt: string;
    description: string;
    price: string;
    isPromoted: string;
    selectedParent: string;

    uploadFile: FileList | null;

    featureValues: Map<number, string>;

    message: string;

    redirectBackToArticles: boolean;
}

export default class ArticleDashboardAdd extends BasePage<{}> {
    state: ArticleDashboardAddState;

    constructor(props: any) {
        super(props);

        this.state = {
            categories: [],

            title: "",
            excerpt: "",
            description: "",
            price: "1",
            isPromoted: "0",
            selectedParent: "1",

            uploadFile: null,

            featureValues: new Map(),

            message: "",

            redirectBackToArticles: false,
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

    private getSelectedCategory(): CategoryModel|null {
        const selectedCategoryId = Number(this.state.selectedParent);
        return this.findCategoryInCategories(this.state.categories, selectedCategoryId);
    }

    private findCategoryInCategories(categories: CategoryModel[], categoryId: number): CategoryModel|null {
        for (let category of categories) {
            if (category.categoryId === categoryId) {
                return category;
            }

            if (category.subcategories.length > 0) {
                const foundCategory = this.findCategoryInCategories(category.subcategories, categoryId);

                if (foundCategory) {
                    return foundCategory;
                }
            }
        }

        return null;
    }

    renderMain(): JSX.Element {
        if (this.state.redirectBackToArticles) {
            return ( <Redirect to="/dashboard/article" /> );
        }

        const selectedCategory = this.getSelectedCategory();

        return (
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <b>Add new article</b>
                            </Card.Title>
                            <Card.Text as="div">
                                <Row>
                                    <Col xs={12} md={6}>
                                        <p className="mt-3 h4">Article information:</p>

                                        <Form.Group>
                                            <Form.Label>Title:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter the title of the new article"
                                                value={ this.state.title }
                                                onChange={ this.onChangeInput("title") }
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Excerpt:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter the excerpt of the new article"
                                                value={ this.state.excerpt }
                                                maxLength={ 255 }
                                                onChange={ this.onChangeInput("excerpt") }
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Description:</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                type="text"
                                                placeholder="Enter the description of the new article"
                                                value={ this.state.description }
                                                onChange={ this.onChangeInput("description") }
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Price:</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min={1} step={1} max={1000000}
                                                placeholder="Enter the price of the new article"
                                                value={ this.state.price }
                                                onChange={ this.onChangeInput("price") }
                                            />
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label>Promote:</Form.Label>
                                            <Form.Control as="select"
                                                value={ this.state.isPromoted }
                                                onChange={ this.onChangeSelect("isPromoted") }>
                                                <option value="0">Is not promoted</option>
                                                <option value="1">Is promoted</option>
                                            </Form.Control>
                                        </Form.Group>

                                        <p className="mt-3 h4">Multimedia:</p>

                                        <Form.Group>
                                            <Form.Label>Article image:</Form.Label>
                                            <Form.File
                                                custom
                                                data-browse="Select file"
                                                accept=".png,.jpeg"
                                                onChange={ this.onChangeFile("uploadFile") }/>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <p className="mt-3 h4">Article information:</p>

                                        <Form.Group>
                                            <Form.Label>Category:</Form.Label>
                                            <Form.Control as="select"
                                                value={ this.state.selectedParent }
                                                onChange={ this.onChangeSelect("selectedParent") }>
                                                { this.state.categories.map(category => this.createSelectOptionGroup(category)) }
                                            </Form.Control>
                                        </Form.Group>

                                        <p className="mt-3 h4">Features:</p>
                                        { selectedCategory?.features.map(f => this.renderFeatureInput(f)) }

                                        <Form.Group>
                                            <Button variant="primary" className="mt-3"
                                                onClick= { () => this.handleAddButtonClick() } >
                                                Add new article
                                            </Button>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {
                                    this.state.message
                                    ? (<p className="mt-3 alert alert-danger">{ this.state.message }</p>)
                                    : ""
                                }
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    }

    private renderFeatureInput(feature: FeatureModel): JSX.Element {
        return (
            <Form.Group key={ "feature-value-input-" + feature.featureId }>
                <Form.Label>{ feature.name }:</Form.Label>
                <Form.Control
                    value={ this.state.featureValues.get(feature.featureId) }
                    onChange={ this.onChangeFeatureValue(feature.featureId) }/>
            </Form.Group>
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
        if (this.state.uploadFile === null) {
            return this.setState({
                message: "Could did not select a file to upload.",
            });
        }

        const selectedCategory = this.getSelectedCategory();

        if (!selectedCategory) {
            return this.setState({
                message: "You must select a category.",
            });
        }

        const featureValues: Map<number, string> = new Map();

        // For students:
        // We map only the required ones, in case that the selected category was changed,
        // and its featre values remained in state
        for (let feature of selectedCategory.features) {
            const value = this.state.featureValues.get(feature.featureId);

            if (!value) {
                continue;
            }

            featureValues.set(feature.featureId, value);
        }

        const data: IAddArticle = {
            title: this.state.title,
            excerpt: this.state.excerpt,
            description: this.state.description,
            isPromoted: Number(this.state.isPromoted) as 0 | 1,
            categoryId: Number(this.state.selectedParent),
            price: Number(this.state.price),
            images: [
                this.state.uploadFile.item(0) as File
            ],
            features: featureValues,
        };

        ArticleService.addArticle(data)
        .then(res => {
            if (res) return this.setState({ redirectBackToArticles: true });
            else return this.setState({
                message: "Could not save this article, due to an error.",
            });
        });
    }

    private onChangeInput(field: "title" | "excerpt" | "description" | "price"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        }
    }

    private onChangeFeatureValue(featureId: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState((state: ArticleDashboardAddState) => {
                state.featureValues.set(featureId, event.target.value + "");
                return state;
            });
        }
    }

    private onChangeSelect(field: "selectedParent" | "isPromoted"): (event: React.ChangeEvent<HTMLSelectElement>) => void {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
            this.setState({
                [field]: event.target?.value + "",
            });
        }
    }

    private onChangeFile(field: "uploadFile"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.files
            });
        }
    }
}
