import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  Institutions,
  User,
  OfferCards,
  PaymentTermTypes,
  Services,
  OfferSub,
  UserRole
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type OfferWithRelations = OfferCards & {
  paymentTerm: PaymentTermTypes;
  OfferSub: (OfferSub & {
    service: Services;
  })[];
  creator: User;
  creatorIns: Institutions;
  recipient: User;
  recipientIns: Institutions;
};

const isAuthorized = (
  currentUserRole: UserRole,
  currentUserId: string,
  currentUserInstitutionId: string | null,
  offerCreatorId: string,
  offerCreatorInstitutionId: string
) => {
  // ADMIN her teklifi güncelleyebilir
  if (currentUserRole === UserRole.ADMIN) {
    return true;
  }

  // HIZMETSAGLAYICI_SEVIYE1 kendi kurumunun tüm tekliflerini güncelleyebilir
  if (currentUserRole === UserRole.HIZMETSAGLAYICI_SEVIYE1) {
    return currentUserInstitutionId === offerCreatorInstitutionId;
  }

  // HIZMETSAGLAYICI_SEVIYE2 sadece kendi oluşturduğu teklifleri güncelleyebilir
  if (currentUserRole === UserRole.HIZMETSAGLAYICI_SEVIYE2) {
    return currentUserId === offerCreatorId;
  }

  // MUSTERI_SEVIYE1 ve MUSTERI_SEVIYE2 hiçbir teklifi güncelleyemez
  return false;
};

const SingleOfferPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  const currentUserRole = session.user.role as UserRole;
  const currentUserId = session.user.id;

  // Mevcut kullanıcının kurum bilgisini almak için
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { institutionId: true }
  });

  const offer: OfferWithRelations | null = await prisma.offerCards.findUnique({
    where: { id },
    include: {
      paymentTerm: true,
      OfferSub: {
        include: {
          service: true
        }
      },
      creator: true,
      creatorIns: true,
      recipient: true,
      recipientIns: true,
    },
  });

  if (!offer) {
    return notFound();
  }

  const canUpdate = isAuthorized(
    currentUserRole,
    currentUserId,
    currentUser?.institutionId ?? null,
    offer.creatorId,
    offer.creatorInsId
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-lamaPurpleLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Teklif Kartı</h1>
                {canUpdate && (
                  <FormModal
                    table="offer"
                    type="update"
                    data={{
                      id: offer.id,
                      creatorId: offer.creator.id,
                      creatorInsId: offer.creatorIns.id,
                      recipientId: offer.recipient.id,
                      recipientInsId: offer.recipientIns.id,
                      offerDate: new Date(offer.offerDate).toISOString().slice(0, 16),
                      validityDate: new Date(offer.validityDate).toISOString().slice(0, 16),
                      paymentTermId: offer.paymentTerm.id,
                      details: offer.details,
                      status: offer.status,
                      offerSub: offer.OfferSub.map(sub => ({
                        serviceId: sub.service.id,
                        unitPrice: sub.unitPrice.toString(),
                        size: sub.size.toString(),
                        detail: sub.detail || '',
                      }))
                    }}
                    currentUserRole={currentUserRole}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Teklifi Veren Kurum:</span>
                <span className="text-sm text-gray-500">{offer.creatorIns.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Teklifi Veren Personel:</span>
                <span className="text-sm text-gray-500">{offer.creator.name}</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>Teklif Tarihi: {new Date(offer.offerDate).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>Geçerlilik Tarihi: {new Date(offer.validityDate).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{offer.creatorIns.phone}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{offer.creatorIns.email}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/address.png" alt="" width={14} height={14} />
                  <span>{offer.creatorIns.address}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-customer.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-12"
              />
              <div>
                <h1 className="text-md font-semibold">Müşteri</h1>
                <span className="text-sm text-gray-400">{offer.recipient.name}</span>
                <br />
                <span className="text-sm text-gray-400">{offer.recipientIns.name}</span>
              </div>
            </div>

            <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-md font-semibold">Ödeme Koşulu</h1>
                <span className="text-sm text-gray-400">{offer.paymentTerm.name}</span>
              </div>
            </div>

            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-price.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-md font-semibold">Toplam Tutar</h1>
                <span className="text-sm text-gray-400">
                  {offer.OfferSub.reduce((total, sub) =>
                    total + (Number(sub.unitPrice) * Number(sub.size)),
                    0
                  ).toFixed(2)} ₺
                </span>
              </div>
            </div>

            <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-status.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-md font-semibold">Durumu</h1>
                <span className="text-sm text-gray-400">{offer.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-1/3">
        <div className="bg-white p-4 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Alt Kalemler</h2>
          </div>
          <div className="flex flex-col gap-4">
            {offer.OfferSub.map((sub, index) => (
              <div
                key={sub.id}
                className={`${index % 2 === 0 ? "bg-lamaSkyLight" : "bg-lamaPurpleLight"} p-4 rounded-md`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{sub.service.name}</span>
                  <span className="text-sm bg-white px-2 py-1 rounded-md">
                    {Number(sub.unitPrice).toFixed(2)} ₺
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Miktar:</span>
                    <span className="ml-2">{Number(sub.size).toString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Toplam:</span>
                    <span className="ml-2">{(Number(sub.unitPrice) * Number(sub.size)).toFixed(2)} ₺</span>
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

        {offer.requestId && (
          <div className="bg-white p-4 rounded-md mt-4">
            <h2 className="text-xl font-semibold mb-4">Kısayollar</h2>
            <div className="flex gap-4 flex-wrap text-xs text-black-500">
              <Link
                className="p-3 rounded-md bg-lamaPurpleLight"
                href={`/list/offerRequests/${offer.requestId}`}
                //href={`/list/notifications?recipientId=${user.id}`}
              >
                İlgili Teklif Talebi
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SingleOfferPage;