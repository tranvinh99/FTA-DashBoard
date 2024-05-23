import { DateInput, FormWrapper, TextInput } from '@components/forms';
import { PriceAPI, UpdatePriceData } from '@core/api/price.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, ModalProps } from 'antd';
import moment from 'moment';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { PriceModel } from '../PriceList';

interface UpdatePriceModal extends ModalProps {
    currentValue: PriceModel;
}
const defaultValues = {
    name: '',
    fromDate: '',
    toDate: '',
};
const UpdatePriceModal: React.FC<UpdatePriceModal> = ({ currentValue, ...props }) => {
    const client = useQueryClient();
    const methods = useForm({
        defaultValues,
    });
    const { errors } = methods.formState;
    React.useEffect(() => {
        methods.setValue('fromDate', currentValue.fromDate);
        methods.setValue('toDate', currentValue.toDate);
        methods.setValue('name', currentValue.name);
    }, [currentValue]);

    const updatePriceMutation = useMutation(async (data: UpdatePriceData) => await PriceAPI.updatePrice(currentValue.id, data), {
        onSuccess: () => {
            client.invalidateQueries(['prices']);
            toast.success('Cập nhật giá thành công');
            props.afterClose && props.afterClose();
        },
    });

    const onSubmit = (data: UpdatePriceData) => {
        if (moment(data.fromDate).isAfter(moment(data.toDate))) {
            methods.setError('toDate', {
                type: 'manual',
                message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
            });
            return;
        }
        if (data.name === '') {
            methods.setError('name', {
                type: 'manual',
                message: 'Tên bảng giá không được để trống',
            });
            methods.setValue('name', currentValue.name);
            return;
        }
        data.fromDate = moment(data.fromDate).toISOString();
        data.toDate = moment(data.toDate).toISOString();

        // console.log(data);
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
                            methods.setValue('fromDate', currentValue.fromDate);
                            methods.setValue('toDate', currentValue.toDate);
                            methods.setValue('name', currentValue.name);
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
                        <TextInput name="name" label="Tên loại giá" required />
                        {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
                    </div>
                    <div>
                        <DateInput name="fromDate" label="Từ ngày" format="YYYY MM DD" />
                        {errors.fromDate && <p style={{ color: 'red' }}>{errors.fromDate.message}</p>}
                    </div>
                    <div>
                        <DateInput name="toDate" label="Đến ngày" format="YYYY MM DD" />
                        {errors.toDate && <p style={{ color: 'red' }}>{errors.toDate.message}</p>}
                    </div>
                </form>
            </Modal>
        </FormWrapper>
    );
};
export default UpdatePriceModal;
