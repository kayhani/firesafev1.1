import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  DeviceTypes,
  DeviceFeatures,
  User,
  Institutions,
  IsgMembers,
  Devices,
  Prisma,
  UserRole,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type DeviceList = Devices & { type: DeviceTypes } & {
  feature: DeviceFeatures;
} & { owner: User } & { ownerIns: Institutions } & { isgMember: IsgMembers };

const columns = [
  {
    header: "Seri No",
    accessor: "serialNumber",
    className: "hidden md:table-cell",
  },
  {
    header: "Bilgi",
    accessor: "info",
  },
  {
    header: "Özelliği",
    accessor: "features",
    className: "hidden md:table-cell",
  },
  {
    header: "Son Kont.Tar.",
    accessor: "lastControlDate",
    className: "hidden md:table-cell",
  },
  {
    header: "Durumu",
    accessor: "currentStatus",
    className: "hidden md:table-cell",
  },
  {
    header: "Eylemler",
    accessor: "action",
    className: "hidden md:table-cell",
  },
];

const canViewDevices = (
  userRole: UserRole,
  deviceOwnerId: string | null,
  deviceProviderId: string | null,
  currentUserId: string | null | undefined
) => {
  if (userRole === UserRole.ADMIN) return true;

  // Müşteri rolündeki kullanıcılar sadece sahip oldukları cihazları görebilir
  if (
    (userRole === UserRole.MUSTERI_SEVIYE1 ||
      userRole === UserRole.MUSTERI_SEVIYE2) &&
    deviceOwnerId === currentUserId
  ) {
    return true;
  }

  // Hizmet sağlayıcı rolündeki kullanıcılar sadece hizmet verdikleri cihazları görebilir
  if (
    (userRole === UserRole.HIZMETSAGLAYICI_SEVIYE1 ||
      userRole === UserRole.HIZMETSAGLAYICI_SEVIYE2) &&
    deviceProviderId === currentUserId
  ) {
    return true;
  }

  return false;
};

const canDeleteDevice = (
  userRole: UserRole,
  deviceOwnerId: string | null,
  currentUserId: string | null | undefined
) => {
  if (userRole === UserRole.ADMIN) return true;

  // Sadece SEVIYE1 müşteriler sahip oldukları cihazları silebilir
  if (
    userRole === UserRole.MUSTERI_SEVIYE1 &&
    deviceOwnerId === currentUserId
  ) {
    return true;
  }

  return false;
};

const canCreateDevice = (userRole: UserRole) => {
  const authorizedRoles: Array<UserRole> = [
    UserRole.ADMIN,
    UserRole.MUSTERI_SEVIYE1
  ];
  return authorizedRoles.includes(userRole);
};

const DeviceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await auth();
  const currentUserRole = session?.user?.role as UserRole;

  const currentUser = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email }
  }) : null;

  const currentUserId = currentUser?.id;

  const renderRow = (
    item: DeviceList,
    userRole: UserRole,
    userId: string | null | undefined
  ) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="hidden md:table-cell">{item.serialNumber}</td>
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.type.name}</h3>
          <p className="text-xs text-gray-500">{item.ownerIns.name}</p>
          <p className="text-xs text-gray-500">{item.owner.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.feature.name}</td>
      <td className="hidden md:table-cell">
        {item.lastControlDate.toLocaleDateString()}
      </td>
      <td className="hidden md:table-cell">{item.currentStatus}</td>
      <td>
        <div className="flex items-center gap-2">
          {canViewDevices(userRole, item.ownerId, item.providerId, userId) && (
            <Link href={`/list/devices/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
                <Image src="/view.png" alt="" width={24} height={24} />
              </button>
            </Link>
          )}
          {canDeleteDevice(userRole, item.ownerId, userId) && (
            <FormModal table="device" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.DevicesWhereInput = {};

  // ADMIN değilse, role göre filtreleme yap
  if (currentUserRole !== UserRole.ADMIN && currentUserId) {
    if (currentUserRole === UserRole.MUSTERI_SEVIYE1 ||
      currentUserRole === UserRole.MUSTERI_SEVIYE2) {
      // Müşteri rolündeki kullanıcılar sadece sahip oldukları cihazları görebilir
      query.ownerId = currentUserId;
    } else if (currentUserRole === UserRole.HIZMETSAGLAYICI_SEVIYE1 ||
      currentUserRole === UserRole.HIZMETSAGLAYICI_SEVIYE2) {
      // Hizmet sağlayıcı rolündeki kullanıcılar sadece hizmet verdikleri cihazları görebilir
      query.providerId = currentUserId;
    }
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "ownerId":
            const ownerId = value;
            if (!ownerId) {
              query.ownerId = ownerId;
            }
            break;
          case "providerId":
            const providerId = value;
            if (!providerId) {
              query.providerId = providerId;
            }
            break;
          case "ownerInstId":
            const ownerInstId = value;
            if (!ownerInstId) {
              query.ownerInstId = ownerInstId;
            }
            break;

          case "institutionFilter":
            const institutionId = value;
            if (institutionId) {
              query.OR = [
                { ownerInstId: institutionId },
                { providerInstId: institutionId }
              ];
            }
            break;
          case "search":
            query.serialNumber = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.devices.findMany({
      where: query,
      include: {
        type: true,
        feature: true,
        owner: true,
        ownerIns: true,
        isgMember: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.devices.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex item-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {currentUserRole === UserRole.ADMIN
            ? 'Tüm Yangın Güvenlik Önlemleri'
            : currentUserRole.startsWith('MUSTERI')
              ? 'Sahip Olduğunuz Yangın Güvenlik Önlemleri'
              : 'Hizmet Verdiğiniz Yangın Güvenlik Önlemleri'}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {currentUserRole === UserRole.ADMIN && (
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
            )}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {canCreateDevice(currentUserRole) && (
              <FormModal table="device" type="create" />
            )}
          </div>
        </div>
      </div>

      <div className="">
        <Table
          columns={columns}
          renderRow={(item) => renderRow(item, currentUserRole, currentUserId)}
          data={data}
        />
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default DeviceListPage;