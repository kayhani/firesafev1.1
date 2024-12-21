import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { OfferRequests, RequestSub, Services, User, Institutions } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// İlişkili tipleri tanımlayalım
type RequestWithSubs = OfferRequests & {
  creator: User;
  creatorIns: Institutions;
  RequestSub: (RequestSub & {
    service: Services
  })[]
}

const SingleOfferRequestPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const request: RequestWithSubs | null = await prisma.offerRequests.findUnique({
    where: { id },
    include: {
      creator: true,
      creatorIns: true,
      RequestSub: {
        include: {
          service: true
        }
      }
    }
  });

  if (!request) {
    return notFound();
  }

  const creatorFullName = [request.creator.firstName, request.creator.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaPurpleLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Teklif Talep Kartı</h1>
                <div className="flex items-center gap-2">
                  <FormModal
                    table="offer"
                    type="create"
                    data={{
                      requestId: request.id,
                      recipientId: request.creator.id,
                      recipientInsId: request.creatorInsId,
                      offerDate: new Date().toISOString(),
                      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      status: "Beklemede",
                      offerSub: request.RequestSub.map(sub => ({
                        serviceId: sub.serviceId,
                        service: sub.service,
                        size: sub.quantity,
                        detail: sub.detail,
                        unitPrice: '',
                        isFromRequest: true
                      }))
                    }}
                  >
                    <button className="bg-lamaYellow hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm">
                      Teklif Ver
                    </button>
                  </FormModal>
                  {role === "admin" && (
                    <FormModal
                      table="offerRequest"
                      type="update"
                      data={{
                        id: request.id,
                        creatorId: request.creator.id,
                        creatorInsId: request.creatorInsId,
                        start: request.start.toISOString(),
                        end: request.end.toISOString(),
                        status: request.status,
                        details: request.details,
                        requestSub: request.RequestSub.map(sub => ({
                          requiredDate: new Date(sub.requiredDate).toISOString(),
                          serviceId: sub.serviceId,
                          quantity: sub.quantity.toString(),
                          detail: sub.detail
                        }))
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Talep Eden Kurum:</span>
                <span className="text-sm text-gray-500">{request.creatorIns.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Talep Eden Personel:</span>
                <span className="text-sm text-gray-500">{creatorFullName}</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Başlangıç Tarihi:</span>
                  <span>{request.start.toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Bitiş Tarihi:</span>
                  <span>{request.end.toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <span className="text-gray-600">Durumu:</span>
                  <span>{request.status}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <span className="text-gray-600">Açıklama:</span>
                  <span>{request.details}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3">
        <div className="bg-white p-4 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Alt Kalemler</h2>
          </div>
          <div className="flex flex-col gap-4">
            {request.RequestSub.map((sub, index) => (
              <div
                key={sub.id}
                className={`${index % 2 === 0 ? "bg-lamaSkyLight" : "bg-lamaPurpleLight"
                  } p-4 rounded-md`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{sub.service.name}</span>
                  <span className="text-sm bg-white px-2 py-1 rounded-md">
                    {new Date(sub.requiredDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Miktar:</span>
                    <span className="ml-2">{sub.quantity.toString()}</span>
                  </div>
                  {sub.detail && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Detay:</span>
                      <span className="ml-2">{sub.detail}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOfferRequestPage;