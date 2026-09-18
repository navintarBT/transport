export type Branch = {
  id: string
  name: string
  created_at: string
}

// A parcel arrives from China into a branch and sits there until the
// customer comes and picks it up in person — there is no door delivery.
export type ParcelStatus = 'pending_pickup' | 'picked_up' | 'returned'

export type Parcel = {
  id: string
  tracking_no: string
  branch_id: string
  receiver_name: string
  cost_amount: number
  cod_amount: number
  status: ParcelStatus
  is_damaged: boolean
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
