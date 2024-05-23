import { ProductItemAPI } from '@core/api/product-item.api';
import { productAPI } from '@core/api/product.api';
import { Product } from '@models/product';
import { ProductItem } from '@models/product-item';
import { useQuery } from '@tanstack/react-query';

const useQueryProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await productAPI.getProducts();
            return res.payload as Product[];
        },
    });
};

const useQueryGetAllProductItems = () => {
    return useQuery({
        queryKey: ['all-product-items'],
        queryFn: async () => {
            const res = await ProductItemAPI.getALlProductItems();
            return res.payload as ProductItem[];
        },
    });
};

const useQueryGetProductItemsByProductId = (productId: string) => {
    return useQuery({
        queryKey: ['product-items', productId],
        queryFn: async () => {
            const res = await ProductItemAPI.getProductItemById(productId);
            return res.payload as ProductItem;
        },
    });
};

export { useQueryGetAllProductItems, useQueryGetProductItemsByProductId, useQueryProducts };
