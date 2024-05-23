import { FormWrapper } from '@components/forms';
import { NumberInput } from '@components/forms/NumberInput';
import { PriceAPI, UpdatePriceItemData } from '@core/api/price.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, ModalProps } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { PriceItem } from '../PriceList';

// update modal
interface UpdatePriceItemModalProps extends ModalProps {
    currentValue: PriceItem;
}
const defaultValues = {
    fromAmount: 0,
    toAmount: 0,
    percentage: 0,
    minFee: 0,
    maxFee: 0,
};
const UpdatePriceItemModal: React.FC<UpdatePriceItemModalProps> = ({ currentValue, ...props }) => {
    const client = useQueryClient();
    const methods = useForm({
        defaultValues,
    });
    const { errors } = methods.formState;
    React.useEffect(() => {
        methods.setValue('percentage', currentValue.percentage);
        methods.setValue('toAmount', currentValue.toAmount);
        methods.setValue('fromAmount', currentValue.fromAmount);
        methods.setValue('maxFee', currentValue.maxFee);
        methods.setValue('minFee', currentValue.minFee);
    }, [currentValue]);

    const updatePriceMutation = useMutation(async (data: UpdatePriceItemData) => await PriceAPI.updatePriceItem(currentValue.id, data), {
        onSuccess: () => {
            client.invalidateQueries(['prices']);
            toast.success('Cập nhật giá thành công');
            props.afterClose && props.afterClose();
        },
    });

    const onSubmit = (data: UpdatePriceItemData) => {
        if (data.fromAmount < 0) {
            methods.setError('fromAmount', {
                type: 'custom',
                message: 'Khoảng nhỏ nhất không được âm',
            });
            return;
        }
        if (data.toAmount < 0) {
            methods.setError('toAmount', {
                type: 'custom',
                message: 'Khoảng lớn nhất không được âm',
            });
            return;
        }
        if (data.minFee < 0) {
            methods.setError('minFee', {
                type: 'custom',
                message: 'Phí thấp nhất không được âm',
            });
            return;
        }
        if (data.maxFee < 0) {
            methods.setError('maxFee', {
                type: 'custom',
                message: 'Phí cao nhất không được âm',
            });
            return;
        }
        if (data.toAmount < data.fromAmount) {
            methods.setError('toAmount', {
                type: 'manual',
                message: 'Giá kết thúc phải lớn hơn giá bắt đầu',
            });
            return;
        }
        if (data.maxFee < data.minFee) {
            methods.setError('maxFee', {
                type: 'manual',
                message: 'Phí cao nhất phải lớn hơn thuế thấp nhất',
            });
            return;
        }
        updatePriceMutation.mutate(data);
    };
    return (
        <FormWrapper methods={methods}>
            <Modal
                {...props}
                title="Chỉnh sửa thông tin nông trại"
                width={600}
                footer={[
                    <Button
                        key="reset"
                        type="default"
                        loading={updatePriceMutation.isLoading}
                        onClick={() => {
                            methods.setValue('percentage', currentValue.percentage);
                            methods.setValue('toAmount', currentValue.toAmount);
                            methods.setValue('fromAmount', currentValue.fromAmount);
                            methods.setValue('minFee', currentValue.minFee);
                            methods.setValue('minFee', currentValue.minFee);
                            methods.clearErrors();
                        }}
                    >
                        Giá trị ban đầu
                    </Button>,
                    <Button key="close" type="default" loading={updatePriceMutation.isLoading} onClick={props.onCancel}>
                        Hủy
                    </Button>,
                    <Button key="edit" type="primary" loading={updatePriceMutation.isLoading} onClick={() => methods.handleSubmit(onSubmit)()}>
                        Lưu
                    </Button>,
                ]}
            >
                <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col w-full gap-2">
                    <div>
                        <NumberInput name="fromAmount" label="Từ giá(VNĐ)" required />
                        {errors.fromAmount && <p style={{ color: 'red' }}>{errors.fromAmount.message}</p>}
                    </div>
                    <div>
                        <NumberInput name="toAmount" label="Đến giá(VNĐ)" required />
                        {errors.toAmount && <p style={{ color: 'red' }}>{errors.toAmount.message}</p>}
                    </div>
                    <div>
                        <NumberInput name="percentage" label="%" required />
                        {errors.percentage && <p style={{ color: 'red' }}>{errors.percentage.message}</p>}
                    </div>
                    <div>
                        <NumberInput name="minFee" label="Phí thấp nhất(VNĐ)" required />
                        {errors.minFee && <p style={{ color: 'red' }}>{errors.minFee.message}</p>}
                    </div>
                    <div>
                        <NumberInput name="maxFee" label="Phí cao nhất(VNĐ)" required />
                        {errors.maxFee && <p style={{ color: 'red' }}>{errors.maxFee.message}</p>}
                    </div>
                </form>
            </Modal>
        </FormWrapper>
    );
};
export default UpdatePriceItemModal;
