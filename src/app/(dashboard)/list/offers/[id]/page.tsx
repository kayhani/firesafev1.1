import Announcements from "@/components/Announcements";
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

  // Toplam tutar hesaplama
  const totalAmount = offer.OfferSub.reduce((total, sub) =>
    total + (Number(sub.unitPrice) * Number(sub.size)),
    0
  ).toFixed(2);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* Üst Kısım: Başlık, Eylemler ve Kısayollar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-xl font-semibold">Teklif Dokümanı</h1>
        <div className="flex items-center gap-2">
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
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1">
            <Image src="/download.png" alt="" width={16} height={16} />
            PDF İndir
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1">
            <Image src="/print.png" alt="" width={16} height={16} />
            Yazdır
          </button>
        </div>
      </div>

      {/* Kısayollar */}
      {offer.requestId && (
        <div className="bg-white p-4 rounded-md shadow-sm mb-4">
          <h2 className="text-lg font-semibold mb-2">Kısayollar</h2>
          <div className="flex gap-4 flex-wrap text-xs text-black-500">
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/offerRequests/${offer.requestId}`}
            >
              İlgili Teklif Talebi
            </Link>
          </div>
        </div>
      )}

      {/* Word Benzeri Teklif Dokümanı */}
      <div className="bg-white rounded-md shadow-md p-8 max-w-5xl mx-auto w-full">
        {/* Antet */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-200 pb-6 mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{offer.creatorIns.name}</h2>
            <p className="text-gray-600">{offer.creatorIns.address}</p>
            <p className="text-gray-600">Tel: {offer.creatorIns.phone}</p>
            <p className="text-gray-600">E-posta: {offer.creatorIns.email}</p>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">TEKLİF</h1>
            <p className="text-gray-600">Teklif No: {offer.id}</p>
            <p className="text-gray-600">Tarih: {new Date(offer.offerDate).toLocaleDateString('tr-TR')}</p>
            <p className="text-gray-600">Geçerlilik: {new Date(offer.validityDate).toLocaleDateString('tr-TR')}</p>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Durum: </span>
              <span className={
                offer.status === "Onaylandi" ? "text-green-600" : 
                offer.status === "Red" ? "text-red-600" : "text-yellow-600"
              }>{offer.status}</span>
            </p>
          </div>
        </div>

        {/* Alıcı bilgileri */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Teklif Alıcısı:</h3>
          <p className="font-bold">{offer.recipientIns.name}</p>
          <p>{offer.recipient.name}</p>
          {offer.recipientIns.address && <p className="text-gray-600 mt-1">{offer.recipientIns.address}</p>}
          {offer.recipientIns.phone && <p className="text-gray-600">Tel: {offer.recipientIns.phone}</p>}
          {offer.recipientIns.email && <p className="text-gray-600">E-posta: {offer.recipientIns.email}</p>}
        </div>

        {/* Teklif açıklaması */}
        {offer.details && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Teklif Detayı:</h3>
            <p className="text-gray-700 whitespace-pre-line">{offer.details}</p>
          </div>
        )}

        {/* Teklif kalemleri tablosu */}
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Hizmet</th>
              <th className="border border-gray-300 p-2 text-right">Miktar</th>
              <th className="border border-gray-300 p-2 text-right">Birim Fiyat</th>
              <th className="border border-gray-300 p-2 text-right">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {offer.OfferSub.map((sub, index) => (
              <tr key={sub.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 p-2">
                  <div>
                    <p className="font-medium">{sub.service.name}</p>
                    {sub.detail && <p className="text-sm text-gray-600 mt-1">{sub.detail}</p>}
                  </div>
                </td>
                <td className="border border-gray-300 p-2 text-right">{Number(sub.size).toString()}</td>
                <td className="border border-gray-300 p-2 text-right">{Number(sub.unitPrice).toFixed(2)} ₺</td>
                <td className="border border-gray-300 p-2 text-right font-medium">
                  {(Number(sub.unitPrice) * Number(sub.size)).toFixed(2)} ₺
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td colSpan={3} className="border border-gray-300 p-2 text-right font-bold">
                Toplam:
              </td>
              <td className="border border-gray-300 p-2 text-right font-bold">
                {totalAmount} ₺
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Ödeme koşulları */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Ödeme Koşulları:</h3>
          <p className="text-gray-700">{offer.paymentTerm.name}</p>
        </div>

        {/* İmza & Not alanı */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <p className="font-semibold">Notlar:</p>
              <ul className="text-gray-700 mt-2 list-disc list-inside">
                <li>Bu teklif, belirtilen geçerlilik tarihine kadar geçerlidir.</li>
                <li>Fiyatlara KDV dahil değildir.</li>
                <li>Ödeme, belirtilen ödeme koşullarına göre yapılacaktır.</li>
              </ul>
            </div>
            <div className="text-left md:text-right">
              <p className="font-semibold mb-1">Teklifi Hazırlayan</p>
              <p className="font-medium">{offer.creator.name}</p>
              <p className="text-gray-700">{offer.creatorIns.name}</p>
              <div className="mt-8 border-t-2 border-gray-300 pt-2 text-center">
                <p className="text-sm text-gray-600">İmza & Kaşe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diğer Bilgiler */}
      <Announcements />
    </div>
  );
};

export default SingleOfferPage;