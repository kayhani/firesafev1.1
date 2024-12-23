// app/api/offers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ana teklifi oluştur
      const offer = await tx.offerCards.create({
        data: {
          offerDate: new Date(body.offerDate),
          validityDate: new Date(body.validityDate),
          status: body.status || "Beklemede",
          details: body.details,
          paymentTermId: body.paymentTermId,
          creatorId: body.creatorId,
          creatorInsId: body.creatorInsId,
          recipientId: body.recipientId,
          recipientInsId: body.recipientInsId,
        },
      });

      // 2. Alt kalemleri oluştur
      const offerSubPromises = body.offerSub.map((sub: any) =>
        tx.offerSub.create({
          data: {
            servideId: sub.serviceId,
            unitPrice: parseFloat(sub.unitPrice),
            size: parseFloat(sub.size),
            detail: sub.detail,
            offerCardId: offer.id,
          },
        })
      );

      await Promise.all(offerSubPromises);

      // 3. Bildirim oluştur
      const notification = await tx.notifications.create({
        data: {
          content: `Yeni bir teklif aldınız. Teklif detayı: ${body.details}`,
          creatorId: body.creatorId,
          creatorInsId: body.creatorInsId,
          recipientId: body.recipientId,
          recipientInsId: body.recipientInsId,
          notificationDate: new Date(),
          isRead: 'Okunmadi',
          typeId: 'cm4ikqw4e0000fepvq9j26kgb'
        }
      });

      return { offer, notification };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Teklif ve bildirim oluşturma hatası:', error);
    return new NextResponse('Teklif oluşturulurken bir hata oluştu', { status: 500 });
  }
}

export async function GET() {
    try {
      const offers = await prisma.offerCards.findMany({
        include: {
          creator: true,
          creatorIns: true,
          recipient: true,
          recipientIns: true,
          paymentTerm: true,
          OfferSub: {    
            include: {
              service: true
            }
          }
        },
        orderBy: {
          offerDate: 'desc'
        }
      });
  
      return NextResponse.json(offers);
    } catch (error) {
      console.error('Teklifler getirme hatası:', error);
      return new NextResponse('Teklifler alınırken bir hata oluştu', { status: 500 });
    }
  }

  // app/api/offers/route.ts
export async function DELETE(request: Request) {
    try {
      // URL'den id parametresini al
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return new NextResponse("ID parametresi gerekli", { status: 400 });
      }
  
      // İlk olarak teklif var mı kontrol edelim
      const existingOffer = await prisma.offerCards.findUnique({
        where: { id },
        include: { OfferSub: true }
      });
  
      if (!existingOffer) {
        return new NextResponse("Teklif bulunamadı", { status: 404 });
      }
  
      // Transaction ile silme işlemi
      await prisma.$transaction(async (tx) => {
        // 1. Önce alt kalemleri sil
        await tx.offerSub.deleteMany({
          where: {
            offerCardId: id
          }
        });
  
        // 2. Sonra ana teklifi sil
        await tx.offerCards.delete({
          where: {
            id
          }
        });
      });
  
      return new NextResponse(null, { status: 204 });
      
    } catch (error) {
      console.error('Teklif silme hatası:', error);
      return new NextResponse("Teklif silinirken bir hata oluştu", { status: 500 });
    }
  }