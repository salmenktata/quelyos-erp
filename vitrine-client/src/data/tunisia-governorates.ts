export type ShippingZone = 'grand-tunis' | 'nord' | 'centre' | 'sud';

export interface Governorate {
  code: string;
  name: string;
  zone: ShippingZone;
}

export interface ShippingZoneInfo {
  code: ShippingZone;
  label: string;
  defaultPrice: number;
}

export const SHIPPING_ZONES: ShippingZoneInfo[] = [
  { code: 'grand-tunis', label: 'Grand Tunis', defaultPrice: 7 },
  { code: 'nord', label: 'Nord', defaultPrice: 9 },
  { code: 'centre', label: 'Centre', defaultPrice: 9 },
  { code: 'sud', label: 'Sud', defaultPrice: 12 },
];

export const GOVERNORATES: Governorate[] = [
  // Grand Tunis
  { code: 'TUN', name: 'Tunis', zone: 'grand-tunis' },
  { code: 'ARI', name: 'Ariana', zone: 'grand-tunis' },
  { code: 'BEN', name: 'Ben Arous', zone: 'grand-tunis' },
  { code: 'MAN', name: 'Manouba', zone: 'grand-tunis' },
  // Nord
  { code: 'NAB', name: 'Nabeul', zone: 'nord' },
  { code: 'ZAG', name: 'Zaghouan', zone: 'nord' },
  { code: 'BIZ', name: 'Bizerte', zone: 'nord' },
  { code: 'BEJ', name: 'Beja', zone: 'nord' },
  { code: 'JEN', name: 'Jendouba', zone: 'nord' },
  { code: 'KEF', name: 'Le Kef', zone: 'nord' },
  { code: 'SIL', name: 'Siliana', zone: 'nord' },
  // Centre
  { code: 'SOU', name: 'Sousse', zone: 'centre' },
  { code: 'MON', name: 'Monastir', zone: 'centre' },
  { code: 'MAH', name: 'Mahdia', zone: 'centre' },
  { code: 'SFA', name: 'Sfax', zone: 'centre' },
  { code: 'KAI', name: 'Kairouan', zone: 'centre' },
  { code: 'KAS', name: 'Kasserine', zone: 'centre' },
  { code: 'SID', name: 'Sidi Bouzid', zone: 'centre' },
  // Sud
  { code: 'GAB', name: 'Gabes', zone: 'sud' },
  { code: 'MED', name: 'Medenine', zone: 'sud' },
  { code: 'TAT', name: 'Tataouine', zone: 'sud' },
  { code: 'GAF', name: 'Gafsa', zone: 'sud' },
  { code: 'TOZ', name: 'Tozeur', zone: 'sud' },
  { code: 'KEB', name: 'Kebili', zone: 'sud' },
];

export const DEFAULT_FREE_THRESHOLD = 150;

export function getGovernoratesByZone(zone: ShippingZone): Governorate[] {
  return GOVERNORATES.filter((g) => g.zone === zone);
}

export function getGovernorateByCode(code: string): Governorate | undefined {
  return GOVERNORATES.find((g) => g.code === code);
}

export function getZoneInfo(zone: ShippingZone): ShippingZoneInfo | undefined {
  return SHIPPING_ZONES.find((z) => z.code === zone);
}

export function getDefaultShippingPrice(zone: ShippingZone): number {
  const zoneInfo = getZoneInfo(zone);
  return zoneInfo?.defaultPrice ?? 9;
}
