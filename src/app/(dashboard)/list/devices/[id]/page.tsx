import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
//import Performance from "@/components/Performance";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import {
  Institutions,
  User,
  DeviceFeatures,
  Devices,
  DeviceTypes,
  IsgMembers,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleDevicePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const deviceId = id; // veya Number(id);
  const device:
    | (Devices & {
        type: DeviceTypes;
        feature: DeviceFeatures;
        owner: User;
        ownerIns: Institutions;
        provider: User;
        providerIns: Institutions;
        isgMember: IsgMembers;
      })
    | null = await prisma.devices.findUnique({
    where: { id: deviceId },
    include: {
      type: true, // Bu kısmı ekleyerek `role` ilişkisini dahil ediyoruz
      feature: true,
      owner: true,
      ownerIns: true,
      provider: true,
      providerIns: true,
      isgMember: true,
    },
  });

  if (!device) {
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
                src={device.photo || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
              <br></br>
              <Image
                src="/qrcode1.png"
                alt=""
                width={144}
                height={144}
                className="w-24 h-24 object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  Yangın Güvenlik Önlemi Kartı
                </h1>
                {role === "admin" && (
  <FormModal
    table="device"
    type="update"
    id={device.id}  // id prop'unu ekleyelim
    data={{
      id: device.id,
      ownerId: device.ownerId,
      ownerInstId: device.ownerInstId,
      serialNumber: device.serialNumber,
      typeId: device.typeId,
      featureId: device.featureId,
      productionDate: new Date(device.productionDate).toISOString().split('T')[0],
      lastControlDate: new Date(device.lastControlDate).toISOString().split('T')[0],
      expirationDate: new Date(device.expirationDate).toISOString().split('T')[0],
      nextControlDate: new Date(device.nextControlDate).toISOString().split('T')[0],
      location: device.location,
      currentStatus: device.currentStatus,
      providerInstId: device.providerInstId,
      providerId: device.providerId,
      isgMemberId: device.isgMemberId,
      details: device.details || "",
      photo: device.photo || ""
    }}
  />
)}
              </div>
              <p className="text-sm text-gray-500">{device.details}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  {/* <Image src="/blood.png" alt="" width={14} height={14} /> */}
                  <span>{device.serialNumber}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image
                    src="/black-fire-extinguisher.png"
                    alt=""
                    width={14}
                    height={14}
                  />
                  <span>Türü: {device.type.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/feature.png" alt="" width={14} height={14} />
                  <span> Özelliği: {device.feature.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image
                    src="/insititution.png"
                    alt=""
                    width={14}
                    height={14}
                  />
                  <span>Sahibi: {device.ownerIns.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/address.png" alt="" width={14} height={14} />
                  <span> Adresi: {device.ownerIns.address}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/person.png" alt="" width={14} height={14} />
                  <span>
                    Sorumlu Personel:{" "}
                    {device.owner.name}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/location.png" alt="" width={14} height={14} />
                  <span>Konumu: {device.location}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  {/* <Image src="/location.png" alt="" width={14} height={14} /> */}
                  <span>İSG Sorumlusu: {device.isgMember.name}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  {/* <Image src="/location.png" alt="" width={14} height={14} /> */}
                  <span>Sorumlu Kurum: {device.providerIns.name}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  {/* <Image src="/location.png" alt="" width={14} height={14} /> */}
                  <span>
                    Bakım Sorumlusu:{" "}
                    {device.provider.name}{" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            {/* <div className="bg-lamaSkyLight p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]"> */}
            {/* <div className="bg-lamaPurpleLight p-4 rounded-md w-full xl:w-2/5 flex flex-col gap-4">

              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-md font-semibold">Sorumlu Personel</h1>
                <span className="text-sm text-gray-400">Ahmet Aydemir</span>
              </div>
            </div> */}
            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              {/* <div className="bg-lamaPurpleLight p-4 rounded-md w-full xl:w-2/5 flex flex-col gap-4"> */}

              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Üretim Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {device.productionDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-lamaYellow p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              {/* <div className="bg-lamaPurpleLight p-4 rounded-md w-full xl:w-2/5 flex flex-col gap-4"> */}

              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Son Kullanma Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {device.expirationDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              {/* <div className="bg-lamaPurpleLight p-4 rounded-md w-full xl:w-2/5 flex flex-col gap-4"> */}

              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Son Bakım Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {device.lastControlDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* CARD */}
            <div className="bg-lamaYellow  p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              {/* <div className="bg-lamaPurpleLight p-4 rounded-md w-full xl:w-2/5 flex flex-col gap-4"> */}

              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Sonraki Bakım Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {device.nextControlDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              {/* <div className="bg-lamaPurpleLight p-4 rounded-md w-full xl:w-2/5 flex flex-col gap-4"> */}

              <Image
                src="/smc-status.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Durumu</h1>
                <span className="text-sm text-gray-400">
                  {device.currentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1 className="text-xl font-semibold">Cihaz Bakım Takvimi</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Kısayollar</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-black-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/maintenances?deviceId=${device.id}`}
            >
              Cihaz&apos;ın Bakım Geçmişi
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurple"
              href={`/list/notifications?deviceId=${device.id}`}
            >
              Cihazla İlgili Bildirimleri
            </Link>

            {/* <Link className="p-3 rounded-md bg-lamaPurple" href={`/list/pnotifications?deviceId=${device.id}`}>
              Cihazla İlgili Servis Sağlayıcı Bildirimleri
            </Link> */}
            {/* <Link className="p-3 rounded-md bg-lamaYellowLight" href="/">
            Kullanıcı&apos;nın Cihazları
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href="/">
            Kullanıcı&apos;nın Bildirimleri
            </Link>
            <Link className="p-3 rounded-md bg-lamaSkyLight" href="/">
              Hizmet Sağlayıcılarım / Müşterilerim
            </Link> */}
          </div>
        </div>
        {/* <Performance /> */}
        <Announcements />
      </div>
    </div>
  );
};

export default SingleDevicePage;
