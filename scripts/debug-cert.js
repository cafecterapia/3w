const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('EFI Certificate Debug Script');
console.log('============================');

const base64Cert = process.env.EFI_CERTIFICATE_BASE64;
const certPath = process.env.EFI_CERTIFICATE_PATH;
const password = process.env.EFI_CERTIFICATE_PASSWORD;

console.log('Environment checks:');
console.log('- EFI_CERTIFICATE_BASE64:', base64Cert ? 'present' : 'missing');
console.log('- EFI_CERTIFICATE_PATH:', certPath || 'not set');
console.log('- EFI_CERTIFICATE_PASSWORD:', password ? 'present' : 'missing');
console.log(
  '- EFI_CLIENT_ID:',
  process.env.EFI_CLIENT_ID ? 'present' : 'missing'
);
console.log(
  '- EFI_CLIENT_SECRET:',
  process.env.EFI_CLIENT_SECRET ? 'present' : 'missing'
);
console.log(
  '- EFI_PAYEE_CODE:',
  process.env.EFI_PAYEE_CODE ? 'present' : 'missing'
);
console.log();

if (base64Cert) {
  console.log('Testing base64 certificate decoding:');
  try {
    const cleaned = base64Cert.replace(/\s+/g, '');
    const buffer = Buffer.from(cleaned, 'base64');
    console.log('- Base64 decode: SUCCESS');
    console.log('- Certificate size:', buffer.length, 'bytes');

    const firstBytes = buffer.slice(0, 4);
    console.log('- First 4 bytes (hex):', firstBytes.toString('hex'));

    const isPKCS12 = buffer[0] === 0x30 && buffer[1] === 0x82;
    console.log('- Appears to be PKCS#12:', isPKCS12 ? 'YES' : 'NO');

    const tmpPath = path.join(process.cwd(), 'temp-cert-test.p12');
    fs.writeFileSync(tmpPath, buffer);
    console.log('- Temp file written:', tmpPath);
    console.log('- Temp file exists:', fs.existsSync(tmpPath));

    fs.unlinkSync(tmpPath);
    console.log('- Temp file cleanup: SUCCESS');
  } catch (error) {
    console.log('- Base64 decode: FAILED -', error.message);
  }
}

if (certPath && fs.existsSync(certPath)) {
  console.log('Testing certificate file:');
  try {
    const buffer = fs.readFileSync(certPath);
    console.log('- File read: SUCCESS');
    console.log('- File size:', buffer.length, 'bytes');

    const firstBytes = buffer.slice(0, 4);
    console.log('- First 4 bytes (hex):', firstBytes.toString('hex'));

    const isPKCS12 = buffer[0] === 0x30 && buffer[1] === 0x82;
    console.log('- Appears to be PKCS#12:', isPKCS12 ? 'YES' : 'NO');
  } catch (error) {
    console.log('- File read: FAILED -', error.message);
  }
}

console.log('\nNext steps:');
console.log('1. Visit /api/debug/test-auth for comprehensive API testing');
console.log('2. Check if EFI_PAYEE_CODE matches your account identifier');
console.log('3. Verify certificate matches the client credentials');
console.log('4. Ensure production/sandbox environment is correct');
