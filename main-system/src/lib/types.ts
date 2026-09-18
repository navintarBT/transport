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

// A parcel arrives from China into a branch and sits there until the
// customer comes and picks it up in person — there is no door delivery.
export type ParcelStatus = 'pending_pickup' | 'picked_up' | 'returned'

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
  cost_amount: number
  cod_amount: number
  status: ParcelStatus
  is_damaged: boolean
  damage_note: string | null
  created_at: string
  picked_up_at: string | null
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
  pending_pickup: 'ລໍຖ້າລູກຄ້າມາຮັບ',
  picked_up: 'ລູກຄ້າຮັບແລ້ວ',
  returned: 'ສົ່ງກັບຄືນ',
}

export function formatKip(amount: number) {
  return `${amount.toLocaleString()} ກີບ`
}

export const STATUS_COLOR: Record<ParcelStatus, string> = {
  pending_pickup: '#D97706',
  picked_up: '#16A34A',
  returned: '#DC2626',
}
