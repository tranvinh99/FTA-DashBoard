import { DashOutlined } from '@ant-design/icons';
import { TableBuilder, TableHeaderCell } from '@components/tables';
import { ADMIN_API } from '@core/api/admin.api';
import { BusinessDayAPI } from '@core/api/business-day.api';
import { routes } from '@core/routes';
import { useDebounce } from '@hooks/useDebounce';
import { BusinessDay } from '@models/business-day';
import { UserRole } from '@models/user';
import { useStoreUser } from '@store/index';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Descriptions, Dropdown, Input, Menu, Modal, Tag } from 'antd';
import clsx from 'clsx';
import { PlusIcon } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface BusinessDayListProps {}
const { Search } = Input;
const BusinessDayList: React.FC<BusinessDayListProps> = () => {
    const { data, isLoading } = useQuery({ queryKey: ['businessDays'], queryFn: async () => await BusinessDayAPI.getAllCH() });
    const [createModalState, setCreateModalState] = useState(false);

    const deleteMutation = useMutation(async (id: string) => await BusinessDayAPI.deleteOne(id));

    const queryClient = useQueryClient();
    const router = useRouter();

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn không?',
            content: 'Bạn không thể phục hồi dữ liệu này!',
            okText: 'Xoá!',
            okType: 'danger',
            cancelText: 'Huỷ',
            onOk: async () => {
                try {
                    await deleteMutation.mutateAsync(id, {
                        onSuccess: () => {
                            queryClient.invalidateQueries(['businessDays']);
                            toast.success('Đã xoá!');
                        },
                    });
                } catch (error) {
                    console.error('Lỗi:', error);
                }
            },
        });
    };

    const user = useStoreUser();

    const createTransactionMutation = useMutation(async (id: string) => await ADMIN_API.createTransactionForFarmHubInBusinessDay(id), {
        onSuccess: () => {
            queryClient.invalidateQueries(['businessDays']);
            toast.success('Gửi tiền cho nông trại thành công');
        },
    });
    const updateStopSellingDayMutation = useMutation(async (id: string) => await ADMIN_API.updateStopsellingDayForFarmHubinBusinessDay(id), {
        onSuccess: () => {
            queryClient.invalidateQueries(['businessDays']);
            toast.success('Dừng ngày bán thành công');
        },
    });

    const listOpenDay: string[] = data?.payload.map((i: BusinessDay) => i.openDay) || [];
    // Search
    const [searchText, setSearchText] = useState('');
    const { debouncedValue } = useDebounce({
        delay: 300,
        value: searchText,
    });
    const businessDayList: BusinessDay[] = data?.payload || [];
    const filterData = businessDayList.filter((f) => f.name.toLowerCase().includes(debouncedValue.toLowerCase()));
    return (
        <div className="flex flex-col w-full gap-2">
            <Descriptions
                labelStyle={{
                    fontWeight: 'bold',
                }}
                bordered
                title={``}
                className="p-4 bg-white rounded-lg"
                extra={
                    <div className="flex items-center w-full gap-5">
                        <Search
                            placeholder="Tìm kiếm ngày bán"
                            allowClear
                            enterButton="Tìm kiếm"
                            size="middle"
                            onChange={(e) => setSearchText(e.target.value)} // Update search text
                            style={{ marginBottom: '1rem', marginTop: '1rem', width: '300px' }}
                        />
                        {user.roleName === UserRole.ADMIN && (
                            <button
                                onClick={() => {
                                    setCreateModalState(!createModalState);
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-white duration-300 hover:text-white hover:bg-primary/90 bg-primary"
                            >
                                <PlusIcon className="w-5 h-5 text-white" />
                                <span>Tạo ngày bán</span>
                            </button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-col w-full gap-2">
                    <TableBuilder<BusinessDay>
                        rowKey="id"
                        isLoading={isLoading}
                        data={filterData}
                        columns={[
                            {
                                title: () => <TableHeaderCell key="name" label="Tên Sự kiện" />,
                                width: 400,
                                key: 'name',
                                render: ({ ...props }: BusinessDay) => <p className="m-0">{props.name}</p>,
                                sorter: (a, b) => a.name.localeCompare(b.name),
                            },

                            {
                                title: () => <TableHeaderCell key="regiterDay" sortKey="regiterDay" label="Ngày đăng ký" />,
                                width: 400,
                                key: 'regiterDay',
                                render: ({ ...props }: BusinessDay) => {
                                    return <p className="m-0">{moment(props.regiterDay).format('DD/MM/YYYY HH:mm:ss')}</p>;
                                },
                                sorter: (a, b) => moment(a.regiterDay).valueOf() - moment(b.regiterDay).valueOf(),
                            },
                            {
                                title: () => <TableHeaderCell key="endOfRegister" sortKey="endOfRegister" label="Ngày Kết thúc đăng ký" />,
                                width: 400,
                                key: 'endOfRegister',
                                render: ({ ...props }: BusinessDay) => {
                                    return <p className="m-0">{moment(props.endOfRegister).format('DD/MM/YYYY HH:mm:ss')}</p>;
                                },
                                sorter: (a, b) => moment(a.endOfRegister).valueOf() - moment(b.endOfRegister).valueOf(),
                            },
                            {
                                title: () => <TableHeaderCell key="openDay" sortKey="openDay" label="Ngày mở bán" />,
                                width: 400,
                                key: 'openDay',
                                render: ({ ...props }: BusinessDay) => {
                                    return <p className="m-0">{moment(props.openDay).format('DD/MM/YYYY HH:mm:ss')}</p>;
                                },
                                sorter: (a, b) => moment(a.openDay).valueOf() - moment(b.openDay).valueOf(),
                            },

                            {
                                title: () => <TableHeaderCell key="numOfBatchesNotReceived" label="Chưa nhận được" />,
                                width: 400,
                                key: 'numOfBatchesNotReceived',
                                render: ({ ...props }: BusinessDay) => <p className="m-0">{props.numOfBatchesNotReceived}</p>,
                                sorter: (a, b) => a.numOfBatchesNotReceived - b.numOfBatchesNotReceived,
                            },
                            {
                                title: () => <TableHeaderCell key="numOfBatchesPending" label="Đang chờ" />,
                                width: 400,
                                key: 'numOfBatchesPending',
                                render: ({ ...props }: BusinessDay) => <p className="m-0">{props.numOfBatchesPending}</p>,
                                sorter: (a, b) => a.numOfBatchesPending - b.numOfBatchesPending,
                            },
                            {
                                title: () => <TableHeaderCell key="numOfBatchesProcessed" label="Đã xử lý" />,
                                width: 400,
                                key: 'numOfBatchesProcessed',
                                render: ({ ...props }: BusinessDay) => <p className="m-0">{props.numOfBatchesProcessed}</p>,
                                sorter: (a, b) => a.numOfBatchesProcessed - b.numOfBatchesProcessed,
                            },
                            {
                                title: () => <TableHeaderCell key="numOfBatchesReceived" label="Đã nhận" />,
                                width: 400,
                                key: 'numOfBatchesReceived',
                                render: ({ ...props }: BusinessDay) => <p className="m-0">{props.numOfBatchesReceived}</p>,
                                sorter: (a, b) => a.numOfBatchesReceived - b.numOfBatchesReceived,
                            },
                            {
                                title: () => <TableHeaderCell key="stopSellingDay" sortKey="stopSellingDay" label="Ngày dừng bán" />,
                                width: 400,
                                key: 'openDay',
                                render: ({ ...props }: BusinessDay) => {
                                    // Check if stopSellingDay is the specific default date
                                    if (moment(props.stopSellingDay).format('DD/MM/YYYY HH:mm:ss') === '01/01/0001 00:00:00' || 'Invalid date') {
                                        return (
                                            <Tag color="yellow" className="m-0">
                                                Chưa cập nhật
                                            </Tag>
                                        );
                                    }
                                    return <p className="m-0">{moment(props.stopSellingDay).format('DD/MM/YYYY HH:mm:ss')}</p>;
                                },
                                sorter: (a, b) => moment(a.stopSellingDay).valueOf() - moment(b.stopSellingDay).valueOf(),
                            },
                            {
                                title: () => <TableHeaderCell key="status" label="Trạng thái" />,
                                width: 400,
                                key: 'status',
                                render: ({ ...props }: BusinessDay) => {
                                    return (
                                        <Tag
                                            className={clsx(`text-sm whitespace-normal`)}
                                            color={
                                                typeof props.status === 'string' && props.status === 'Active'
                                                    ? 'geekblue'
                                                    : props.status === 'Completed'
                                                    ? 'green'
                                                    : props.status === 'PaymentConfirm'
                                                    ? 'magenta'
                                                    : props.status === 'StopSellingDay'
                                                    ? 'red' // You can choose an appropriate color for this new status
                                                    : 'volcano'
                                            }
                                        >
                                            {props.status === 'Active'
                                                ? 'Hoạt động'
                                                : props.status === 'Completed'
                                                ? 'Hoàn thành'
                                                : props.status === 'PaymentConfirm'
                                                ? 'Chờ thanh toán'
                                                : props.status === 'StopSellingDay'
                                                ? 'Dừng bán' // Translate as needed, assumed translation
                                                : 'Không hoạt động'}
                                        </Tag>
                                    );
                                },
                                filters: [
                                    { text: 'Hoạt động', value: 'Active' },
                                    { text: 'Hoàn thành', value: 'Completed' },
                                    { text: 'Chờ thanh toán', value: 'PaymentConfirm' },
                                    { text: 'Dừng bán', value: 'StopSellingDay' },
                                    // Add more filters if needed
                                ],
                                onFilter: (value, record) => record.status === value,
                            },
                            {
                                title: () => <TableHeaderCell key="" sortKey="" label="" />,
                                width: 400,
                                key: 'action',
                                render: ({ ...props }: BusinessDay) => {
                                    return user.roleName === UserRole.ADMIN ? (
                                        <Dropdown
                                            overlay={
                                                <Menu>
                                                    <Menu.Item key="1">
                                                        <Button
                                                            style={{
                                                                background: '#bae0ff',
                                                            }}
                                                            onClick={() => {
                                                                router.push(`/admin/business-day/${props.id}`);
                                                            }}
                                                        >
                                                            Thống kê
                                                        </Button>
                                                    </Menu.Item>
                                                    <Menu.Item key="2">
                                                        <Button
                                                            type="primary"
                                                            disabled={props.status !== 'PaymentConfirm'}
                                                            onClick={() => {
                                                                createTransactionMutation.mutateAsync(props.id);
                                                            }}
                                                        >
                                                            Chuyển tiền cho nông trại
                                                        </Button>
                                                    </Menu.Item>
                                                    <Menu.Item key="3">
                                                        <Button
                                                            type="primary"
                                                            disabled={props.status !== 'Active'}
                                                            onClick={() => {
                                                                updateStopSellingDayMutation.mutateAsync(props.id);
                                                            }}
                                                        >
                                                            Dừng bán
                                                        </Button>
                                                    </Menu.Item>

                                                    <Menu.Item key="4">
                                                        <Button type="primary" danger onClick={() => handleDelete(props.id)}>
                                                            Xoá
                                                        </Button>
                                                    </Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click']}
                                        >
                                            <DashOutlined />
                                        </Dropdown>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                router.push({
                                                    pathname: routes.staff.businessDay.batchList(props.id),
                                                    query: {
                                                        name: props.name,
                                                    },
                                                })
                                            }
                                        >
                                            Xem chi tiết
                                        </Button>
                                    );
                                },
                            },
                        ]}
                    />
                </div>
            </Descriptions>
        </div>
    );
};
export default BusinessDayList;
