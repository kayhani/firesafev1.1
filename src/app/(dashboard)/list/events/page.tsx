import { auth } from "@/auth";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { 
  Appointments, 
  Institutions, 
  User, 
  Prisma,
  UserRole 
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type EventList = Appointments & { creator: User } & {
  creatorIns: Institutions;
} & { recipient: User } & { recipientIns: Institutions };

const columns = [
  {
    header: "Randevu ID",
    accessor: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Oluşturan Kullanıcı",
    accessor: "info",
  },
  {
    header: "Oluşturma Tarihi",
    accessor: "create",
    className: "hidden md:table-cell",
  },
  {
    header: "İlgili Kullanıcı",
    accessor: "info",
  },
  {
    header: "Başlangıç Tarihi",
    accessor: "start",
    className: "hidden md:table-cell",
  },
  {
    header: "Bitiş Tarihi",
    accessor: "end",
    className: "hidden md:table-cell",
  },
  {
    header: "Eylemler",
    accessor: "action",
    className: "hidden md:table-cell",
  },
];

const isAuthorized = (userRole: UserRole) => {
  const authorizedRoles: Array<UserRole> = [
    UserRole.ADMIN,
    UserRole.HIZMETSAGLAYICI_SEVIYE2
  ];
  return authorizedRoles.includes(userRole);
};

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await auth();
  const currentUserRole = session?.user?.role as UserRole;

  const renderRow = (item: EventList) => (
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
      <td className="hidden md:table-cell">{item.create.toLocaleDateString()}</td>
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.recipient.name}
          </h3>
          <p className="text-xs text-gray-500">{item.recipientIns.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.start.toLocaleDateString()}</td>
      <td className="hidden md:table-cell">{item.end.toLocaleDateString()}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/events/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
              <Image src="/view.png" alt="" width={24} height={24} />
            </button>
          </Link>
          {isAuthorized(currentUserRole) && (
            <FormModal table="event" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AppointmentsWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "recipientInsId":
            const recipientInstId = value;
            if (!recipientInstId) {
              query.recipientInsId = recipientInstId;
            }
            break;
          case "creatorInstId":
            const creatorInstId = value;
            if (!creatorInstId) {
              query.creatorInsId = creatorInstId;
            }
            break;
          case "search":
            query.tittle = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.appointments.findMany({
      where: query,
      include: {
        creator: true,
        creatorIns: true,
        recipient: true,
        recipientIns: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.appointments.count(),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex item-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Tüm Randevular
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
            {isAuthorized(currentUserRole) && (
              <FormModal table="event" type="create" />
            )}
          </div>
        </div>
      </div>

      <div className="">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;