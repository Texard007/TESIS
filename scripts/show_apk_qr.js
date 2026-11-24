const path = require('path');

const apkUrl = 'https://expo.dev/artifacts/eas/yLtNoIB2IxDOvZo-p8Zpvw9P-j1If7WJkhIL12se4Yc.apk';

console.log('======================================================================');
console.log('      INSTALACION DIRECTA DE LA APP EN EL CELULAR (APK ANDROID)');
console.log('======================================================================\n');
console.log(' Escanea este codigo QR con la CAMARA de tu celular o un lector QR:');
console.log(' (Se descargara e instalara directamente la aplicacion sin requerir Expo Go)\n');

try {
  const qrPath = path.join(__dirname, '..', 'frontend', 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'qr');
  const qr = require(qrPath);
  qr.printQRCode(apkUrl).print();
} catch (e) {
  console.log(' [!] URL directa de descarga del APK:\n', apkUrl);
}

console.log('\n----------------------------------------------------------------------');
console.log(' Enlace directo: ' + apkUrl);
console.log('----------------------------------------------------------------------');
console.log(' Instrucciones:');
console.log(' 1. Escanea el codigo QR de arriba con la camara de tu celular Android.');
console.log(' 2. Toca el enlace para descargar "adopcion-mascotas.apk".');
console.log(' 3. Abre el archivo descargado y presiona "Instalar".\n');
