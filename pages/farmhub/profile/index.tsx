import { DashboardHeaderLayout } from '@components/layouts';
import { ProtectWrapper } from '@components/wrappers';
import { ModalProvider } from '@context/modalContext';
import { TableUtilProvider } from '@context/tableUtilContext';
import { ProfileInformation } from '@features/farmhub/profile/ProfileInformation';
import { UserRole } from '@models/user';
import { useStoreUser } from '@store/index';
import { NextPage } from 'next';

interface ProfilePageProps {}

const ProfilePage: NextPage<ProfilePageProps> = () => {
    const { farmHub } = useStoreUser();
    return (
        <ProtectWrapper acceptRoles={[UserRole.FARM_HUB, UserRole.COLLECTED_STAFF]}>
            <ModalProvider>
                <TableUtilProvider>
                    <DashboardHeaderLayout
                        title="Thông tin cá nhân"
                        // breadcrumbs={[
                        //     { key: '1', element: <span className="text-primary">Dashboard</span>, path: routes.farmhub.home() },
                        //     { key: '2', element: 'Lịch sử giao dịch' },
                        // ]}
                    >
                        <ProfileInformation />
                    </DashboardHeaderLayout>
                </TableUtilProvider>
            </ModalProvider>
        </ProtectWrapper>
    );
};

export default ProfilePage;
