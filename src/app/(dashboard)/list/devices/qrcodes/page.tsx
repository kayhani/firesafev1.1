'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

const QRCodePrintPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/my-devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Cihazlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    
    // Helvetica fontunu ekleyelim
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    let page = pdfDoc.addPage([595, 842]); // A4 points (72 dpi)
    
    const margin = 30;
    const qrSize = 120;
    const textHeight = 30;
    const spacing = 20;
    
    const itemsPerRow = 4;
    const itemHeight = qrSize + textHeight + spacing;
    const itemWidth = qrSize + spacing;
    
    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      let row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      
      if (row * itemHeight + margin > page.getHeight() - margin) {
        page = pdfDoc.addPage([595, 842]);
        row = 0;
      }

      const x = margin + (col * itemWidth);
      const y = page.getHeight() - (margin + (row * itemHeight) + qrSize);

      // QR kodu oluştur
      const qrDataUrl = await QRCode.toDataURL(`${window.location.origin}/list/devices/${device.id}`, {
        width: qrSize,
        margin: 1
      });
      
      const qrImage = await pdfDoc.embedPng(qrDataUrl);
      
      page.drawImage(qrImage, {
        x,
        y,
        width: qrSize,
        height: qrSize,
      });

      // Türkçe karakterleri ASCII'ye dönüştür
      const serialNumber = device.serialNumber;
      const name = device.name ? convertToASCII(device.name) : '';

      // Metin ekle
      page.drawText(serialNumber, {
        x: x + 5,
        y: y - 15,
        size: 10,
        font: helveticaFont
      });

      page.drawText(name, {
        x: x + 5,
        y: y - 30,
        size: 10,
        font: helveticaFont
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cihaz-qr-kodlari.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Türkçe karakterleri ASCII'ye dönüştürme fonksiyonu
  const convertToASCII = (text) => {
    const turkishChars = {
      'ı': 'i', 'İ': 'I', 'ş': 's', 'Ş': 'S',
      'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
      'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };
    
    return text.replace(/[ıİşŞğĞüÜöÖçÇ]/g, char => turkishChars[char] || char);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cihaz QR Kodları</h1>
        <button
          onClick={generatePDF}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          PDF Olarak İndir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {devices.map((device) => (
          <div 
            key={device.id} 
            className="flex flex-col items-center bg-white p-4 rounded-lg shadow"
          >
            <QRCodeSVG
              value={`${window.location.origin}/list/devices/${device.id}`}
              size={120}
              level="H"
              includeMargin={true}
            />
            <div className="mt-2 text-center">
              <p className="font-medium">{device.serialNumber}</p>
              <p className="text-gray-600">{device.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodePrintPage;