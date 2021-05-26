import axios from 'axios';
import { Link } from 'react-router-dom';
import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import CategoryModel from '../../../../03-back-end/src/components/category/model';

class CategoryPageProperties extends BasePageProperties {
    match?: {
        params: {
            cid: string;
        }
    }
}

class CategoryPageState {
    title: string = "";
    subcategories: CategoryModel[] = [];
    showBackButton: boolean = false;
    parentCategoryId: number | null = null;
}

export default class CategoryPage extends BasePage<CategoryPageProperties> {
    state: CategoryPageState;

    constructor(props: CategoryPageProperties) {
        super(props);

        this.state = {
            title: "Loading...",
            subcategories: [],
            showBackButton: false,
            parentCategoryId: null,
        };
    }

    private getCategoryId(): number|null {
        const cid = this.props.match?.params.cid;
        return cid ? +(cid) : null;
    }

    private getCategoryData() {
        const cId = this.getCategoryId();

        if (cId === null) {
            this.apiGetTopLevelCategories();
        } else {
            this.apiGetCategory(cId);
        }
    }

    private apiGetTopLevelCategories() {
        axios({
            method: "get",
            baseURL: "http://localhost:40080",
            url: "/category",
            timeout: 10000,
            responseType: "text",
            headers: {
                Authorization: "Bearer FAKE-TOKEN"
            },
            // withCredentials: true,
            maxRedirects: 0,
        })
        .then(res => {
            if (!Array.isArray(res.data)) {
                throw new Error("Invalid data received.");
            }

            this.setState({
                title: "All categories",
                subcategories: res.data,
                showBackButton: false,
                parentCategoryId: null,
            });
        })
        .catch(err => {
            const errorMessage = "" + err;

            if (errorMessage.includes("404")) {
                this.setState({
                    title: "No categories found",
                    subcategories: [],
                });
            } else {
                this.setState({
                    title: "Unable to load categories",
                    subcategories: [],
                });
            }
        });
    }

    private apiGetCategory(cId: number) {
        axios({
            method: "get",
            baseURL: "http://localhost:40080",
            url: "/category/" + cId,
            timeout: 10000,
            responseType: "text",
            headers: {
                Authorization: "Bearer FAKE-TOKEN"
            },
            // withCredentials: true,
            maxRedirects: 0,
        })
        .then(res => {
            this.setState({
                title: res.data?.name,
                subcategories: res.data?.subcategories,
                parentCategoryId: res.data?.parentCategoryId,
                showBackButton: true,
            });
        })
        .catch(err => {
            const errorMessage = "" + err;

            if (errorMessage.includes("404")) {
                this.setState({
                    title: "Category not found",
                    subcategories: [],
                });
            } else {
                this.setState({
                    title: "Unable to load category data",
                    subcategories: [],
                });
            }
        });
    }

    componentDidMount() {
        this.getCategoryData();
    }

    componentDidUpdate(prevProps: CategoryPageProperties, prevState: CategoryPageState) {
        if (prevProps.match?.params.cid !== this.props.match?.params.cid) {
            this.getCategoryData();
        }
    }

    renderMain(): JSX.Element {
        return (
            <>
                <h1>
                    {
                        this.state.showBackButton
                        ? (
                            <>
                                <Link to={ "/category/" + (this.state.parentCategoryId ?? '') }>
                                    &lt; Back
                                </Link>
                                |
                            </>
                        )
                        : ""
                    }
                    { this.state.title }
                </h1>

                {
                    this.state.subcategories.length > 0
                    ? (
                        <>
                            <p>Podkategorije:</p>
                            <ul>
                                {
                                    this.state.subcategories.map(
                                        catategory => (
                                            <li key={ "subcategory-link-" + catategory.categoryId }>
                                                <Link to={ "/category/" + catategory.categoryId }>
                                                    { catategory.name }
                                                </Link>
                                            </li>
                                        )
                                    )
                                }
                            </ul>
                        </>
                    )
                    : ""
                }
            </>
        );
    }
}
