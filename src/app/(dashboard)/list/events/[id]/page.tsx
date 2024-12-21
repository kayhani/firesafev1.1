import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
//import Performance from "@/components/Performance";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { Appointments, Institutions, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleEventPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const eventId = id; // veya Number(id);
  const event:
    | (Appointments & {
      creator: User;
      creatorIns: Institutions;
      recipient: User;
      recipientIns: Institutions;
    })
    | null = await prisma.appointments.findUnique({
      where: { id: eventId },
      include: {
        creator: true,
        creatorIns: true,
        recipient: true,
        recipientIns: true,
      },
    });

  if (!event) {
    return notFound();
  }
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          {/* USER INFO CARD */}
          <div className="bg-lamaPurpleLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-full flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Randevu Kartı</h1>
                {role === "admin" && (
                  <FormModal
                    table="event"
                    type="update"
                    data={{
                      id: event.id,
                      creatorId: event.creator.id,
                      creatorInsId: event.creatorIns.id,
                      recipientId: event.recipient.id,
                      recipientInsId: event.recipientIns.id,
                      title: event.tittle,
                      content: event.content,
                      start: new Date(event.start).toISOString().slice(0, 16),
                      end: new Date(event.end).toISOString().slice(0, 16)
                    }}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Randevu Verilen Kurum:</span>
                <span className="text-sm text-gray-500">{event.recipientIns.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Randevu Verilen Kişi:</span>
                <span className="text-sm text-gray-500">{event.recipient.firstName + " " + event.recipient.lastName}</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Başlangıç Tarihi:</span>
                  <span>{event.start.toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span className="text-gray-600">Bitiş Tarihi:</span>
                  <span>{event.end.toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <span className="text-gray-600">Randevu No:</span>
                  <span>{event.id}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <span className="text-gray-600">Açıklama:</span>
                  <span>{event.content}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{event.recipientIns.phone}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{event.recipientIns.email}</span>
                </div>

                <div className="w-full md:w-1/3 lg:w-full 2xl:w-2/3 flex items-center gap-2">
                  <Image src="/address.png" alt="" width={14} height={14} />
                  <span>{event.recipientIns.address}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-customer.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-12"
              />
              <div className="">
                <h1 className="text-md font-semibold">Oluşturan Personel</h1>
                <span className="text-sm text-gray-400">{event.creator.id}</span>
                <br></br>
                <span className="text-sm text-gray-400">
                  {event.creator.firstName + " " + event.creator.lastName}
                </span>
                <br></br>
                <span className="text-sm text-gray-400">{event.creatorIns.name}</span>
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
                <h1 className="text-md font-semibold">Randevu Başlangıç Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {event.start.toLocaleDateString()}
                </span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-lamaSky p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[100%]">
              <Image
                src="/smc-calendar.png"
                alt=""
                width={96}
                height={96}
                className="w-10 h-10"
              />
              <div className="">
                <h1 className="text-md font-semibold">Randevu Bitiş Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {event.end.toLocaleDateString()}
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
                <h1 className="text-md font-semibold">Randevu Oluşturma Tarihi</h1>
                <span className="text-sm text-gray-400">
                  {event.create.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleEventPage;