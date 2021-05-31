import { Link } from "react-router-dom";
import ArticleModel from "../../../../03-back-end/src/components/article/model";
import { Col, Card } from 'react-bootstrap';
import * as path from "path";
import { AppConfiguration } from "../../config/app.config";

interface ArticleItemProperties {
    article: ArticleModel;
}

function getThumbPath(url: string): string {
    const directory = path.dirname(url);
    const extension = path.extname(url);
    const filename  = path.basename(url, extension);
    return directory + "/" + filename + "-thumb" + extension;
}

export default function ArticleItem(props: ArticleItemProperties) {
    return (
        <Col xs={ 12 } sm={ 6 } md={ 4 } lg={ 3 } className="mt-3">
            <Card>
                <Link to={ "/article/" + props.article.articleId }>
                    <Card.Img variant="top" src={ getThumbPath(AppConfiguration.API_URL + "/" + props.article.photos[0]?.imagePath) } />
                </Link>
                <Card.Body>
                    <Card.Title>
                        <Link to={ "/article/" + props.article.articleId }>
                            { props.article.title }
                        </Link>
                    </Card.Title>
                    <Card.Text as="div">
                        { props.article.excerpt }
                    </Card.Text>
                    <Card.Text as="div">
                        <b>&euro; { props.article.currentPrice.toFixed(2) }</b>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Col>
    );
}
