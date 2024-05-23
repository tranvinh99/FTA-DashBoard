import _get from 'lodash.get';

import { http } from './http';
export type UpdatePriceData = {
    name: string;
    fromDate: string;
    toDate: string;
};
export type UpdatePriceItemData = {
    fromAmount: number;
    toAmount: number;
    percentage: number;
    minFee: number;
    maxFee: number;
};
export const PriceAPI = {
    getAll: async () => {
        const res = await http.get('/prices');
        return _get(res, 'data');
    },
    updatePrice: async (id: string, body: UpdatePriceData) => {
        const res = await http.put(`price/${id}`, body);
        return _get(res, 'data');
    },
    updatePriceItem: async (id: string, body: UpdatePriceItemData) => {
        const res = await http.put(`price-item/${id}`, body);
        return _get(res, 'data');
    },
};
