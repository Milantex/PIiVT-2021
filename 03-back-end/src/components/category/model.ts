import IModel from '../../common/IModel.interface';
import FeatureModel from '../feature/model';

class CategoryModel implements IModel {
    categoryId: number;
    name: string;
    imagePath: string;
    parentCategoryId: number | null = null;
    parentCategory: CategoryModel | null = null;
    subcategories: CategoryModel[] = [];
    features: FeatureModel[] = [];
}

export default CategoryModel;
