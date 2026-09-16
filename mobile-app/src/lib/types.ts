export type Branch = {
  id: string
  name: string
  created_at: string
}

export type ParcelStatus = 'pending' | 'in_transit' | 'delivered' | 'returned'

export type Parcel = {
  id: string
  tracking_no: string
  branch_id: string
  receiver_name: string
  cod_amount: number
  status: ParcelStatus
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
