import { Link } from 'react-router-dom';
import ArticleModel from '../../../../03-back-end/src/components/article/model';
import ArticleService from '../../services/ArticleService';
import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import { Row, Col, Card, InputGroup, Form, Button } from 'react-bootstrap';
import "./ArticlePage.sass";
import CartService from '../../services/CartService';
import { AppConfiguration } from '../../config/app.config';

class ArticlePageProperties extends BasePageProperties {
    match?: {
        params: {
            aid: string;
        }
    }
}

interface ArticlePageState {
    data: ArticleModel|null;
    quantity: string;
}

export default class ArticlePage extends BasePage<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: ArticlePageProperties) {
        super(props);

        this.state = {
            data: null,
            quantity: "1",
        }
    }

    private getArticleId(): number {
        return Number(this.props.match?.params.aid);
    }

    private getArticleData() {
        ArticleService.getArticleById(this.getArticleId())
        .then(res => {
            this.setState({
                data: res
            });
        })
    }

    componentDidMount() {
        this.getArticleData();
    }

    componentDidUpdate(oldProps: ArticlePageProperties) {
        if (oldProps.match?.params.aid !== this.props.match?.params.aid) {
            this.getArticleData();
        }
    }

    private onChangeInput(field: "quantity"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        }
    }

    private addToCart() {
        CartService.addToCart(this.getArticleId(), Number(this.state.quantity));
    }

    renderMain(): JSX.Element {
        if (this.state.data === null) {
            return (
                <>
                    <h1>Article not found</h1>
                    <p>The article you are looking for does not exist.</p>
                </>
            );
        }

        const article = this.state.data as ArticleModel;

        return (
            <>
                <h1>
                    <Link to={ "/category/" + article.categoryId }>
                        &lt; Back
                    </Link> | { article.title }
                </h1>

                <Row>
                    <Col xs={ 12 } md={ 7 }>
                        <Card className="mb-3">
                            <Row>
                                {
                                    article.photos.map(photo => (
                                        <Col key={ "article-photo-" + photo.photoId }
                                             xs={12} sm={6} md={4} lg={3} className="mt-3">
                                            <Card.Img variant="top"
                                                src={ ArticleService.getThumbPath(AppConfiguration.API_URL + "/" + photo.imagePath) } />
                                        </Col>
                                    ))
                                }
                            </Row>

                            <Card.Body>
                                <Card.Text as="div">
                                    <Row>
                                        <Col xs={ 12 } md={ 8 }>
                                            { article.excerpt }
                                        </Col>
                                        <Col xs={ 12 } md={ 4 }>
                                            <strong className="h1">
                                                &euro; { article.currentPrice.toFixed(2) }
                                            </strong>
                                        </Col>
                                    </Row>
                                </Card.Text>
                                <Card.Text as="div" className="article-page-description">
                                    { article.description }
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={ 12 } md={ 5 }>
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <b>Add to cart</b>
                                </Card.Title>
                                <Card.Text as="div">
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>Quantity:</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="1"
                                            value={ this.state.quantity }
                                            onChange={ this.onChangeInput("quantity") } />
                                        <InputGroup.Append>
                                            <Button
                                                variant="primary"
                                                onClick={ () => this.addToCart() }>
                                                Add
                                            </Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="mt-3">
                            <Card.Body>
                                <Card.Title>
                                    <b>Features</b> (list style)
                                </Card.Title>
                                <Card.Text as="div">
                                    <ul>
                                        {
                                            article.features.map(af => (
                                                <li key={ "article-feature-value-" + af.featureId }>
                                                    <b>{ af.name }</b>: { af.value }
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="mt-3">
                            <Card.Body>
                                <Card.Title>
                                    <b>Features</b> (table style)
                                </Card.Title>
                                <Card.Text as="div">
                                    <table className="table table-hover table-sm">
                                        <tr>
                                            <th>Feature</th>
                                            <th>Value</th>
                                        </tr>
                                        {
                                            article.features.map(af => (
                                                <tr key={ "table-article-feature-value-" + af.featureId }>
                                                    <th>
                                                        { af.name }
                                                    </th>
                                                    <td>
                                                        { af.value }
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </table>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    }
}
