
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const parseDataUrl = (dataUrl: string): { base64: string; mimeType: string } => {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    // Fallback for non-base64 data URLs or other formats, though the app primarily uses base64
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
    if (!mimeType || !base64) {
      throw new Error('Invalid data URL format');
    }
    return { mimeType, base64 };
  }
  const [, mimeType, base64] = match;
  return { mimeType, base64 };
};
