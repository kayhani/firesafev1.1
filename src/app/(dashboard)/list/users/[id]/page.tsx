import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
//import Performance from "@/components/Performance";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { Institutions, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

//Ayhan tarafindan eklendi

const SingleUserPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const userId = id; // veya Number(id);
  const user: (User & { institution: Institutions | null }) | null =
    await prisma.user.findUnique({
      where: { id: id },
      include: {
        institution: true,
      },
    });

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaPurpleLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={user.photo || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{user.name}</h1>

                {role === "admin" && (
                  <FormModal
                    table="user"
                    type="update"
                    data={{
                      id: user.id,
                      userName: user.name,
                      email: user.email,
                      bloodType: user.bloodType,
                      birthday: user.birthday
                        ? user.birthday.toISOString().split("T")[0]
                        : null, // date input için YYYY-MM-DD formatı
                      sex: user.sex,
                      phone: user.phone,
                      photo: user.photo,
                      institutionId: user.institutionId,
                      role: user.role,
                      // password alanını göndermiyoruz çünkü güvenlik açısından uygun değil
                    }}
                  />
                )}
                
              </div>
              <p className="text-sm text-gray-500">
                <span className="text-gray-600">Kullanıcı Adı: </span>
                {user.name}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{user.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>{user.birthday?.toLocaleDateString()}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{user.email}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-role.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Rolü</h1>
                <span className="text-sm text-gray-400">{user.role}</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-sex.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Cinsiyet</h1>
                <span className="text-sm text-gray-400">{user.sex}</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-company.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-12"
              />
              <div className="">
                <h1 className="text-md font-semibold">Kurumu</h1>
                <span className="text-sm text-gray-400">
                  {user.institution?.name}
                </span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Üyelik Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {user.registrationDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1 className="text-xl font-semibold">Kullanıcı Takvimi</h1>
          <BigCalendar userId={user.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Kısayollar</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-black-500">
            {user.role === "ADMIN" ? (
              <>
                <Link
                  className="p-3 rounded-md bg-lamaSkyLight"
                  href="/list/offers"
                >
                  Tüm Teklifler
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaPurple"
                  href="/list/maintenances"
                >
                  Tüm Bakımlar
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaPurpleLight"
                  href="/list/devices"
                >
                  Tüm Cihazlar
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaYellowLight"
                  href="/list/notifications"
                >
                  Tüm Bildirimler
                </Link>
              </>
            ) : user.role === "MUSTERI_SEVIYE1" ||
              user.role === "MUSTERI_SEVIYE2" ? (
              <>
                <Link
                  className="p-3 rounded-md bg-lamaSkyLight"
                  href={`/list/offers?recipientId=${user.id}`}
                >
                  Kullanıcı&apos;nın Teklifleri
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaPurple"
                  href={`/list/maintenances?customerId=${user.id}`}
                >
                  Kullanıcı&apos;nın Bakımları
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaPurpleLight"
                  href={`/list/devices?ownerId=${user.id}`}
                >
                  Kullanıcı&apos;nın Cihazları
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaYellowLight"
                  href={`/list/notifications?recipientId=${user.id}`}
                >
                  Kullanıcı&apos;nın Bildirimleri
                </Link>
              </>
            ) : user.role === "HIZMETSAGLAYICI_SEVIYE1" ||
              user.role === "HIZMETSAGLAYICI_SEVIYE2" ? (
              <>
                <Link
                  className="p-3 rounded-md bg-lamaSkyLight"
                  href={`/list/offers?creatorId=${user.id}`}
                >
                  Kullanıcı&apos;nın Teklifleri
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaPurple"
                  href={`/list/maintenances?providerId=${user.id}`}
                >
                  Kullanıcı&apos;nın Bakımları
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaPurpleLight"
                  href={`/list/devices?providerId=${user.id}`}
                >
                  Kullanıcı&apos;nın Cihazları
                </Link>
                <Link
                  className="p-3 rounded-md bg-lamaYellowLight"
                  href={`/list/notifications?recipientId=${user.id}`}
                >
                  Kullanıcı&apos;nın Bildirimleri
                </Link>
              </>
            ) : null}
          </div>
        </div>
        {/* <Performance /> */}
        <Announcements />
      </div>
    </div>
  );
};

export default SingleUserPage;
