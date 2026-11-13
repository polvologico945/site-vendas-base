/** Problema: um modelo sem contato configurado não pode levar visitantes a um
 * WhatsApp de exemplo ou a um link quebrado. A mesma validação vale para todas
 * as chamadas e para a conferência final. Data: 2026-11-13. @author Carla Evelyn */
export function whatsappUrl(value: unknown, message?: string): string | null {
  const phone = String(value ?? "").replace(/\D/g, "");
  if (!/^[1-9]\d{9,14}$/.test(phone)) return null;
  const url = new URL(`https://wa.me/${phone}`);
  if (message) url.searchParams.set("text", message);
  return url.href;
}
