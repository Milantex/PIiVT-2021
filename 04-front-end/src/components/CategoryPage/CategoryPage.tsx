import BasePage from '../BasePage/BasePage';

export default class CategoryPage extends BasePage<{}> {
    renderMain(): JSX.Element {
        return (
            <p>Ovo su dostupne kategorije...</p>
        );
    }
}
