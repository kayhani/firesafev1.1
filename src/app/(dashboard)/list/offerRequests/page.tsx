import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
    OfferRequests,
    User,
    Institutions,
    RequestSub,
    Prisma,
    Services,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type OfferRequestList = OfferRequests & { 
    creatorIns: Institutions 
  } & { 
    creator: User 
  } & {
    RequestSub: (RequestSub & {
      service: Services  // service ilişkisini de ekliyoruz
    })[];
  };

const columns = [
  {
    header: "Talep ID",
    accessor: "id",
    className: "hidden md:table-cell",
  },

  {
    header: "Kurum Adı",
    accessor: "creatorInsId",
    className: "hidden md:table-cell",
  },

  {
    header: "Durum",
    accessor: "status",
    className: "hidden md:table-cell",
  },

  {
    header: "Eylemler",
    accessor: "action",
    className: "hidden md:table-cell",
  },
];

const renderRow = (item: OfferRequestList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="hidden md:table-cell">{item.id}</td>
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.creatorIns.name}</h3>
      </div>
    </td>

    <td className="hidden md:table-cell">{item.status}</td>
    <td>
      <div className="flex items-center gap-2">
        {/* Görüntüle butonu */}
        <Link href={`/list/offerRequests/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            <Image src="/view.png" alt="" width={24} height={24} />
          </button>
        </Link>

        {/* Teklif Ver butonu */}
        <FormModal 
          table="offer" 
          type="create" 
          data={{ 
            requestId: item.id,
            // Talep sahibinin bilgileri (alıcı olarak)
            recipientId: item.creator.id,
            recipientInsId: item.creatorInsId,
            // Oturum açan kullanıcının bilgileri gelecek (tedarikçi - creatorId ve creatorInsId)
            offerDate: new Date().toISOString(), // Şu anki tarih
            validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
            status: "Beklemede",
            // Teklif talebindeki hizmetleri teklif kalemleri olarak ekle
            offerSub: item.RequestSub.map(sub => ({
              serviceId: sub.serviceId,
              service: sub.service, // Servis bilgisini de ekliyoruz

              size: sub.quantity,
              detail: sub.detail,
              unitPrice: '', // Boş bırakıyoruz, tedarikçi dolduracak
              isFromRequest: true // Bu alan kalem düzenlemeyi kısıtlamak için
            }))
          }} 
        >
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow">
            <Image src="/offer.png" alt="" width={20} height={20} />
          </button>
        </FormModal>

        {/* Silme butonu - sadece admin görebilir */}
        {role === "admin" && (
          <FormModal table="offerRequest" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
);

const OfferRequestListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  //URL PARAMS CONDITION

  const query: Prisma.OfferRequestsWhereInput = {}; // Prisma için boş bir query nesnesi oluşturuluyor.

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "id":
            const id = value; // value'yu tam sayıya çeviriyoruz.
            if (id) {
              // geçerli bir sayı olup olmadığını kontrol ediyoruz.
              // Users tablosundaki roleId'ye göre filtreleme yapıyoruz.
              query.id = id;
            }
            break;
          // Diğer case'ler eklenebilir. Örneğin, daha fazla filtrasyon yapılmak istenirse.
          case "search":
            query.creatorId = { contains: value, mode: "insensitive" };
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.offerRequests.findMany({
      where: query,

      include: {
        creatorIns: true,  // institution bilgisini almak için
        creator: true,     // user bilgisini almak için
        RequestSub: {      // RequestSub bilgisini almak için
          include: {
            service: true  // service bilgisini de include ediyoruz
          }
        }

      },

      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.offerRequests.count(),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex item-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tüm Teklif Talepleri</h1>
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
              <FormModal table="offerRequest" type="create" />
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

export default OfferRequestListPage;
