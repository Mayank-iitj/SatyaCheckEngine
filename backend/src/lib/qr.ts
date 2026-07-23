import QRCode from "qrcode";
import { config } from "../config";

/**
 * Generate a QR code as a data URL (base64 PNG)
 */
export async function generateQRDataURL(
  credentialHash: string,
  credentialId: string
): Promise<string> {
  const verificationUrl = `${config.appUrl}/verify?hash=${credentialHash}&id=${credentialId}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: "#0B3D45",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  return qrDataUrl;
}

/**
 * Generate a QR code as an SVG string
 */
export async function generateQRSVG(
  credentialHash: string,
  credentialId: string
): Promise<string> {
  const verificationUrl = `${config.appUrl}/verify?hash=${credentialHash}&id=${credentialId}`;

  const svg = await QRCode.toString(verificationUrl, {
    type: "svg",
    width: 400,
    margin: 2,
    color: {
      dark: "#0B3D45",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  return svg;
}

/**
 * Generate the verification URL for a credential
 */
export function getVerificationUrl(
  credentialHash: string,
  credentialId: string
): string {
  return `${config.appUrl}/verify?hash=${credentialHash}&id=${credentialId}`;
}
