// components/RoleSelect.tsx
"use client";

import { useEffect, useState } from "react";

interface Role {
  id: string;
  name: string;
}

interface RoleSelectProps {
  defaultValue?: string;
  register: any;
  error?: any;
  isLoading?: boolean;
}

const RoleSelect = ({ defaultValue, register, error, isLoading = false }: RoleSelectProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Rol</label>
        <select disabled className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100">
          <option>Yükleniyor...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs text-gray-500">Rol</label>
      <select
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...register("roleId")}
        defaultValue={defaultValue || ""}
      >
        <option value="">Rol Seçiniz</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      {error?.message && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  );
};

export default RoleSelect;