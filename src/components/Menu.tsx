import { role } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";


const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Anasayfa",
        href: "/",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
      {
        icon: "/user.png",
        label: "Kullanıcılar",
        href: "/list/users",
        visible: ["admin","provider", "customer", "lowcustomer", "lowprovider"],
      },

      {
        icon: "/user.png",
        label: "Şirketler",
        href: "/list/institutions",
        visible: ["admin","provider", "customer", "lowcustomer", "lowprovider"],
      },



      
      {
        icon: "/fire-extinguisher.png",
        label: "Yangın Güvenlik Önlemleri",
        href: "/list/devices",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
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
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
      {
        icon: "/calendar.png",
        label: "Randevular",
        href: "/list/events",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
      {
        icon: "/announcement.png",
        label: "Bildirimler",
        href: "/list/notifications",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },

      {
        icon: "/report.png",
        label: "Raporlama",
        href: "/list/classes",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
      

      
    ],
  },
  {
    title: "DİĞER",
    items: [
      {
        icon: "/profile.png",
        label: "Profil",
        href: "/profile",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
      {
        icon: "/setting.png",
        label: "Ayarlar",
        href: "/settings",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
      {
        icon: "/support.png",
        label: "Geri Bildirim ve Destek",
        href: "/settings",
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
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
        visible: ["admin", "provider", "customer", "lowcustomer", "lowprovider"],
      },
    ],
  },
];

const Menu = () => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
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
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;

