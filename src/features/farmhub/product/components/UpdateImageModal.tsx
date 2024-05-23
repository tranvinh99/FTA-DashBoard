import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { FormWrapper } from '@components/forms';
import CustomImageUpload from '@components/forms/CustomImageInput';
import { ProductItemAPI, UploadImageFormData } from '@core/api/product-item.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Image, Modal, ModalProps } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type ProductImages = {
    id: string;
    productItemId: string;
    caption: string;
    imageUrl: string;
    displayIndex: number;
    status: string;
};
interface UpdateImageModalProps extends ModalProps {
    productImages: ProductImages[];
}
const defaultValues = {
    ImageUrl: null,
    productItemId: '',
    imageId: '',
};

const UpdateImageModal: React.FC<UpdateImageModalProps> = ({ productImages, ...props }) => {
    const queryClient = useQueryClient();
    const [imageItem, setImageItem] = useState<ProductImages>({} as ProductImages);
    const updateImageMutation = useMutation(
        async (data: UploadImageFormData) => {
            return await ProductItemAPI.updateProductImage(data);
        },
        {
            onSuccess: () => {
                toast.success('Chỉnh sửa ảnh thành công');
                queryClient.invalidateQueries(['all-product-items']);
                setEditState(false);
                props.afterClose && props.afterClose();
            },
            onError: (error) => {
                console.log(error);
                toast.error('Chỉnh sửa thất bại');
            },
        }
    );
    //Delete ảnh
    const deleteImageMutation = useMutation(async (imageId: string) => await ProductItemAPI.deleteImage(imageId), {
        onSuccess(data, variables, context) {
            toast.success('Xóa ảnh thành công');
            queryClient.invalidateQueries(['all-product-items']);
            props.afterClose && props.afterClose();
        },
        onError(error) {
            toast.error('Xóa ảnh thất bại');
            console.log(error);
        },
    });
    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Bạn có chắc muốn xóa ảnh này này',
            content: 'Bạn sẽ không thể khôi phục lại',
            okText: 'Tiếp tục',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    deleteImageMutation.mutate(id);
                } catch (error) {
                    console.error('Lỗi xoá ảnh:', error);
                }
            },
        });
    };

    const [editState, setEditState] = useState(false);
    const methods = useForm({
        defaultValues,
    });

    useEffect(() => {
        methods.setValue('ImageUrl', null);
        methods.setValue('imageId', imageItem.id);
        methods.setValue('productItemId', imageItem.productItemId);
    }, [imageItem]);
    const onSubmit = (data: any) => {
        updateImageMutation.mutate(data);
    };
    return (
        <>
            <Modal
                {...props}
                width={800}
                title="Danh sách hình ảnh"
                onCancel={() => {
                    props.afterClose && props.afterClose();
                    setEditState(false);
                }}
                footer={
                    editState
                        ? [
                              <Button
                                  key="save"
                                  type="primary"
                                  className="my-2"
                                  onClick={() => {
                                      methods.handleSubmit(onSubmit)();
                                  }}
                              >
                                  Lưu
                              </Button>,
                              <Button
                                  key="cancel"
                                  className="my-2"
                                  onClick={() => {
                                      setEditState(false);
                                  }}
                              >
                                  Hủy
                              </Button>,
                          ]
                        : null
                }
            >
                {!editState ? (
                    <div className="grid grid-cols-3 gap-2">
                        {productImages?.length > 0 ? (
                            <Image.PreviewGroup>
                                {productImages.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between mx-2">
                                        <Image width={200} height={150} src={item.imageUrl} alt={item.caption} />
                                        <div className="gr-btn flex flex-col mx-3">
                                            <div className="mb-4 cursor-pointer">
                                                <EditOutlined
                                                    onClick={() => {
                                                        setEditState(!editState);
                                                        setImageItem(item);
                                                    }}
                                                />
                                            </div>
                                            <div className=" cursor-pointer">
                                                <DeleteOutlined
                                                    onClick={() => {
                                                        handleDelete(item.id);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Image.PreviewGroup>
                        ) : (
                            <p className="text-gray-400">Chưa có ảnh sản phẩm</p>
                        )}
                    </div>
                ) : (
                    <FormWrapper methods={methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col w-full gap-2">
                            <CustomImageUpload name="ImageUrl" label="Ảnh sản phẩm mới" />
                        </form>
                    </FormWrapper>
                )}
            </Modal>
        </>
    );
};

export default UpdateImageModal;
