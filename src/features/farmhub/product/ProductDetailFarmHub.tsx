import { WarningOutlined } from '@ant-design/icons';
import { TableActionCell, TableBuilder, TableHeaderCell } from '@components/tables';
import { useTableUtil } from '@context/tableUtilContext';
import { ProductItemAPI } from '@core/api/product-item.api';
import { useQueryGetAllProductItems } from '@hooks/api/product.hook';
import { useDebounce } from '@hooks/useDebounce';
import { ProductItem } from '@models/product-item';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Carousel, Descriptions, Image, Input, Modal, Tag } from 'antd';
import { PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import CreateProductItemModal from './components/CreateProductItemModal';
import UpdateImageModal from './components/UpdateImageModal';
import UpdateProductItemModal from './components/UpdateProductItemModal';
const { Search } = Input;
interface ProductDetailFarmHubProps {
    // product: Product;
    farmHubId: string;
}
const ProductDetailFarmHub: React.FC<ProductDetailFarmHubProps> = ({ farmHubId }) => {
    const { setTotalItem } = useTableUtil();
    const { data, isSuccess, isLoading } = useQueryGetAllProductItems();

    const item: ProductItem[] = data || [];

    const deleteItemMutation = useMutation(async (id: string) => await ProductItemAPI.deleteProductItem(id));

    const queryClient = useQueryClient();
    const [openCreateModalState, setOpenCreateModalState] = React.useState<boolean>(false);
    const [openUpdateModalState, setOpenUpdateModalState] = React.useState<boolean>(false);
    const [productItemId, setProductItemId] = React.useState<string>('');

    const handleDeleteProductItem = (id: string) => {
        Modal.confirm({
            title: 'Bạn có muốn xoá?',
            content: 'Hành động này sẽ không thể hoàn tác lại được!',
            okText: 'Xoá!',
            okType: 'danger',
            icon: <WarningOutlined style={{ color: 'red' }} />,
            cancelText: 'Trở lại',
            onOk: async () => {
                try {
                    deleteItemMutation.mutateAsync(id, {
                        onSuccess: () => {
                            queryClient.invalidateQueries(['product-items', 'products']);
                            queryClient.invalidateQueries(['all-product-items']);
                            toast.success('Xoá thành công!');
                        },
                    });
                } catch (error) {
                    console.error('Lỗi:', error);
                }
            },
        });
    };
    //Search bar
    const [searchText, setSearchText] = React.useState('');
    const { debouncedValue } = useDebounce({
        delay: 300,
        value: searchText,
    });
    const filterData = item.filter(
        (i) =>
            i.productName.toLowerCase().includes(debouncedValue.toLowerCase()) ||
            i.productOrigin.toLowerCase().includes(debouncedValue.toLowerCase()) ||
            i.title.toLowerCase().includes(debouncedValue.toLowerCase())
    );
    //
    const [productId, setProductId] = useState('');
    const [imageList, setImagesList] = useState<any[]>([]);
    const [imageModalState, setImageModalState] = useState(false);

    return (
        <>
            <div className="flex flex-col w-full gap-4">
                <Descriptions
                    labelStyle={{
                        fontWeight: 'bold',
                    }}
                    extra={
                        <div className="flex items-center w-full gap-5">
                            <Search
                                placeholder="Tìm kiếm"
                                allowClear
                                enterButton="Tìm kiếm"
                                size="middle"
                                onChange={(e) => setSearchText(e.target.value)} // Update search text
                                style={{ marginBottom: '1rem', marginTop: '1rem', width: '300px' }}
                            />
                            <button
                                onClick={() => {
                                    setOpenCreateModalState(!openCreateModalState);
                                }}
                                className="flex items-center gap-1 px-3 py-[5px] text-white duration-300 hover:text-white hover:bg-primary/90 bg-primary"
                            >
                                <PlusIcon className="w-5 h-5 text-white" />
                                <span>
                                    <strong>Thêm Sản Phẩm</strong>
                                </span>
                            </button>
                        </div>
                    }
                    bordered
                    title={`Tất cả các sản phẩm của FarmHub`}
                    className="p-4 bg-white rounded-lg"
                >
                    <div className="flex flex-col w-full gap-2">
                        <TableBuilder<ProductItem>
                            rowKey="id"
                            isLoading={isLoading}
                            data={filterData}
                            columns={[
                                {
                                    title: () => <TableHeaderCell key="productImage" label="Hình ảnh" />,
                                    width: 150,
                                    key: 'productImage',
                                    render: ({ ...props }: ProductItem) => (
                                        <div className="w-[150px]">
                                            <Carousel>
                                                {props.productImages.length > 0 ? (
                                                    props?.productImages.map((image, index) => (
                                                        <Image
                                                            key={index}
                                                            src={image.imageUrl}
                                                            height={150}
                                                            width={200}
                                                            alt="productImage"
                                                            style={{ width: '100%', height: 'auto' }}
                                                            className="object-cover w-full h-40"
                                                        />
                                                    ))
                                                ) : (
                                                    <Image
                                                        src="/assets/images/farm-hub-logo.png"
                                                        height={150}
                                                        width={200}
                                                        alt="productImage"
                                                        style={{ width: '100%', height: 'auto' }}
                                                        className="object-cover w-full h-40"
                                                    />
                                                )}
                                            </Carousel>
                                        </div>
                                    ),
                                },
                                {
                                    title: () => <TableHeaderCell key="productName" label="Tên sản phẩm" />,
                                    width: 350,
                                    sorter: (a, b) => a.productName.localeCompare(b.productName),
                                    key: 'productName',
                                    render: ({ ...props }: ProductItem) => (
                                        <p
                                            style={{
                                                color: props.id === '350910d4-ed12-48e6-9145-f3b148680a0e' ? 'red' : 'black',
                                            }}
                                        >
                                            {props.productName}
                                        </p>
                                    ),
                                },
                                {
                                    title: () => <TableHeaderCell key="title" label="Sản phẩm chi tiết" />,
                                    width: 350,
                                    sorter: (a, b) => a.title.localeCompare(b.title),
                                    key: 'title',
                                    render: ({ ...props }: ProductItem) => <p className="m-0">{props.title}</p>,
                                },
                                {
                                    title: () => <TableHeaderCell key="productOrigin" label="Nơi sản xuất" />,
                                    width: 300,
                                    sorter: (a, b) => a.productOrigin.localeCompare(b.productOrigin),
                                    key: 'productOrigin',
                                    render: ({ ...props }: ProductItem) => <p className="m-0">{props.productOrigin}</p>,
                                },
                                {
                                    title: () => <TableHeaderCell key="description" label="Mô tả sản phẩm" />,
                                    width: 800,
                                    key: 'description',
                                    render: ({ ...props }: ProductItem) => <p className="m-0">{props.description}</p>,
                                },
                                {
                                    title: () => <TableHeaderCell key="quantity" label="Số lượng" />,
                                    width: 400,
                                    sorter: (a, b) => a.quantity - b.quantity,
                                    key: 'quantity',
                                    render: ({ ...props }: ProductItem) => <span>{props.quantity}</span>,
                                },
                                {
                                    title: () => <TableHeaderCell key="price" label="Giá tiền/VND" />,
                                    width: 285,
                                    sorter: (a, b) => a.price - b.price,
                                    key: 'price',
                                    render: ({ ...props }: ProductItem) => <span>{props.price.toLocaleString('en')}</span>,
                                },
                                {
                                    title: () => <TableHeaderCell key="unit" label="Đơn vị" />,
                                    width: 260,
                                    sorter: (a, b) => a.unit.localeCompare(b.unit),
                                    key: 'unit',
                                    render: ({ ...props }: ProductItem) => <span>{props.unit}</span>,
                                },
                                {
                                    title: () => <TableHeaderCell key="status" label="Trạng thái" />,
                                    width: 100,
                                    key: 'status',
                                    render: ({ ...props }: ProductItem) => {
                                        // return <Badge status={props.status === 'Selling' ? 'success' : 'warning'} text={props.status} />;
                                        return (
                                            <Tag
                                                color={props.status === 'Selling' ? 'success' : props.status === 'Registered' ? 'blue' : 'error'}
                                                style={{ width: '100px', textAlign: 'center' }}
                                            >
                                                {props.status === 'Selling'
                                                    ? 'Đang bán'
                                                    : props.status === 'Registered'
                                                    ? 'Đã đăng kí'
                                                    : 'Chưa đăng kí'}
                                            </Tag>
                                        );
                                    },
                                    filters: [
                                        { text: 'Đang bán', value: 'Selling' },
                                        { text: 'Đã đăng kí', value: 'Registered' },
                                        { text: 'Chưa đăng kí', value: 'Unregistered' },
                                    ],
                                    onFilter: (value, record) => record.status === value,
                                },
                                {
                                    title: () => <TableHeaderCell label="" />,
                                    width: 50,
                                    key: 'action',
                                    render: ({ ...props }: ProductItem) => {
                                        return (
                                            <TableActionCell
                                                label="Chỉnh Sửa"
                                                key={props.id}
                                                actions={[
                                                    {
                                                        label: (
                                                            <Button key={'edit'} type="primary" className="w-full">
                                                                Chỉnh sửa sản phẩm
                                                            </Button>
                                                        ),
                                                        onClick: () => {
                                                            setProductItemId(props.id);
                                                            setOpenUpdateModalState(true);
                                                            setImagesList(props.productImages);
                                                            setProductId(props.productId);
                                                        },
                                                    },
                                                    {
                                                        label: (
                                                            <Button key={'image-edit'} type="primary" className="w-full">
                                                                Chỉnh sửa ảnh sản phẩm
                                                            </Button>
                                                        ),
                                                        onClick: () => {
                                                            setImageModalState(!imageModalState);
                                                            setImagesList(props.productImages);
                                                        },
                                                    },
                                                    {
                                                        label: (
                                                            <Button type="primary" key={'delete'} danger className="w-full">
                                                                Xóa
                                                            </Button>
                                                        ),
                                                        onClick: () => handleDeleteProductItem(props.id),
                                                    },
                                                ]}
                                            />
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>
                </Descriptions>
            </div>
            <CreateProductItemModal
                open={openCreateModalState}
                onCancel={() => setOpenCreateModalState(false)}
                onClose={() => setOpenCreateModalState(false)}
            />
            {productItemId && (
                <UpdateProductItemModal
                    open={openUpdateModalState}
                    onCancel={() => setOpenUpdateModalState(false)}
                    onClose={() => setOpenUpdateModalState(false)}
                    productItemId={productItemId}
                    productId={productId}
                />
            )}
            <UpdateImageModal
                productImages={imageList}
                open={imageModalState}
                onCancel={() => {
                    setImageModalState(false);
                }}
                afterClose={() => setImageModalState(false)}
            />
        </>
    );
};

export default ProductDetailFarmHub;
