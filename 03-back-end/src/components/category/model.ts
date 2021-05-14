import IModel from '../../common/IModel.interface';

class CategoryModel implements IModel {
    categoryId: number;
    name: string;
    imagePath: string;
    parentCategoryId: number | null = null;
    parentCategory: CategoryModel | null = null;
    subcategories: CategoryModel[] = [];
}

export default CategoryModel;
