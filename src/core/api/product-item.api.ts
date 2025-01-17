import _get from 'lodash.get';

import { http } from './http';
export type UploadImageFormData = {
    imageId: string;
    productItemId: string;
    ImageUrl: Blob | null;
};
export const ProductItemAPI = {
    getALlProductItems: async () => {
        const res = await http.get('/product-items');
        return _get(res, 'data');
    },
    getAllByProductId: async (productId: string) => {
        const res = await http.get(`/product/${productId}/product-items`);
        return _get(res, 'data');
    },
    getProductItemById: async (productId: string) => {
        const res = await http.get(`/product-item/${productId}`);
        return _get(res, 'data');
    },
    getProductItemByFarmHubIdAndProductId: async (farmHubId: string, productId: string) => {
        const res = await http.get(`/farmhub/${farmHubId}/product/${productId}/product-items`);
        return _get(res, 'data');
    },
    deleteProductItem: async (productId: string) => {
        const res = await http.delete(`/product-item/${productId}`);
        return res;
    },
    createProductItem: async (body: any, id: string) => {
        const res = await http.post(`product/${id}/product-item`, body, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Access-Control-Allow-Origin': '*',
            },
        });
        return _get(res, 'data');
    },
    updateProductItem: async (body: any, id: string) => {
        const res = await http.put(`product-item/${id}`, body);
        return _get(res, 'data');
    },

    updateProductItemImage: async (body: any, id: string) => {
        const res = await http.put(`/product-image/${id}`, body);
        return _get(res, 'data');
    },

    getProductItemImage: async (id: String) => {
        const res = await http.get(`/product-item/${id}/product-images`);
        return _get(res, 'data');
    },
    updateProductImage: async (data: UploadImageFormData) => {
        const res = await http.put(
            `product-image/${data.imageId}`,
            {
                ProductItemId: data.productItemId,
                ImageUrl: data.ImageUrl,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
        return _get(res, 'data');
    },
    deleteImage: async (imageId: string) => {
        const res = await http.delete(`/product-image/${imageId}`);
        return res;
    },
};
