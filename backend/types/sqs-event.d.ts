export interface SQSEvent {
  metadata:                 DeviceFingerprint;
  totalCartValue:           Installments;
  deviceFingerprint:        DeviceFingerprint;
  orderId:                  CallbackURL;
  installmentsInterestRate: Installments;
  installmentsValue:        Installments;
  inboundRequestsUrl:       CallbackURL;
  merchantName:             CallbackURL;
  reference:                CallbackURL;
  installments:             Installments;
  paymentId:                CallbackURL;
  merchantSettings:         MerchantSettings;
  secureProxyUrl:           CallbackURL;
  shopperInteraction:       CallbackURL;
  callbackUrl:              CallbackURL;
  currency:                 CallbackURL;
  returnUrl:                CallbackURL;
  value:                    Installments;
  ipAddress:                CallbackURL;
  transactionId:            CallbackURL;
  url:                      CallbackURL;
  recipients:               MerchantSettings;
  secureProxyTokensUrl:     CallbackURL;
  paymentMethod:            CallbackURL;
  miniCart:                 MiniCart;
  card:                     Card;
  status:                   CallbackURL;
}

export interface CallbackURL {
  S: string;
}

export interface Card {
  M: CardM;
}

export interface CardM {
  number:       DeviceFingerprint;
  csc:          DeviceFingerprint;
  cscToken:     CallbackURL;
  cscLength:    Installments;
  bin:          CallbackURL;
  document:     CallbackURL;
  holder:       DeviceFingerprint;
  expiration:   Expiration;
  holderToken:  CallbackURL;
  numberToken:  CallbackURL;
  numberLength: Installments;
  token:        DeviceFingerprint;
}

export interface DeviceFingerprint {
  NULL: boolean;
}

export interface Installments {
  N: string;
}

export interface Expiration {
  M: ExpirationM;
}

export interface ExpirationM {
  month: CallbackURL;
  year:  CallbackURL;
}

export interface MerchantSettings {
  L: L[];
}

export interface L {
  M: LM;
}

export interface LM {
  taxRate?:             Installments;
  quantity?:            Installments;
  sellerId?:            CallbackURL;
  taxValue?:            Installments;
  price?:               Installments;
  name:                 CallbackURL;
  deliveryType?:        CallbackURL;
  discount?:            Installments;
  id:                   CallbackURL;
  categoryId?:          CallbackURL;
  chargebackLiable?:    ChargeProcessingFee;
  chargeProcessingFee?: ChargeProcessingFee;
  amount?:              Installments;
  role?:                CallbackURL;
  documentType?:        CallbackURL;
  document?:            DeviceFingerprint;
}

export interface ChargeProcessingFee {
  BOOL: boolean;
}

export interface MiniCart {
  M: MiniCartM;
}

export interface MiniCartM {
  taxValue:        Installments;
  shippingAddress: IngAddress;
  billingAddress:  IngAddress;
  items:           MerchantSettings;
  buyer:           Buyer;
  shippingValue:   Installments;
}

export interface IngAddress {
  M: BillingAddressM;
}

export interface BillingAddressM {
  country:      CallbackURL;
  number:       CallbackURL;
  city:         CallbackURL;
  street:       CallbackURL;
  postalCode:   CallbackURL;
  neighborhood: CallbackURL;
  state:        CallbackURL;
  complement:   DeviceFingerprint;
}

export interface Buyer {
  M: BuyerM;
}

export interface BuyerM {
  corporateName:     DeviceFingerprint;
  firstName:         CallbackURL;
  lastName:          CallbackURL;
  tradeName:         DeviceFingerprint;
  createdDate:       CallbackURL;
  documentType:      CallbackURL;
  phone:             CallbackURL;
  isCorporate:       ChargeProcessingFee;
  document:          CallbackURL;
  id:                CallbackURL;
  email:             CallbackURL;
  corporateDocument: DeviceFingerprint;
}
