import { EyeOutlined } from '@ant-design/icons';
import { TableBodyCell, TableBuilder, TableHeaderCell } from '@components/tables';
import { useTableUtil } from '@context/tableUtilContext';
import { PriceAPI } from '@core/api/price.api';
import { useDebounce } from '@hooks/useDebounce';
import { UserRole } from '@models/user';
import { useStoreUser } from '@store/index';
import { useQuery } from '@tanstack/react-query';
import { Button, Descriptions, Input, Modal, ModalProps } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';

import UpdatePriceItemModal from './components/UpdatePriceItemModal';
import UpdatePriceModal from './components/UpdatePriceModal';

interface PriceListProp {}
export type PriceItem = {
    id: string;
    fromAmount: number;
    toAmount: number;
    percentage: number;
    minFee: number;
    maxFee: number;
};
export type PriceModel = {
    id: string;
    name: string;
    fromDate: string;
    toDate: string;
    priceTableItems: PriceItem[] | null;
};
const { Search } = Input;

const PriceList: React.FC<PriceListProp> = () => {
    const { setTotalItem } = useTableUtil();
    const { data, isLoading } = useQuery({
        queryKey: ['prices'],
        queryFn: async () => {
            const res = await PriceAPI.getAll();
            setTotalItem(res.length);
            return res;
        },
    });
    const priceList: PriceModel[] = data?.payload || [];
    const [searchText, setSearchText] = useState('');
    const { debouncedValue } = useDebounce({
        delay: 300,
        value: searchText,
    });
    const filterData = priceList.filter((i) => i.name.toLowerCase().includes(debouncedValue.toLowerCase()));

    const [modalState, setModalState] = useState(false);
    const [priceInfo, setPriceInfo] = useState<PriceItem[]>([] as PriceItem[]);
    const user = useStoreUser();
    // Update price modal state
    const [updateModalState, setUpdateModalState] = useState(false);
    const [defaultPrice, setDefaultPrice] = useState<PriceModel>({} as PriceModel);

    return (
        <div className="flex flex-col w-full gap-2">
            <Descriptions
                labelStyle={{
                    fontWeight: 'bold',
                }}
                bordered
                title={`Bảng giá sàn`}
                className="p-4 bg-white rounded-lg"
                extra={
                    <div className="flex items-center w-full gap-5">
                        <Search
                            placeholder="Tìm kiếm theo tên"
                            allowClear
                            enterButton="Tìm kiếm"
                            size="middle"
                            onChange={(e) => setSearchText(e.target.value)} // Update search text
                            style={{ marginBottom: '1rem', marginTop: '1rem', width: '500px' }}
                        />
                    </div>
                }
            >
                <div className="flex flex-col w-full gap-2">
                    <TableBuilder<PriceModel>
                        rowKey="id"
                        isLoading={isLoading}
                        data={filterData}
                        columns={[
                            {
                                title: () => <TableHeaderCell key="name" label="Loại giá" />,
                                width: 400,
                                key: 'name',
                                render: ({ ...props }: PriceModel) => (
                                    <p className="m-0">{props.name === 'Price to Caculate DailyFee' ? 'Phí hàng ngày' : props.name}</p>
                                ),
                                sorter: (a, b) => a.name.localeCompare(b.name),
                            },
                            {
                                title: () => <TableHeaderCell key="fromDate" label="Từ ngày" />,
                                width: 400,
                                key: 'fromDate',
                                render: ({ ...props }: PriceModel) => (
                                    <TableBodyCell label={<div>{moment(props.fromDate).format('DD/MM/YYYY')}</div>} />
                                ),
                                sorter: (a, b) => moment(a.fromDate).valueOf() - moment(b.fromDate).valueOf(),
                            },
                            {
                                title: () => <TableHeaderCell key="toDate" label="Đến ngày ngày" />,
                                width: 400,
                                key: 'toDate',
                                render: ({ ...props }: PriceModel) => (
                                    <TableBodyCell label={<div>{moment(props.toDate).format('DD/MM/YYYY')}</div>} />
                                ),
                                sorter: (a, b) => moment(a.toDate).valueOf() - moment(b.toDate).valueOf(),
                            },

                            {
                                title: () => <TableHeaderCell key="" label="" />,
                                width: 400,
                                key: 'action',
                                render: ({ ...props }: PriceModel) => {
                                    return (
                                        <EyeOutlined
                                            className="w-10 h-10 mt-4 text-blue-500 cursor-pointer"
                                            style={{ fontSize: '1.5rem' }}
                                            onClick={() => {
                                                setModalState(!modalState);
                                                setPriceInfo(props.priceTableItems || []);
                                            }}
                                        />
                                    );
                                },
                            },
                            {
                                title: () => <TableHeaderCell key="" label="" />,
                                width: user.roleName === UserRole.ADMIN ? 400 : 0,
                                key: 'action',
                                render: ({ ...props }: PriceModel) => {
                                    return (
                                        user.roleName === UserRole.ADMIN && (
                                            <Button
                                                onClick={() => {
                                                    setUpdateModalState(!updateModalState);
                                                    setDefaultPrice(props);
                                                }}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                        )
                                    );
                                },
                            },
                        ]}
                    />
                </div>
            </Descriptions>
            <PriceItemModal item={priceInfo} open={modalState} onCancel={() => setModalState(false)} />
            <UpdatePriceModal
                open={updateModalState}
                onCancel={() => setUpdateModalState(false)}
                currentValue={defaultPrice}
                afterClose={() => setUpdateModalState(false)}
            />
        </div>
    );
};
//price-item modal
export interface PriceItemModalProps extends ModalProps {
    item: PriceItem[];
}
const PriceItemModal: React.FC<PriceItemModalProps> = ({ item, ...rest }) => {
    const user = useStoreUser();
    const [defaultValue, setDefaultValue] = useState<PriceItem>({} as PriceItem);
    const [updateState, setUpdateState] = useState(false);
    return (
        <>
            <Modal {...rest} title={<div className="text-2xl font-semibold">Thông tin các loại giá</div>} width={1200} footer={null}>
                <Descriptions className="p-4 bg-white rounded-lg">
                    <div className="flex flex-col w-full gap-2">
                        <TableBuilder<PriceItem>
                            isLoading={false}
                            rowKey="id"
                            data={item}
                            columns={[
                                {
                                    title: () => <TableHeaderCell key="fromAmount" label="Từ giá(VNĐ" />,
                                    width: 400,
                                    key: 'fromAmount',
                                    render: ({ ...props }: PriceItem) => <p className="m-0">{props.fromAmount}</p>,
                                    sorter: (a, b) => a.fromAmount - b.fromAmount,
                                },
                                {
                                    title: () => <TableHeaderCell key="toAmount" label="Đến giá(VNĐ)" />,
                                    width: 400,
                                    key: 'toAmount',
                                    render: ({ ...props }: PriceItem) => <p className="m-0">{props.toAmount}</p>,
                                    sorter: (a, b) => a.toAmount - b.toAmount,
                                },
                                {
                                    title: () => <TableHeaderCell key="percentage" label="Phần trăm" />,
                                    width: 400,
                                    key: 'percentage',
                                    render: ({ ...props }: PriceItem) => <p className="m-0">{props.percentage + '%'}</p>,
                                    sorter: (a, b) => a.percentage - b.percentage,
                                },
                                {
                                    title: () => <TableHeaderCell key="minFee" label="Phí thấp nhất(VND)" />,
                                    width: 400,
                                    key: 'minFee',
                                    render: ({ ...props }: PriceItem) => <p className="m-0">{props.minFee}</p>,
                                    sorter: (a, b) => a.minFee - b.minFee,
                                },
                                {
                                    title: () => <TableHeaderCell key="maxFee" label="Phí cao nhất(VND)" />,
                                    width: 400,
                                    key: 'maxFee',
                                    render: ({ ...props }: PriceItem) => <p className="m-0">{props.maxFee}</p>,
                                    sorter: (a, b) => a.maxFee - b.maxFee,
                                },
                                {
                                    title: () => <TableHeaderCell key="" label="" />,
                                    width: user.roleName === UserRole.ADMIN ? 400 : 0,
                                    key: 'action',
                                    render: ({ ...props }: PriceItem) => {
                                        return (
                                            user.roleName === UserRole.ADMIN && (
                                                <Button
                                                    type="primary"
                                                    onClick={() => {
                                                        setUpdateState(!updateState);
                                                        setDefaultValue(props);
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            )
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>
                </Descriptions>
            </Modal>
            <UpdatePriceItemModal
                currentValue={defaultValue}
                open={updateState}
                onCancel={() => setUpdateState(false)}
                afterClose={() => setUpdateState(false)}
            />
        </>
    );
};

export default PriceList;
