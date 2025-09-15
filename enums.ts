export enum ServiceTypeEnum {
  WASH_N_FOLD = 'WASH_N_FOLD',
  DRYCLEANING = 'DRYCLEANING',
  IRONING = 'IRONING',
  TAILORING = 'TAILORING'
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PICKUP_SCHEDULED = 'Pickup Scheduled',
  PICKUP_RESCHEDULED = 'Pickup Rescheduled',
  PICKUP_CONFIRMED = 'Pickup Confirmed',
  OUT_FOR_PICKUP = 'Out for Pickup',
  PICKED_UP = 'Picked Up',
  AT_STORE = 'At Store',
  PROCESSING = 'Processing',
  DELAYED = 'Delayed',
  READY_FOR_DELIVERY = 'Ready for Delivery',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERY_SCHEDULED = 'Delivery Scheduled',
  DELIVERED = 'Delivered'
}

export enum deviceType {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android'
}
