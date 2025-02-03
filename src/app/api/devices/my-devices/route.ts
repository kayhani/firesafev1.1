// app/api/devices/my-devices/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true,
        institutionId: true 
      }
    });

    let devices;

    // Kullanıcı rolüne göre cihazları getir
    switch (currentUser.role) {
      case 'ADMIN':
        devices = await prisma.devices.findMany({
          select: {
            id: true,
            serialNumber: true,
            type: {
              select: {
                name: true
              }
            },
            ownerIns: {
              select: {
                name: true
              }
            }
          }
        });
        break;

      case 'MUSTERI_SEVIYE1':
        devices = await prisma.devices.findMany({
          where: {
            ownerInstId: currentUser.institutionId
          },
          select: {
            id: true,
            serialNumber: true,
            type: {
              select: {
                name: true
              }
            },
            ownerIns: {
              select: {
                name: true
              }
            }
          }
        });
        break;

      case 'MUSTERI_SEVIYE2':
        devices = await prisma.devices.findMany({
          where: {
            ownerId: session.user.id
          },
          select: {
            id: true,
            serialNumber: true,
            type: {
              select: {
                name: true
              }
            },
            ownerIns: {
              select: {
                name: true
              }
            }
          }
        });
        break;

      default:
        devices = [];
    }

    // Cihazları formatla
    const formattedDevices = devices.map(device => ({
      id: device.id,
      serialNumber: device.serialNumber,
      name: `${device.type.name} - ${device.ownerIns.name}`
    }));

    return NextResponse.json(formattedDevices);
    
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}