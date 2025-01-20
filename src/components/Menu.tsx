import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

// Role mapping yardımcı fonksiyonu
const mapRolesToUserRoles = (roles: string[]): UserRole[] => {
  const roleMap: { [key: string]: UserRole } = {
    admin: UserRole.ADMIN,
    guest: UserRole.GUEST,
    provider: UserRole.HIZMETSAGLAYICI_SEVIYE1,
    lowprovider: UserRole.HIZMETSAGLAYICI_SEVIYE2,
    customer: UserRole.MUSTERI_SEVIYE1,
    lowcustomer: UserRole.MUSTERI_SEVIYE2,
  };

  return roles
    .map((role) => roleMap[role])
    .filter((role) => role !== undefined);
};

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Anasayfa",
        href: "/",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/user.png",
        label: "Kullanıcılar",
        href: "/list/users",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/user.png",
        label: "Kurumlar",
        href: "/list/institutions",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/fire-extinguisher.png",
        label: "Yangın Güvenlik Önlemleri",
        href: "/list/devices",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/offer.png",
        label: "Teklif Talepleri",
        href: "/list/offerRequests",
        visible: ["admin", "provider", "customer"],
      },
      {
        icon: "/offer.png",
        label: "Teklifler",
        href: "/list/offers",
        visible: ["admin", "provider", "customer"],
      },
      {
        icon: "/maintenance.png",
        label: "Bakımlar",
        href: "/list/maintenances",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/calendar.png",
        label: "Randevular",
        href: "/list/events",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/announcement.png",
        label: "Bildirimler",
        href: "/list/notifications",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/report.png",
        label: "Raporlama",
        href: "/list/classes",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
    ],
  },
  {
    title: "DİĞER",
    items: [
      {
        icon: "/profile.png",
        label: "Profil",
        href: "/list/users",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/setting.png",
        label: "Ayarlar",
        href: "/settings",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/support.png",
        label: "Geri Bildirim ve Destek",
        href: "/settings",
        visible: [
          "admin",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
      {
        icon: "/log.png",
        label: "Loglar",
        href: "/list/logs",
        visible: ["admin"],
      },
      {
        icon: "/logout.png",
        label: "Çıkış",
        href: "/logout",
        visible: [
          "admin",
          "guest",
          "provider",
          "customer",
          "lowcustomer",
          "lowprovider",
        ],
      },
    ],
  },
];

const Menu = async () => {
  const session = await auth();
  const currentUserRole = session?.user?.role as UserRole;

  //console.log("Current user role:", currentUserRole);

  // Rol kontrolü için yardımcı fonksiyon
  const isVisible = (allowedRoles: string[]) => {
    const mappedRoles = mapRolesToUserRoles(allowedRoles);

    //console.log("Mapped roles:", mappedRoles);
    //console.log("Is visible:", mappedRoles.includes(currentUserRole));

    return mappedRoles.includes(currentUserRole);
  };

  // Session kontrolü ekleyelim
  if (!session || !currentUserRole) {
    //console.log("No session or role found");
    return null;
  }

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            // Her item için görünürlük kontrolünü logla
            //console.log(`Checking visibility for ${item.label}:`, item.visible);

            if (isVisible(item.visible)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
