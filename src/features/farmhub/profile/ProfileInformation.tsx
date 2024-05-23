import React from 'react';
import { ProtectWrapper } from '@components/wrappers'; // Ensure this is imported if used
import { UserRole } from '@models/user'; // Ensure this is the correct import path
import { useStoreUser } from '@store/index'; // Ensure this hooks correctly fetches user data
import { Badge } from 'antd';

export const ProfileInformation = () => {
    const user = useStoreUser();

    // Dynamic class that adjusts based on the user's role
    const containerClass =
        user.roleName === UserRole.COLLECTED_STAFF
            ? 'flex flex-col w-full max-w-full overflow-hidden bg-white shadow sm:rounded-lg' // Full width if COLLECTED_STAFF
            : 'w-1/2 max-w-2xl overflow-hidden bg-white shadow sm:rounded-lg'; // Half width otherwise

    return (
        <div className="flex justify-between w-full px-20">
            <div className={containerClass}>
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Thông tin</h3>
                    <p className="max-w-2xl mt-1 text-sm text-gray-500">Chi tiết và thông tin về người dùng.</p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Tên đầy đủ</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {user.firstName} {user.lastName}
                            </dd>
                        </div>
                        <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                        </div>
                        <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phoneNumber}</dd>
                        </div>
                        <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Mã Code</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.code}</dd>
                        </div>
                        <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.address}</dd>
                        </div>
                    </dl>
                </div>
            </div>
            {user.roleName === UserRole.FARM_HUB && (
                <div className="w-1/2 max-w-2xl overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Thông tin cửa hàng</h3>
                        <p className="max-w-2xl mt-1 text-sm text-gray-500">Chi tiết và thông tin về cửa hàng của người dùng.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Tên cửa hàng</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.farmHub?.name}</dd>
                            </div>
                            <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Mã Code</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.farmHub?.code}</dd>
                            </div>
                            <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.farmHub?.description}</dd>
                            </div>
                            <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Địa chỉ cửa hàng</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.farmHub?.address}</dd>
                            </div>
                            <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Trạng thái hoạt động</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <Badge
                                        status={user.farmHub?.status === 'Active' ? 'success' : 'error'}
                                        text={user.farmHub?.status === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
                                    />
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
};
