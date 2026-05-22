export const convertEstToBrt = (timeStr: string): string => {
  if (!timeStr) return '';
  const cleanStr = timeStr.trim();

  // Handle range: '20:00 - 23:00' or '20:00 - 23:00 EST'
  const rangeMatch = cleanStr.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})(?:\s+EST)?\s*$/i);
  if (rangeMatch) {
    const startH = parseInt(rangeMatch[1], 10);
    const startM = rangeMatch[2];
    const endH = parseInt(rangeMatch[3], 10);
    const endM = rangeMatch[4];
    const startBrtH = (startH + 1) % 24;
    const endBrtH = (endH + 1) % 24;
    return `${startBrtH.toString().padStart(2, '0')}:${startM} - ${endBrtH.toString().padStart(2, '0')}:${endM} BRT`;
  }

  // Handle single time, e.g., '20:00' or '20:00 EST'
  const match = cleanStr.replace(/\s*EST/gi, '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;

  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  const brtHours = (hours + 1) % 24;
  return `${brtHours.toString().padStart(2, '0')}:${minutes} BRT`;
};
