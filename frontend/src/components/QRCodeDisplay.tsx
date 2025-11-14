import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

interface QRCodeDisplayProps {
  arc: string;
  size?: number;
}

export default function QRCodeDisplay({ arc, size = 200 }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;

    // Get the SVG element
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Load SVG into an image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Convert canvas to PNG and download
      canvas.toBlob(blob => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `consignment-${arc}.png`;
        link.href = pngUrl;
        link.click();
        URL.revokeObjectURL(pngUrl);
      });
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG value={arc} size={size} level="H" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">ARC</p>
        <p className="text-lg font-mono font-semibold text-gray-900">{arc}</p>
      </div>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Download QR Code
      </button>
    </div>
  );
}
