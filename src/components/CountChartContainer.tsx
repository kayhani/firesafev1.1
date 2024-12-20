import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  const data1 = await prisma.users.count({
    where: {
      roleId: {
        in: ["cm4c8rzz1000lakzwdkp23ue4", "cm4c8rzz1000makzwvanl038p"], // roleId'si 4 veya 5 olan kullanıcıları sayısı (1-2 seviye Müşetiriler)
      },
    },
  });

  const data2 = await prisma.users.count({
    where: {
      roleId: {
        in: ["cm4c8rzz1000jakzwuyykyw4h", "cm4c8rzz1000kakzwn9j469ab"], // roleId'si 2 veya 3 olan kullanıcıları sayısı (1-2 seviye Servis Sağlayıcılar)
      },
    },
  });

  console.log(data1);
  console.log(data2);
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Kullanıcılar</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* CHART */}
      <CountChart musteri={data1} ss={data2} />

      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaSky rounded-full" />
          <h1 className="font-bold">{data1}</h1>
          <h2 className="text-xs text-[#000000]-300">
            Müşteri ({Math.round((data1 / (data1 + data2)) * 100)}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaPurple rounded-full" />
          <h1 className="font-bold">{data2}</h1>
          <h2 className="text-xs text-[#000000]-300">
            Servis Sağlayıcı ({Math.round((data2 / (data1 + data2)) * 100)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
