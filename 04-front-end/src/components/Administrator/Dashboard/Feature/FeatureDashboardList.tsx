import BasePage, { BasePageProperties } from '../../../BasePage/BasePage';
import CategoryModel from '../../../../../../03-back-end/src/components/category/model';
import CategoryService from '../../../../services/CategoryService';
import { Form, Button } from 'react-bootstrap';
import "./FeatureDashboardList.sass";
import FeatureService from '../../../../services/FeatureService';
import { confirmAlert } from "react-confirm-alert";

class FeatureDashboardListProperties extends BasePageProperties {
    match?: {
        params: {
            cid: string;
        }
    }
}

interface FeatureDashboardListState {
    category: CategoryModel|null;
    featureMessages: Map<number, string>;
    newFeatureName: string;
    newFeatureMessage: string;
}

export default class FeatureDashboardList extends BasePage<FeatureDashboardListProperties> {
    state: FeatureDashboardListState;

    constructor(props: FeatureDashboardListProperties) {
        super(props);

        this.state = {
            category: null,
            featureMessages: new Map(),
            newFeatureName: "",
            newFeatureMessage: "",
        }
    }

    private getCurrentCategoryId(): number {
        return Number(this.props.match?.params.cid);
    }

    private loadCategoryData() {
        CategoryService.getCategoryById(this.getCurrentCategoryId(), "administrator")
        .then(res => {
            this.setState({
                category: res,
            });
        })
    }

    componentDidMount() {
        this.loadCategoryData();
    }

    componentDidUpdate(oldProps: FeatureDashboardListProperties) {
        if (oldProps.match?.params.cid !== this.props.match?.params.cid) {
            this.loadCategoryData();
        }
    }

    private onChangeFeatureNameInput(featureId: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState((state: FeatureDashboardListState) => {
                if (state.category === null) {
                    return state;
                }

                for (let i=0; i<state.category.features.length; i++) {
                    if (state.category.features[i].featureId === featureId) {
                        state.category.features[i].name = event.target.value;
                        break;
                    }
                }

                return state;
            });
        }
    }

    private getCurrentFeatureName(featureId: number): string {
        if (this.state.category === null) {
            return "";
        }

        for (let i=0; i<this.state.category.features.length; i++) {
            if (this.state.category.features[i].featureId === featureId) {
                return this.state.category.features[i].name;
            }
        }

        return "";
    }

    private getFeatureEditButtonClickHandler(featureId: number): () => void {
        return () => {
            FeatureService.editFeature(featureId, this.getCurrentFeatureName(featureId))
            .then(res => {
                const message = res ? "Changes saved." : "Could not change feature.";

                this.setState((state: FeatureDashboardListState) => {
                    state.featureMessages.set(featureId, message);
                    return state;
                });

                setTimeout(() => {
                    this.setState((state: FeatureDashboardListState) => {
                        state.featureMessages.set(featureId, "");
                        return state;
                    });
                }, 2000);
            })
        };
    }

    private getFeatureDeleteButtonClickHandler(featureId: number): () => void {
        return () => {
            confirmAlert({
                title: "Delete feature?",
                message: "Are you sure you want to deleet this feature?",
                buttons: [
                    {
                        label: "Yes",
                        className: "btn btn-danger btn-lg",
                        onClick: () => {
                            this.performFeatureDelete(featureId);
                        }
                    },
                    {
                        label: "No",
                        className: "btn btn-secondary btn-lg",
                        onClick: () => { }
                    }
                ],
                closeOnClickOutside: true,
                closeOnEscape: true,
            });
        };
    }

    private performFeatureDelete(featureId: number) {
        FeatureService.deleteFeature(featureId)
        .then(res => {
            const message = res ? "Deleted." : "Could not delete feature.";

            this.setState((state: FeatureDashboardListState) => {
                state.featureMessages.set(featureId, message);
                return state;
            });

            setTimeout(() => {
                this.setState((state: FeatureDashboardListState) => {
                    state.featureMessages.set(featureId, "");
                    return state;
                });

                this.loadCategoryData();
            }, 2000);
        });
    }

    private onChangeInput(field: "newFeatureName"): (event: React.ChangeEvent<HTMLInputElement>) => void {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                [field]: event.target.value,
            });
        }
    }

    private addButtonClickhandler() {
        FeatureService.addFeature(
            this.state.newFeatureName,
            this.getCurrentCategoryId()
        )
        .then(res => {
            if (res) {
                this.setState({ newFeatureName: "" });
                this.loadCategoryData();
                return;
            }

            this.setState({ newFeatureMessage: "Could not save new feature." });

            setTimeout(() => this.setState({ newFeatureMessage: "" }), 3000);
        });
    }

    renderMain(): JSX.Element {
        if (this.state.category === null) {
            return (
                <p>Loading...</p>
            );
        }

        return (
            <>
                <h1>Features of category &quot;{ this.state.category.name }&quot;</h1>
                <table className="table table-sm fature-list-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.category.features
                                .filter(f => f.categoryId === this.state.category?.categoryId)
                                .map(f => (
                                    <tr key={ "feature-row-" + f.featureId }>
                                        <td>
                                            <Form.Control type="text" size="sm"
                                                value={ f.name }
                                                onChange={ this.onChangeFeatureNameInput(f.featureId) } />
                                        </td>
                                        <td>
                                            { this.state.featureMessages.get(f.featureId) }
                                        </td>
                                        <td>
                                            <Button variant="secondary" size="sm"
                                                    onClick={ this.getFeatureEditButtonClickHandler(f.featureId) }>
                                                Update
                                            </Button>

                                            &nbsp;

                                            <Button variant="danger" size="sm"
                                                    onClick={ this.getFeatureDeleteButtonClickHandler(f.featureId) }>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                <Form.Control type="text" size="sm"
                                    value={ this.state.newFeatureName }
                                    onChange={ this.onChangeInput("newFeatureName") } />
                            </td>
                            <td>{ this.state.newFeatureMessage }</td>
                            <td>
                                <Button variant="primary" size="sm"
                                        onClick={ () => this.addButtonClickhandler() }>
                                    Add new
                                </Button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </>
        );
    }
}
