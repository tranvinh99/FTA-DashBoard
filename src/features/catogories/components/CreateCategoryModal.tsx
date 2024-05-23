import { FormWrapper, SelectInput, TextInput } from '@components/forms';
import { AvatarUploadInput } from '@components/forms/AvatarUploadInput';
import { NumberInput } from '@components/forms/NumberInput';
import { CategoryAPI } from '@core/api/category.api';
import { CreateCategory } from '@models/category';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, ModalProps } from 'antd';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface CreateCategoryModalProps extends ModalProps {}
const defaultValues = {
    name: '',
    description: '',
    image: '',
    code: '',
    status: '',
    displayIndex: 0,
    systemPrice: 0,
    minSystemPrice: 5,
    maxSystemPrice: 6,
    margin: 0,
};
const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ ...rest }) => {
    const methods = useForm({
        defaultValues,
    });
    const queryClient = useQueryClient();

    const createCategoryMutation = useMutation(async (data: CreateCategory) => await CategoryAPI.createCategory(data), {
        onSuccess: (res) => {
            methods.reset();
            toast.success('Tạo mới thành công');
            queryClient.invalidateQueries(['categories']);
            rest.afterClose && rest.afterClose();
        },
        onError: (error) => {
            toast.error('created fail');
        },
    });
    const onSubmit = async (data: CreateCategory) => {
        if (data.name === '') {
            methods.setError('name', {
                type: 'manual',
                message: 'Tên loại sản phẩm không thể để trống',
            });
            return;
        }
        if (data.description === '') {
            methods.setError('description', {
                type: 'manual',
                message: 'Mô tả không thể để trống',
            });
            return;
        }
        if (data.displayIndex <= 0) {
            methods.setError('displayIndex', {
                type: 'manual',
                message: 'Display index phải lớn hơn 0',
            });
            return;
        }
        createCategoryMutation.mutate(data);
    };
    return (
        <FormWrapper methods={methods}>
            <Modal
                {...rest}
                title="Tạo chuyên mục"
                width={600}
                footer={[
                    <Button key="close" type="default" onClick={rest.onCancel}>
                        Huỷ
                    </Button>,
                    <Button key="create" type="primary" onClick={() => methods.handleSubmit(onSubmit)()}>
                        Lưu
                    </Button>,
                ]}
            >
                <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col w-full gap-2">
                    <AvatarUploadInput name="image" label="Hình ảnh" path="categories" />
                    <TextInput name="name" label="Tên loại sản phẩm" required />
                    <TextInput name="description" label="Mô tả" placeholder="Mô tả ..." required />
                    <TextInput name="code" label="Mã" required />
                    <SelectInput
                        label="Trạng thái"
                        name="status"
                        options={[
                            {
                                label: 'Hoạt động',
                                value: 'Active',
                                origin: 'active',
                            },
                            {
                                label: 'Không hoạt động',
                                value: 'Inactive',
                                origin: 'inactive',
                            },
                        ]}
                    />
                    <NumberInput name="displayIndex" label="Vị trí hiển thị" required />
                    <NumberInput name="systemPrice" label="Phí hệ thống(VNĐ)" required />
                </form>
            </Modal>
        </FormWrapper>
    );
};

export default CreateCategoryModal;
