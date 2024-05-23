import { FormWrapper, SelectInput, TextInput } from '@components/forms';
import { ProductItemAPI } from '@core/api/product-item.api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQueryGetProductItemsByProductId, useQueryProducts } from '@hooks/api/product.hook';
import { Product } from '@models/product';
import { UpdateProductItem } from '@models/product-item';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, ModalProps } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface UpdateProductItemModalProps extends ModalProps {
    onClose: () => void;
    productItemId: string;
    productId: string;
}
const defaultValues = {
    title: '',
    description: '',
    productOrigin: '',
    specialTag: '',
    storageType: '',
    price: 1,
    quantity: 1,
    minOrder: 1,
    unit: '',
    productId: '',
};

const UpdateProductItemModal: React.FC<UpdateProductItemModalProps> = ({ onClose, productItemId, ...rest }) => {
    const methods = useForm({
        defaultValues,
    });

    const queryClient = useQueryClient();

    const id = methods.watch('productId');
    const { data, isSuccess } = useQueryProducts();

    const { data: productData, isSuccess: productIsSuccess } = useQueryGetProductItemsByProductId(productItemId);

    const [product, setProduct] = React.useState<Product[]>([]);

    React.useEffect(() => {
        if (isSuccess) {
            setProduct(data);
        }
    }, [isSuccess]);

    React.useEffect(() => {
        if (productIsSuccess) {
            methods.setValue('title', productData?.title);
            methods.setValue('description', productData?.description);
            methods.setValue('productOrigin', productData?.productOrigin);
            methods.setValue('specialTag', productData?.specialTag);
            methods.setValue('storageType', productData?.storageType);
            methods.setValue('price', productData?.price);
            methods.setValue('quantity', productData?.quantity);
            methods.setValue('minOrder', productData?.minOrder);
            methods.setValue('unit', productData?.unit);
            methods.setValue('productId', productData?.productId);
        }
    }, [methods, productData, productIsSuccess]);

    const updateProductItemMutation = useMutation(
        async (data: UpdateProductItem) => {
            return await ProductItemAPI.updateProductItem(data, productItemId);
        },
        {
            onSuccess: (res) => {
                methods.reset();
                toast.success('Cập nhật thành công.');
                queryClient.invalidateQueries();
                onClose();
            },
            onError: (error) => {
                console.log('error', error);
            },
        }
    );
    //edit image state

    const onSubmit = async (data: UpdateProductItem) => {
        updateProductItemMutation.mutate(data);
    };

    return (
        <FormWrapper methods={methods}>
            <Modal
                {...rest}
                title="Chỉnh sửa sản phẩm chi tiết"
                width={800}
                closeIcon={
                    <XMarkIcon
                        className="absolute w-6 h-6 cursor-pointer top-4"
                        onClick={() => {
                            onClose();
                        }}
                    />
                }
                footer={[
                    <Button key="close" type="default" onClick={onClose}>
                        Trở lại
                    </Button>,
                    <Button key="create" type="primary" onClick={methods.handleSubmit(onSubmit)}>
                        Cập nhập
                    </Button>,
                ]}
            >
                <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col w-full gap-2">
                    <SelectInput
                        label="Sản phẩm"
                        name="productId"
                        defaultValue={product[0]?.id}
                        options={product.map((item) => ({
                            label: item.name,
                            value: item.id,
                            origin: item,
                        }))}
                        required
                    />
                    <TextInput name="title" label="Tên sản phẩm chi tiết" placeholder="Tên sản phẩm ..." required />
                    <TextInput name="description" label="Mô tả sản phẩm" placeholder="Mô tả ..." required />
                    <TextInput name="productOrigin" label="Nơi sản xuất" placeholder="Nơi sản xuất ..." required />
                    <TextInput name="specialTag" label="Tag đặc biệt" required />
                    <TextInput name="storageType" label="Lưu trữ" placeholder="Nơi lưu trữ..." required />
                    <TextInput name="price" label="Giá nhập hàng" required type="number" min={1} step={0.1} />
                    <TextInput name="quantity" label="Số lượng nhập" required type="number" min={1} />
                    <TextInput name="minOrder" label="Đơn hàng tối thiểu" required type="number" min={0} />
                    <SelectInput
                        label="Đơn vị"
                        name="unit"
                        options={[
                            { value: 'kg', label: 'Kg', origin: 'kg' },
                            { value: 'g', label: 'G', origin: 'G' },
                            { value: 'l', label: 'L', origin: 'L' },
                            { value: 'ml', label: 'Ml', origin: 'Ml' },
                            { value: 'cái', label: 'Cái', origin: 'Cái' },
                            { value: 'hộp', label: 'Hộp', origin: 'Hộp' },
                            { value: 'chai', label: 'Chai', origin: 'Chai' },
                            { value: 'Vỉ', label: 'Vỉ', origin: 'Vỉ' },
                        ]}
                    />
                </form>
            </Modal>
        </FormWrapper>
    );
};

export default UpdateProductItemModal;
