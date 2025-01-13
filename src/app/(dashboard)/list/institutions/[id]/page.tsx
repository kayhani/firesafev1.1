import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { 
  Institutions,
  UserRole 
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const isAuthorized = (
  currentUserRole: UserRole,
  currentUserInstitutionId: string | null,
  targetInstitutionId: string
) => {
  // ADMIN her kurumu güncelleyebilir
  if (currentUserRole === UserRole.ADMIN) {
    return true;
  }

  // HIZMETSAGLAYICI_SEVIYE1 sadece kendi kurumunu güncelleyebilir
  if (currentUserRole === UserRole.HIZMETSAGLAYICI_SEVIYE1) {
    return currentUserInstitutionId === targetInstitutionId;
  }

  // MUSTERI_SEVIYE1 sadece kendi kurumunu güncelleyebilir
  if (currentUserRole === UserRole.MUSTERI_SEVIYE1) {
    return currentUserInstitutionId === targetInstitutionId;
  }

  // HIZMETSAGLAYICI_SEVIYE2 ve MUSTERI_SEVIYE2 hiçbir kurumu güncelleyemez
  return false;
};

const SingleInstitutionPage = async ({
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

  const instId = id;
  const inst: Institutions | null = await prisma.institutions.findUnique({
    where: { id: instId },
  });

  if (!inst) {
    return notFound();
  }

  const canUpdate = isAuthorized(
    currentUserRole,
    currentUser?.institutionId ?? null,
    inst.id
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-lamaPurpleLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Kurum Kartı</h1>
                {canUpdate && (
                  <FormModal
                    table="institution"
                    type="update"
                    data={{
                      id: inst.id,
                      name: inst.name,
                      address: inst.address,
                      email: inst.email,
                      phone: inst.phone,
                      registrationDate: inst.registrationDate.toISOString().split('T')[0],
                    }}
                    currentUserRole={currentUserRole}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">{inst.name}</p>
              <p className="text-sm text-gray-500">{inst.address}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>{inst.registrationDate.toLocaleDateString()}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{inst.phone}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{inst.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* Küçük kartlar buraya gelecek eğer ihtiyaç varsa */}
          </div>
        </div>
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1 className="text-xl font-semibold">Kurum Takvimi</h1>
          <BigCalendar institutionId={inst.id} />
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Kısayollar</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-black-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/users?institutionId=${inst.id}`}
            >
              Personellerim
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/api/offers?recipientInstId=${inst.id}&creatorInstId=${inst.id}`}
            >
              Tekliflerim
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/devices?ownerInstId=${inst.id}`}
            >
              Cihazlarım
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurple"
              href={`/list/maintenances?customerInsId=${inst.id}`}
            >
              Bakımlarım
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/notifications?recipientInsId=${inst.id}`}
            >
              Bildirimlerim
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/events?recipientInsId=${inst.id}`}
            >
              Randevularım
            </Link>
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
};

export default SingleInstitutionPage;