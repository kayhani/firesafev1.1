// Bu kullanıcı oluşturma/güncelleme formu için detaylı döküm:
// API Endpoints:
// /api/users - Kullanıcı oluşturma endpoint'i (POST)
// /api/users/${id} - Kullanıcı güncelleme endpoint'i (PUT)

// Özel Componentler:
// InputField - Form inputları için temel input bileşeni
// RoleSelect - Rol seçimi için dropdown bileşeni
// InstitutionSelect - Kurum seçimi için dropdown bileşeni


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelect from "@/components/RoleSelect";
import InstitutionSelect from "@/components/InstitutionSelect";

const schema = z.object({
  userName: z.string()
    .min(3, { message: "Kullanıcı Adı min 3 karakter uzunluğunda olmalı!" })
    .max(20, { message: "Kullanıcı Adı maks 20 karakter uzunluğunda olmalı!" }),
  email: z.string()
    .min(1, { message: "Email adresi zorunludur" })
    .email({ message: "Geçerli bir email adresi giriniz (örnek: kullanici@domain.com)" }),
  password: z.string()
    .min(8, { message: "Şifre en az 8 karakter uzunluğunda olmalı!" }),
  firstName: z.string().min(1, { message: "Ad alanı zorunludur" }),  // required olarak değiştirildi
  lastName: z.string().min(1, { message: "Soyad alanı zorunludur" }),  // required olarak değiştirildi
  bloodType: z.enum(["ARhP", "ARhN", "BRhP", "BRhN", "ABRhP", "ABRhN", "ORhP", "ORhN"]).optional(),
  birthday: z.string().optional(),
  sex: z.enum(["Erkek", "Kadin", "Diger"]).optional(),
  phone: z.string()
    .refine((val) => {
        if (!val) return true;  // boş bırakılabilir
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(val.replace(/\s/g, ''));
    }, {
        message: "Telefon numarası 10 haneli olmalı ve sadece rakam içermelidir"
    }),
  photo: z.any().optional(),  // File validation'ı kaldırıldı
  institutionId: z.string().min(1, { message: "Kurum seçimi zorunludur!" }),
  roleId: z.string().min(1, { message: "Rol seçimi zorunludur!" }),
}).refine((data) => {
  // Ek validation kuralları ekleyebiliriz
  return true;
}, {
  message: "Form validation hatası"
});

type Inputs = z.infer<typeof schema>;

const UserForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue, // bunu ekledik
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  // Form değerlerini ayarlamak için useEffect
useEffect(() => {
    if (data) {
      setValue('institutionId', data.institutionId);
      setValue('roleId', data.roleId);
      
      // Diğer alanları da setValue ile ayarlayalım ki tutarlı olsun
      setValue('userName', data.userName);
      setValue('email', data.email);
      setValue('firstName', data.firstName);
      setValue('lastName', data.lastName);
      setValue('bloodType', data.bloodType);
      setValue('birthday', data.birthday);
      setValue('sex', data.sex);
      setValue('phone', data.phone);
    }
  }, [data, setValue]);
  

  // Form submit öncesi validation hatalarını görelim
  const onSubmit = async (formData: Inputs) => {
    console.log("Form Submit Started");
    console.log("Form Data:", formData);
    console.log("Form Errors:", errors);

    try {

        console.log("Form verileri:", formData);
        console.log("Telefon:", formData.phone);

        setLoading(true);
    
        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value instanceof File) {
            submitData.append(key, value);
          } else if (value !== undefined && value !== null) {
            submitData.append(key, String(value));
          }
        });

        const validationResult = schema.safeParse(formData);
        if (!validationResult.success) {
            console.error("Validation hatası:", validationResult.error);
            throw new Error("Form validation hatası");
        }
    
        // Update durumunda farklı endpoint ve method kullan
        const url = type === "create" ? '/api/users' : `/api/users/${data.id}`;
        const method = type === "create" ? 'POST' : 'PUT';
    
        const response = await fetch(url, {
          method,
          body: submitData,
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('İşlem başarısız oldu: ' + errorText);
        }
    
        router.refresh();
        router.push('/list/users');
      } catch (error) {
        console.error('Submit Error:', error);
        alert(type === "create" ? 'Kullanıcı kaydı sırasında bir hata oluştu!' : 'Kullanıcı güncelleme sırasında bir hata oluştu!');
      } finally {
        setLoading(false);
      }
    };

  // handleSubmit'in çalışıp çalışmadığını kontrol edelim
  console.log("Form Component Rendered");


  return (
    <form className="flex flex-col gap-4 max-w-7xl mx-auto w-full" onSubmit={handleSubmit(onSubmit)}>
    <h1 className="text-xl font-semibold">Kullanıcı Oluştur</h1>

    {/* Kimlik Doğrulama Bilgileri */}
    <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Kimlik Doğrulama Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Kullanıcı Adı</label>
                <input
                    type="text"
                    {...register("userName")}
                    defaultValue={data?.userName}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.userName && (
                    <span className="text-xs text-red-500">{errors.userName.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Email</label>
                <input
                    type="email"
                    {...register("email")}
                    defaultValue={data?.email}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.email && (
                    <span className="text-xs text-red-500">{errors.email.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Şifre</label>
                <input
                    type="password"
                    {...register("password")}
                    defaultValue={data?.password}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.password && (
                    <span className="text-xs text-red-500">{errors.password.message}</span>
                )}
            </div>
        </div>
    </div>

    {/* Kişisel Bilgiler */}
    <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Kişisel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Adı</label>
                <input
                    type="text"
                    {...register("firstName")}
                    defaultValue={data?.firstName}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.firstName && (
                    <span className="text-xs text-red-500">{errors.firstName.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Soyadı</label>
                <input
                    type="text"
                    {...register("lastName")}
                    defaultValue={data?.lastName}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.lastName && (
                    <span className="text-xs text-red-500">{errors.lastName.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Kan Grubu</label>
                <select
                    {...register("bloodType")}
                    defaultValue={data?.bloodType}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                >
                    <option value="">Seçiniz</option>
                    <option value="ARhP">A Rh Pozitif (A+)</option>
                    <option value="ARhN">A Rh Negatif (A-)</option>
                    <option value="BRhP">B Rh Pozitif (B+)</option>
                    <option value="BRhN">B Rh Negatif (B-)</option>
                    <option value="ABRhP">AB Rh Pozitif (AB+)</option>
                    <option value="ABRhN">AB Rh Negatif (AB-)</option>
                    <option value="ORhP">0 Rh Pozitif (0+)</option>
                    <option value="ORhN">0 Rh Negatif (0-)</option>
                </select>
                {errors?.bloodType && (
                    <span className="text-xs text-red-500">{errors.bloodType.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Doğum Tarihi</label>
                <input
                    type="date"
                    {...register("birthday")}
                    defaultValue={data?.birthday}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.birthday && (
                    <span className="text-xs text-red-500">{errors.birthday.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Cinsiyet</label>
                <select
                    {...register("sex")}
                    defaultValue={data?.sex}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                >
                    <option value="">Seçiniz</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadin">Kadın</option>
                    <option value="Diger">Diğer</option>
                </select>
                {errors?.sex && (
                    <span className="text-xs text-red-500">{errors.sex.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Telefon</label>
                <input
                    type="text"
                    {...register("phone")}
                    defaultValue={data?.phone}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                />
                {errors?.phone && (
                    <span className="text-xs text-red-500">{errors.phone.message}</span>
                )}
            </div>
        </div>
    </div>

    {/* Kurum ve Rol Bilgileri */}
    {/* Kurum ve Rol Bilgileri */}
<div className="space-y-4">
    <h2 className="text-sm font-medium text-gray-500">Kurum ve Rol Bilgileri</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
            <InstitutionSelect 
                label="Kurum"
                name="institutionId"
                register={register}
                error={errors.institutionId}
                defaultValue={data?.institutionId}
            />
        </div>

        <div className="flex flex-col gap-2">
            <RoleSelect 
                register={register}
                error={errors.roleId}
                defaultValue={data?.roleId}
            />
        </div>
    </div>
</div>

    {/* Fotoğraf Yükleme */}
    <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Fotoğraf</h2>
        <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" htmlFor="photo">
                <Image src="/upload.png" alt="" width={28} height={28} />
                <span>Fotoğraf Yükle</span>
            </label>
            <input
                id="photo"
                type="file"
                accept="image/*"
                {...register("photo")}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        // File handling logic
                    }
                }}
            />
        </div>
    </div>

    <button 
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors disabled:opacity-50 mt-4"
    >
        {loading ? "Kaydediliyor..." : type === "create" ? "Oluştur" : "Güncelle"}
    </button>
</form>
  );
};

export default UserForm;