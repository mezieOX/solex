/**
 * Utility function to get Nigerian bank logo URL from bank code or name
 * Uses the nigerian-bank-icons package data
 */

import banksData from "nigerian-bank-icons/assets/banks.json";

interface BankData {
  name: string;
  slug: string;
  code: string;
  ussd: string;
  logo: string;
}

// Create a map for quick lookup by code
const bankCodeMap = new Map<string, string>();
const bankNameMap = new Map<string, string>();

// Initialize maps from the banks data
(banksData as BankData[]).forEach((bank) => {
  bankCodeMap.set(bank.code, bank.logo);
  bankNameMap.set(bank.name.toLowerCase(), bank.logo);

  // Also add common variations of bank names
  const nameVariations = [
    bank.name.toLowerCase(),
    bank.name.toLowerCase().replace(/\s+/g, "-"),
    bank.name.toLowerCase().replace(/\s+/g, ""),
  ];

  nameVariations.forEach((variation) => {
    bankNameMap.set(variation, bank.logo);
  });
});

/**
 * Get bank logo URL by bank code
 * @param bankCode - The bank code (e.g., "044", "058")
 * @returns The logo URL or null if not found
 */
export function getBankLogoByCode(bankCode: string): string | null {
  return bankCodeMap.get(bankCode) || null;
}

/**
 * Get bank logo URL by bank name
 * @param bankName - The bank name (e.g., "Access Bank", "GTBank")
 * @returns The logo URL or null if not found
 */
export function getBankLogoByName(bankName: string): string | null {
  const normalizedName = bankName.toLowerCase().trim();

  // Try exact match first
  let logo = bankNameMap.get(normalizedName);
  if (logo) return logo;

  // Try partial matches for common bank name patterns
  for (const [name, url] of bankNameMap.entries()) {
    if (normalizedName.includes(name) || name.includes(normalizedName)) {
      return url;
    }
  }

  // Try matching by common keywords
  if (normalizedName.includes("access")) {
    return bankCodeMap.get("044") || null;
  }
  if (
    normalizedName.includes("first bank") ||
    normalizedName.includes("firstbank")
  ) {
    return bankCodeMap.get("011") || null;
  }
  if (
    normalizedName.includes("gtb") ||
    normalizedName.includes("guaranty trust")
  ) {
    return bankCodeMap.get("058") || null;
  }
  if (normalizedName.includes("zenith")) {
    return bankCodeMap.get("057") || null;
  }
  if (
    normalizedName.includes("uba") ||
    normalizedName.includes("united bank")
  ) {
    return bankCodeMap.get("033") || null;
  }
  if (normalizedName.includes("fidelity")) {
    return bankCodeMap.get("070") || null;
  }
  if (
    normalizedName.includes("fcmb") ||
    normalizedName.includes("first city")
  ) {
    return bankCodeMap.get("214") || null;
  }
  if (normalizedName.includes("sterling")) {
    return bankCodeMap.get("232") || null;
  }
  if (normalizedName.includes("union bank")) {
    return bankCodeMap.get("032") || null;
  }
  if (normalizedName.includes("wema")) {
    return bankCodeMap.get("035") || null;
  }
  if (normalizedName.includes("stanbic")) {
    return bankCodeMap.get("221") || null;
  }

  return null;
}

/**
 * Get bank logo URL by bank code or name (tries both)
 * @param bankCode - The bank code
 * @param bankName - The bank name (optional, used as fallback)
 * @returns The logo URL or null if not found
 */
export function getBankLogo(
  bankCode?: string,
  bankName?: string
): string | null {
  if (bankCode) {
    const logo = getBankLogoByCode(bankCode);
    if (logo) return logo;
  }

  if (bankName) {
    const logo = getBankLogoByName(bankName);
    if (logo) return logo;
  }

  return null;
}
