export interface Store {
  id: number
  storeName: string
  storeStatus: boolean
  store_phone: string
  licenceNumber: string
  store_hours: any
  is_approved: boolean
  payout_frequency: string
  payoutFreeze: boolean
  createdAt: string
  updatedAt: string
  deleted_at: string | null
  uploadDoc: Array<{
    name: string
    fileUrl: string
  }>
  serviceAreas: any
  backoutDates: any
  preferred: boolean
  stripeAccountId: string
  storeAddresses: Array<{
    id: number
    house_no: string
    street_address: string | null
    landmark: string
    city: string
    address_type: string | null
    state: string
    zipcode: string
    is_primary: boolean
    is_deleted: boolean
    created_at: string
    deleted_at: string | null
    latlongs: Array<{
      id: number
      latitude: string
      longitude: string
      is_deleted: boolean
    }>
  }>
  services: Array<{
    id: number
    serviceType: string
    deleted_at: string | null
  }>
  campaign: Array<any>
  estimatedPrice?: number
  rating?: number
}
