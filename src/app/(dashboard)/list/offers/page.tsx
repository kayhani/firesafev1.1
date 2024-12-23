import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  PaymentTermTypes,
  Services,
  User,
  Institutions,
  OfferCards,
  Prisma,
  UserRole,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type OfferList = OfferCards & {
  paymentTerm: PaymentTermTypes;
  creator: User;
  creatorIns: Institutions;
  recipient: User;
  recipientIns: Institutions;
  OfferSub: {
    unitPrice: Prisma.Decimal;
    size: Prisma.Decimal;
  }[];
};

const calculateTotalAmount = (offerSubs: { unitPrice: Prisma.Decimal; size: Prisma.Decimal }[]) => {
  return offerSubs.reduce((total, sub) => {
    const subTotal = parseFloat(sub.unitPrice.toString()) * parseFloat(sub.size.toString());
    return total + subTotal;
  }, 0);
};

const columns = [
  {
    header: "Teklif ID",
    accessor: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Teklif Veren",
    accessor: "info",
  },
  {
    header: "Teklif Tarihi",
    accessor: "offerDate",
    className: "hidden md:table-cell",
  },
  {
    header: "Müşteri",
    accessor: "info",
    className: "hidden md:table-cell",
  },
  {
    header: "Teklif Tutarı",
    accessor: "amount",
    className: "hidden md:table-cell",
  },
  {
    header: "Durumu",
    accessor: "status",
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

const OfferListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await auth();
  const currentUserRole = session?.user?.role as UserRole;

  const renderRow = (item: OfferList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="hidden md:table-cell">{item.id}</td>
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.creatorIns.name}</h3>
          <p className="text-xs text-gray-500">
            {item.creator.name}
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.offerDate.toLocaleDateString()}
      </td>
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.recipientIns.name}</h3>
          <p className="text-xs text-gray-500">
            {item.recipient.name}
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {calculateTotalAmount(item.OfferSub).toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className="hidden md:table-cell">{item.status}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/offers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
              <Image src="/view.png" alt="" width={24} height={24} />
            </button>
          </Link>
          {isAuthorized(currentUserRole) && (
            <FormModal table="offer" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.OfferCardsWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "recipientId":
            const recipientId = value;
            if (recipientId) {
              query.recipientId = recipientId;
            }
            break;
          case "creatorId":
            const creatorId = value;
            if (creatorId) {
              query.creatorId = creatorId;
            }
            break;
          case "recipientInstId":
            const recipientInstId = value;
            if (recipientInstId) {
              query.recipientInsId = recipientInstId;
            }
            break;
          case "creatorInstId":
            const creatorInstId = value;
            if (creatorInstId) {
              query.creatorInsId = creatorInstId;
            }
            break;
          case "search":
            query.details = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.offerCards.findMany({
      where: query,
      include: {
        paymentTerm: true,
        creator: true,
        creatorIns: true,
        recipient: true,
        recipientIns: true,
        OfferSub: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.offerCards.count(),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex item-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tüm Teklifler</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
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

export default OfferListPage;