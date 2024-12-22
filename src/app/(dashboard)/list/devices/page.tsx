import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  DeviceTypes,
  DeviceFeatures,
  User,
  Institutions,
  IsgMembers,
  Devices,
  Prisma,
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
  // {
  //     header:"Sorumlu Bilgileri",
  //     accessor:"ownerId",
  //     className: "hidden md:table-cell",
  // },

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

const renderRow = (item: DeviceList) => (
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
        <p className="text-xs text-gray-500">
          {item.owner.name}
        </p>
        {/* <td className="hidden md:table-cell">{item.address}</td> */}
      </div>
    </td>
    {/* <td className="hidden md:table-cell">{item.deviceId}</td> */}
    <td className="hidden md:table-cell">{item.feature.name}</td>

    {/* <div className="flex flex-col">
      <td className="hidden md:table-cell">{item.institution.name}</td>
      <td className="hidden md:table-cell">{item.provider.name}</td>

    </div> */}

    {/* <td className="hidden md:table-cell">{item.manufactureDate}</td> */}
    {/* <td className="hidden md:table-cell">{item.expiryDate}</td> */}
    <td className="hidden md:table-cell">
      {item.lastControlDate.toLocaleDateString()}
    </td>
    {/* <td className="hidden md:table-cell">{item.location}</td> */}
    <td className="hidden md:table-cell">{item.currentStatus}</td>
    {/* <td className="hidden md:table-cell">{item.details}</td> */}
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/devices/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            <Image src="/view.png" alt="" width={24} height={24} />
          </button>
        </Link>
        {role === "admin" && (
          // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
          //   <Image src="/delete.png" alt="" width={16} height={16} />
          // </button>
          <FormModal table="device" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
);

const DeviceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  //URL PARAMS CONDITION

  const query: Prisma.DevicesWhereInput = {}; // Prisma için boş bir query nesnesi oluşturuluyor.

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "ownerId":
            const ownerId = value; // value'yu tam sayıya çeviriyoruz.
            if (!ownerId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.ownerId = ownerId;
            }
            break;

          case "providerId":
            const providerId = value; // value'yu tam sayıya çeviriyoruz.
            if (!providerId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.providerId = providerId;
            }
            break;

          case "ownerInstId":
            const ownerInstId = value; // value'yu tam sayıya çeviriyoruz.
            if (!ownerInstId) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.ownerInstId = ownerInstId;
            }
            break;

          // case "pinstitutionId":
          //   const pinstitutionId = parseInt(value); // value'yu tam sayıya çeviriyoruz.
          //   if (!isNaN(pinstitutionId)) { // geçerli bir sayı olup olmadığını kontrol ediyoruz.
          //     // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
          //     query.pinstitutionId = pinstitutionId;
          //   }
          //   break;
          // Diğer case'ler eklenebilir. Örneğin, daha fazla filtrasyon yapılmak istenirse.
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
    prisma.devices.count(),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex item-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tüm Yangın Güvenlik Önlemleri</h1>
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
              <FormModal table="device" type="create" />
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

export default DeviceListPage;
