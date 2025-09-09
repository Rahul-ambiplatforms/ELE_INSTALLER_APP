
import React, { useRef, useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRCodeScanner({ onScanSuccess }) {
  const scannerRef = useRef(null);
  const [isScannerRunning, setIsScannerRunning] = useState(false);

  const startScanner = () => {
    if (isScannerRunning) {
      console.warn('Scanner is already running.');
      return;
    }

    const onScanSuccessCallback = (decodedText) => {
      console.log(`Scanned Data: ${decodedText}`);
      onScanSuccess(decodedText);
    };

    const onScanFailure = (error) => {
      // console.warn(`Code scan error = ${error}`);
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      'reader',
      { fps: 2, qrbox: { width: 250, height: 250 } },
      false
    );

    html5QrcodeScanner.render(onScanSuccessCallback, onScanFailure);

    scannerRef.current = html5QrcodeScanner;
    setIsScannerRunning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        console.log('QR Code scanner stopped');
      }).catch((err) => {
        console.error('Error stopping QR Code scanner', err);
      });

      const videoElement = document.querySelector('#reader video');
      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }

      setIsScannerRunning(false);
    }
  };

  useEffect(() => {
    startScanner();

    const handleUnload = () => {
      stopScanner();
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      stopScanner();
      window.removeEventListener('unload', handleUnload);
    };
  }, []); // Run this effect only once when the component mounts

  return (
    <div>
      <div id="reader"></div>
    </div>
  );
}

export default QRCodeScanner;
