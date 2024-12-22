import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  Institutions,
  Notifications,
  User,
  NotificationTypes,
  Devices,
  Prisma,
  DeviceTypes,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type NotificationList = Notifications & { creator: User } & {
  creatorIns: Institutions;
} & { recipient: User } & { recipientIns: Institutions } & {
  type: NotificationTypes;
} & { device: Devices } & { deviceType: DeviceTypes };

const columns = [
  {
    header: "Bildirim ID",
    accessor: "id",
    className: "hidden md:table-cell",
  },

  {
    header: "Oluşturan Kullanıcı",
    accessor: "info",
  },

  {
    header: "Bildirim Tarihi",
    accessor: "notificationDate",
    className: "hidden md:table-cell",
  },

  {
    header: "İlgili Kullanıcı",
    accessor: "info1",
  },
  // {
  //     header:"Cihaz Seri No",
  //     accessor:"deviceSerialNumber",
  //     className: "hidden md:table-cell"
  // },
  // {
  //     header:"Cihaz Sahibi",
  //     accessor:"deviceOwner",
  //     className: "hidden md:table-cell"
  // },

  // {
  //     header:"Bildirim",
  //     accessor:"message",
  //     className: "hidden md:table-cell",
  // },

  {
    header: "Durumu",
    accessor: "isRead",
    className: "hidden md:table-cell",
  },
  // {
  //     header:"Bildirim Türü",
  //     accessor:"notificationType",
  //     className: "hidden md:table-cell",
  // },
  {
    header: "Eylemler",
    accessor: "action",
    className: "hidden md:table-cell",
  },
];

const renderRow = (item: NotificationList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="hidden md:table-cell">{item.id}</td>
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">
          {item.creator.name}
        </h3>
        <p className="text-xs text-gray-500">{item.creatorIns.name}</p>
      </div>
    </td>

    <td className="hidden md:table-cell">
      {item.notificationDate.toLocaleDateString()}
    </td>

    <td className="flex items-center gap-4 p-4">
      {/* <Image
        src={item.photo}
        alt=""
        width={40}
        height={40}
        className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
      /> */}
      <div className="flex flex-col">
        <h3 className="font-semibold">
          {item.recipient.name}
        </h3>
        <p className="text-xs text-gray-500">{item.recipientIns.name}</p>
      </div>
    </td>
    {/* <td className="hidden md:table-cell">{item.deviceSerialNumber}</td>  */}
    {/* <td className="hidden md:table-cell">{item.deviceOwner}</td> */}
    {/* <td className="hidden md:table-cell">{item.message}</td> */}
    <td className="hidden md:table-cell">{item.isRead}</td>
    {/* <td className="hidden md:table-cell">{item.notificationType}</td> */}
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/notifications/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            <Image src="/view.png" alt="" width={24} height={24} />
          </button>
        </Link>
        {role === "admin" && (
          // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
          //   <Image src="/delete.png" alt="" width={16} height={16} />
          // </button>
          <FormModal table="notification" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
);

const NotificationListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  //URL PARAMS CONDITION

  const query: Prisma.NotificationsWhereInput = {}; // Prisma için boş bir query nesnesi oluşturuluyor.

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "recipientId":
            const recipientId = value; // value'yu tam sayıya çeviriyoruz.
            if (recipientId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.recipientId = recipientId;
            }
            break;

          case "creatorId":
            const creatorId = value; // value'yu tam sayıya çeviriyoruz.
            if (creatorId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.creatorId = creatorId;
            }
            break;

          case "recipientInsId":
            const recipientInsId = value; // value'yu tam sayıya çeviriyoruz.
            if (recipientInsId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.recipientId = recipientInsId;
            }
            break;

          case "deviceId":
            const deviceId = value; // value'yu tam sayıya çeviriyoruz.
            if (deviceId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.deviceId = deviceId;
            }
            break;
          // Diğer case'ler eklenebilir. Örneğin, daha fazla filtrasyon yapılmak istenirse.
          case "search":
            query.content = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.notifications.findMany({
      where: query,

      include: {
        creator: true,
        creatorIns: true,
        recipient: true,
        recipientIns: true,
        type: true,
        device: true,
        deviceType: true,
      },

      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.notifications.count(),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex item-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Tüm Bildirimler
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-firelightorange">
              //     <Image src="/plus.png" alt="" width={14} height={14}/>
              // </button>
              <FormModal table="notification" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default NotificationListPage;
