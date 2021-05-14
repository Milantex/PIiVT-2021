import IModel from '../../common/IModel.interface';
import CategoryModel from '../category/model';

class FeatureModel implements IModel {
    featureId: number;
    name: string;
    categoryId: number | null = null;
    category: CategoryModel | null = null;
}

export default FeatureModel;
