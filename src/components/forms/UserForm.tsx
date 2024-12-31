"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserRole } from "@prisma/client";

// Form validation schema
const formSchema = z.object({
    name: z.string()
        .min(3, { message: "Kullanıcı Adı min 3 karakter uzunluğunda olmalı!" })
        .max(20, { message: "Kullanıcı Adı maks 20 karakter uzunluğunda olmalı!" }),
    email: z.string()
        .min(1, { message: "Email adresi zorunludur" })
        .email({ message: "Geçerli bir email adresi giriniz (örnek: kullanici@domain.com)" }),
    password: z.string()
        .min(8, { message: "Şifre en az 8 karakter uzunluğunda olmalı!" })
        .optional()
        .or(z.literal('')),
    bloodType: z.enum(["ARhP", "ARhN", "BRhP", "BRhN", "ABRhP", "ABRhN", "ORhP", "ORhN"])
        .optional(),
    birthday: z.string()
        .optional(),
    sex: z.enum(["Erkek", "Kadin", "Diger"])
        .optional(),
    phone: z.string()
        .refine((val) => {
            if (!val) return true;  // boş bırakılabilir
            const phoneRegex = /^[0-9]{10}$/;
            return phoneRegex.test(val.replace(/\s/g, ''));
        }, {
            message: "Telefon numarası 10 haneli olmalı ve sadece rakam içermelidir"
        }),
    photo: z.any().optional(),
    institutionId: z.string().min(1, { message: "Kurum seçimi zorunludur!" }),
    roleId: z.string().min(1, { message: "Rol seçimi zorunludur!" }),
});

type FormInputs = z.infer<typeof formSchema>;

interface UserFormProps {
    type: "create" | "update";
    data?: any;
}

const UserForm = ({ type, data }: UserFormProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [institutions, setInstitutions] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch
    } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: data?.name || "",
            email: data?.email || "",
            bloodType: data?.bloodType || undefined,
            birthday: data?.birthday ? new Date(data.birthday).toISOString().split('T')[0] : undefined,
            sex: data?.sex || undefined,
            phone: data?.phone || "",
            institutionId: data?.institutionId || "",
            roleId: data?.role || "", // API'den role olarak geliyor
        }
    });

    // Kurumları yükle
    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const response = await fetch('/api/institutions');
                if (!response.ok) throw new Error('Kurumlar yüklenemedi');
                const data = await response.json();
                setInstitutions(data);
            } catch (error) {
                console.error('Kurumlar yüklenirken hata:', error);
            }
        };

        fetchInstitutions();
    }, []);

    // Form submit handler
    const onSubmit = async (formData: FormInputs) => {
        try {
            setLoading(true);
            console.log("Form Submit Started - Data:", formData);
    
            const submitData = new FormData();
            
            // Append only non-empty values to FormData
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (value instanceof File) {
                        submitData.append(key, value);
                    } else {
                        submitData.append(key, String(value));
                    }
                }
            });
    
            // Debug FormData content with Array.from
            Array.from(submitData.entries()).forEach(([key, value]) => {
                console.log(key + ': ' + value);
            });
    
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
    
            const result = await response.json();
            console.log("API Response:", result);
    
            router.refresh();
            router.push('/list/users');
        } catch (error) {
            console.error('Submit Error:', error);
            alert(type === "create" ? 
                'Kullanıcı kaydı sırasında bir hata oluştu!' : 
                'Kullanıcı güncelleme sırasında bir hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    // Handle photo preview
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form className="flex flex-col gap-4 max-w-7xl mx-auto w-full" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Yeni Kullanıcı Oluştur" : "Kullanıcı Düzenle"}
            </h1>

            {/* Kimlik Bilgileri */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-gray-500">Kimlik Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Ad Soyad</label>
                        <input
                            type="text"
                            {...register("name")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        />
                        {errors?.name && (
                            <span className="text-xs text-red-500">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Email</label>
                        <input
                            type="email"
                            {...register("email")}
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
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                            placeholder={type === "update" ? "Değiştirmek için yeni şifre girin" : "Şifre girin"}
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
                        <label className="text-xs text-gray-500">Kan Grubu</label>
                        <select
                            {...register("bloodType")}
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
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                            placeholder="5XX XXX XX XX"
                        />
                        {errors?.phone && (
                            <span className="text-xs text-red-500">{errors.phone.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Kurum ve Rol Bilgileri */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-gray-500">Kurum ve Rol Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Kurum</label>
                        <select
                            {...register("institutionId")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            <option value="">Kurum Seçiniz</option>
                            {institutions.map((institution) => (
                                <option key={institution.id} value={institution.id}>
                                    {institution.name}
                                </option>
                            ))}
                        </select>
                        {errors?.institutionId && (
                            <span className="text-xs text-red-500">{errors.institutionId.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Rol</label>
                        <select
                            {...register("roleId")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            <option value="">Rol Seçiniz</option>
                            {Object.values(UserRole).map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        {errors?.roleId && (
                            <span className="text-xs text-red-500">{errors.roleId.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Fotoğraf Yükleme */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-gray-500">Fotoğraf</h2>
                <div className="flex flex-col gap-2">
                    <label 
                        className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" 
                        htmlFor="photo"
                    >
                        <Image 
                            src="/upload.png" 
                            alt="Upload" 
                            width={28} 
                            height={28} 
                        />
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