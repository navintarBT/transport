export type Branch = {
  id: string
  name: string
  created_at: string
}

export type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  created_at: string
}

export type ParcelStatus = 'pending' | 'in_transit' | 'delivered' | 'returned'

export type Parcel = {
  id: string
  tracking_no: string
  branch_id: string
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  customer_id: string | null
  weight_kg: number | null
  parcel_type: 'document' | 'general' | 'cold'
  cod_amount: number
  status: ParcelStatus
  created_at: string
  delivered_at: string | null
  branches?: { name: string } | null
}

export type Transaction = {
  id: string
  parcel_id: string | null
  branch_id: string
  type: 'shipping_fee' | 'cod' | 'commission'
  amount: number
  payment_status: 'paid' | 'pending'
  created_at: string
}

export const STATUS_LABEL: Record<ParcelStatus, string> = {
  pending: 'ລໍຖ້ານຳສົ່ງ',
  in_transit: 'ກຳລັງນຳສົ່ງ',
  delivered: 'ນຳສົ່ງສຳເລັດ',
  returned: 'ຕີກັບ',
}

export function formatKip(amount: number) {
  return `${amount.toLocaleString()} ກີບ`
}

export const STATUS_COLOR: Record<ParcelStatus, string> = {
  pending: '#94A3B8',
  in_transit: '#D97706',
  delivered: '#16A34A',
  returned: '#DC2626',
}
