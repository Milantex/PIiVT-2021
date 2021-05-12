import CategoryModel from './model';

class CategoryService {
    public async getAll(): Promise<CategoryModel[]> {
        const lista: CategoryModel[] = [];

        // Mocking:

        lista.push({
            categoryId: 1,
            name: "Category A",
            imagePath: "static/categories/1.png",
            parentCategoryId: null,
            parentCategory: null,
            subcategories: [],
        });

        lista.push({
            categoryId: 2,
            name: "Category B",
            imagePath: "static/categories/2.png",
            parentCategoryId: null,
            parentCategory: null,
            subcategories: [],
        });

        return lista;
    }

    public async getById(categoryId: number): Promise<CategoryModel|null> {
        if (categoryId === 1 || categoryId === 2) {
            if (categoryId === 1) {
                return {
                    categoryId: 1,
                    name: "Category A",
                    imagePath: "static/categories/1.png",
                    parentCategoryId: null,
                    parentCategory: null,
                    subcategories: [],
                };
            }

            if (categoryId === 2) {
                return {
                    categoryId: 2,
                    name: "Category B",
                    imagePath: "static/categories/2.png",
                    parentCategoryId: null,
                    parentCategory: null,
                    subcategories: [],
                };
            }
        } else {
            return null;
        }
    }
}

export default CategoryService;
