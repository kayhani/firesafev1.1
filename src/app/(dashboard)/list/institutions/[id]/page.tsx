import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
//import Performance from "@/components/Performance";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { Institutions } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleInstitutionPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const instId = id; // veya Number(id);
  const inst: Institutions | null = await prisma.institutions.findUnique({
    where: { id: instId },
  });

  if (!inst) {
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
            {/* <div className="w-1/3">
              <Image
                src="/firat.jpg"
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div> */}
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Kurum Kartı</h1>
                {role === "admin" && (
                  <FormModal
                    table="institution"  // "user" yerine "institution" olarak değiştir
                    type="update"
                    data={{
                      id: inst.id,
                      name: inst.name,
                      address: inst.address,
                      email: inst.email,
                      phone: inst.phone,
                      registrationDate: inst.registrationDate.toISOString().split('T')[0],
                    }}
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
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            {/* <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]"> */}
            {/* <Image
                src="/smc-role.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              /> */}
            {/* <div className="">
                <h1 className="text-md font-semibold">Rolü</h1>
                <span className="text-sm text-gray-400">Admin</span>
              </div> */}
            {/* </div> */}
            {/* CARD */}
            {/* <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]"> */}
            {/* <Image
                src="/smc-sex.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Cinsiyet</h1>
                <span className="text-sm text-gray-400">Erkek</span>
              </div> */}
            {/* </div> */}
            {/* CARD */}
            {/* <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]"> */}
            {/* <Image
                src="/smc-company.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-12"
              />
              <div className="">
                <h1 className="text-md font-semibold">Kurumu</h1>
                <span className="text-sm text-gray-400">Ege Üniversitesi</span>
              </div> */}
            {/* </div> */}
            {/* CARD */}
            {/* <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]"> */}
            {/* <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Üyelik Tarihi</h1>
                <span className="text-sm text-gray-400">10/06/2024</span>
              </div> */}
            {/* </div> */}
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1 className="text-xl font-semibold">Kurum Takvimi</h1>
          <BigCalendar institutionId={inst.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Kısayollar</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-black-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/users?institutionId=${inst.id}`}
            >
              {/* Kullanıcı&apos;nın  */}
              Personellerim
            </Link>

            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/api/offers?recipientInstId=${inst.id}&creatorInstId=${inst.id}`}
            >
              {/* Kullanıcı&apos;nın  */}
              Tekliflerim
            </Link>

            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/devices?ownerInstId=${inst.id}`}
            >
              {/* Kullanıcı&apos;nın  */}
              Cihazlarım
            </Link>

            <Link
              className="p-3 rounded-md bg-lamaPurple"
              href={`/list/maintenances?customerInsId=${inst.id}`}
            >
              {/* Kullanıcı&apos;nın  */}
              Bakımlarım
            </Link>

            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/notifications?recipientInsId=${inst.id}`}
            >
              {/* Kullanıcı&apos;nın  */}
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
        {/* <Performance /> */}
        <Announcements />
      </div>
    </div>
  );
};

export default SingleInstitutionPage;
