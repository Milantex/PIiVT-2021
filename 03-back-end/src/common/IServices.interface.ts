import CategoryService from '../components/category/service';
import FeatureService from '../components/feature/service';
import ArticleService from '../components/article/service';
import AdministratorService from '../components/administrator/service';
import UserService from '../components/user/service';

export default interface IServices {
    categoryService: CategoryService;
    featureService: FeatureService;
    articleService: ArticleService;
    administratorService: AdministratorService;
    userService: UserService;
}
