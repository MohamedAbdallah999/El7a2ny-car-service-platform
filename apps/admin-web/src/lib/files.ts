export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.readAsDataURL(file);
  });

export function validateImageFile(file: File): string | null {
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    return "Choose a PNG or JPG image.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "The image must be 5 MB or smaller.";
  }
  return null;
}
