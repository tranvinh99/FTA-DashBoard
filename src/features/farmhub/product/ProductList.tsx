import { TableBuilder, TableHeaderCell } from '@components/tables';
import { productAPI } from '@core/api/product.api';
import { routes } from '@core/routes';
import { Product } from '@models/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Tag } from 'antd';
import clsx from 'clsx';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'react-toastify';

import { WarningOutlined } from '@ant-design/icons';

interface ProductListProps {}

const ProductList: React.FunctionComponent<ProductListProps> = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await productAPI.getProducts();
            return res;
        },
    });
    const products: Product[] = data?.payload;

    const [openCreateModalState, setOpenCreateModalState] = React.useState<boolean>(false);
    // Update modal
    const [openUpdateModalState, setOpenUpdateModalState] = React.useState<boolean>(false);
    const [productValue, setProductValue] = React.useState({
        id: '',
        categoryId: '',
        name: '',
        description: '',
        code: '',
        status: '',
        label: '',
        createdAt: '',
        updatedAt: '',
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await productAPI.deleteProduct(productId);
            return res;
        },
    });

    const queryClient = useQueryClient();

    const handleDeleteProduct = (id: string) => {
        Modal.confirm({
            title: 'Bạn có muốn xoá?',
            content: 'Hành động này sẽ không thể hoàn tác lại được!',
            okText: 'Xoá!',
            okType: 'danger',
            icon: <WarningOutlined style={{ color: 'red' }} />,
            cancelText: 'Trở lại',
            onOk: async () => {
                try {
                    await deleteProductMutation.mutateAsync(id, {
                        onSuccess: () => {
                            queryClient.invalidateQueries(['products']);
                            toast.success('Xoá thành công!');
                        },
                    });
                } catch (error) {
                    console.error('Lỗi:', error);
                }
            },
        });
    };

    return (
        <div className="flex flex-col w-full gap-10">
            {/* <div className="flex flex-col items-end w-full gap-2 ">
                <button
                    onClick={() => {
                        setOpenCreateModalState(!openCreateModalState);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-white duration-300 hover:text-white hover:bg-primary/90 bg-primary"
                >
                    <PlusIcon className="w-5 h-5 text-white" />
                    <span>
                        <strong>Thêm Sản Phẩm</strong>
                    </span>
                </button>
            </div> */}
            {/* <FormFilterWrapper<IV1GetFilterExpert> defaultValues={{ ...filter }}>
                <div className="w-56">
                    <TextInput name="name" label="Name" />
                </div>
                <div className="w-56">
                    <TextInput name="email" label="Email" />
                </div>
            </FormFilterWrapper> */}

            <TableBuilder<Product>
                rowKey="id"
                isLoading={isLoading}
                data={products}
                columns={[
                    {
                        title: () => <TableHeaderCell key="name" sortKey="name" label="Sản Phẩm" />,
                        width: 400,
                        key: 'name',
                        render: ({ ...props }: Product) => <span>{props.name}</span>,
                    },
                    {
                        title: () => <TableHeaderCell key="code" sortKey="code" label="Mã" />,
                        width: 400,
                        key: 'code',
                        render: ({ ...props }: Product) => <span>{props.code}</span>,
                    },
                    {
                        title: () => <TableHeaderCell key="status" sortKey="status" label="Status" />,
                        width: 400,
                        key: 'status',
                        render: ({ ...props }: Product) => {
                            return (
                                <Tag
                                    className={clsx(`text-sm whitespace-normal`)}
                                    color={
                                        typeof props.status === 'string' && props.status === 'Active'
                                            ? 'green'
                                            : props.status === 'Active'
                                            ? 'geekblue'
                                            : 'volcano'
                                    }
                                >
                                    {props.status === 'Active' ? 'Hoạt động' : props.status === 'PENDING' ? 'Đang chờ' : 'Không hoạt động'}
                                </Tag>
                            );
                        },
                    },
                    {
                        title: () => <TableHeaderCell key="detail" sortKey="detail" label="Các sản phẩm" />,
                        width: 400,
                        key: 'detail',
                        render: ({ ...props }: Product) => (
                            <div
                                onClick={() => {
                                    console.log('props:', props.id);
                                }}
                            >
                                <Link href={routes.farmhub.product.detail(props.id)}>Xem chi tiết</Link>
                            </div>
                        ),
                    },
                    // {
                    //     title: () => <TableHeaderCell key="" sortKey="" label="" />,
                    //     width: 100,
                    //     key: 'action',
                    //     render: ({ ...props }: Product) => (
                    //         <Link href={routes.farmhub.product.detail(props.id)}>
                    //             <button className="text-blue-500">Xem Chi tiết</button>
                    //         </Link>
                    //     ),
                    // },
                ]}
            />
            {/* <CreateProductModal open={openCreateModalState} onCancel={() => setOpenCreateModalState(false)} />
            <UpdateProductModal open={openUpdateModalState} onCancel={() => setOpenUpdateModalState(false)} currentValue={productValue} /> */}
        </div>
    );
};

export default ProductList;
