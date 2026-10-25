import { Plant, CartItem } from '../types/nursery';

export const NURSERY_PHONE = '919515369395';
export const NURSERY_NAME = 'Maruthi Nursery';
export const NURSERY_LOCATION = 'Malladi Village, Amaravathi Road, Guntur District, Andhra Pradesh';

/**
 * Generate WhatsApp direct chat link with pre-filled message for a single plant order
 */
export function getPlantOrderWhatsAppUrl(
  plant: Plant,
  quantity = 1,
  customerName = '',
  customerCity = ''
): string {
  const total = plant.price * quantity;
  const lines = [
    `🌿 *Order Inquiry - ${NURSERY_NAME}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Hello! I would like to order this plant from your catalog:`,
    ``,
    `🌱 *Plant:* ${plant.name}`,
    plant.teluguName ? `🍃 *Telugu Name:* ${plant.teluguName}` : '',
    `🏷️ *Category:* ${plant.category}`,
    `📏 *Size:* ${plant.size || 'Standard Nursery Pot'}`,
    `💰 *Price:* ₹${plant.price} each`,
    `📦 *Quantity:* ${quantity}`,
    `💵 *Subtotal:* ₹${total}`,
    ``,
    customerName ? `👤 *Customer Name:* ${customerName}` : '',
    customerCity ? `📍 *Delivery Area:* ${customerCity}` : `📍 *Location Reference:* Malladi / Amaravathi / Guntur`,
    ``,
    `Please confirm availability, healthy sapling condition, and delivery/pickup schedule. Thank you!`,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${NURSERY_PHONE}?text=${text}`;
}

/**
 * Generate WhatsApp checkout link for multiple items in the cart
 */
export function getCartOrderWhatsAppUrl(
  items: CartItem[],
  totalAmount: number,
  customer: {
    name: string;
    phone: string;
    deliveryType: 'store_pickup' | 'home_delivery' | 'bulk_transport';
    address?: string;
    notes?: string;
  }
): string {
  const deliveryLabel =
    customer.deliveryType === 'store_pickup'
      ? 'Self Pickup at Malladi Nursery'
      : customer.deliveryType === 'home_delivery'
      ? 'Home Delivery (Guntur / Amaravathi region)'
      : 'Bulk Farm / Agro Transport';

  const itemLines = items.map((item, idx) => {
    return `${idx + 1}. *${item.plant.name}* (x${item.quantity}) - ₹${item.plant.price * item.quantity}`;
  });

  const lines = [
    `🌿 *New Order - ${NURSERY_NAME}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*Customer Details:*`,
    `👤 *Name:* ${customer.name}`,
    `📞 *Phone:* ${customer.phone}`,
    `🚚 *Order Type:* ${deliveryLabel}`,
    customer.address ? `🏠 *Address:* ${customer.address}` : '',
    customer.notes ? `📝 *Special Note:* ${customer.notes}` : '',
    ``,
    `*Selected Plants:*`,
    ...itemLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total Amount:* ₹${totalAmount}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Please confirm the order and arrange dispatch/pickup time from Malladi Village, Amaravathi Road.`,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${NURSERY_PHONE}?text=${text}`;
}

/**
 * Generate general consultation WhatsApp link
 */
export function getGeneralWhatsAppUrl(subject = 'Plant Availability & Nursery Visit'): string {
  const text = encodeURIComponent(
    `Hello ${NURSERY_NAME}! 🌿\nI am contacting you regarding: ${subject}.\nI would like to know more about your plants and visit Malladi Village on Amaravathi Road.`
  );
  return `https://wa.me/${NURSERY_PHONE}?text=${text}`;
}
