export type LocaleCode = 'pl' | 'en';

export interface LocaleConfig {
  code: LocaleCode;
  language: 'pl-PL' | 'en-US';
  currency: 'PLN' | 'USD';
  label: string;
}

export interface ProductCardViewModel {
  id: string;
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
}

export interface ProductDetailViewModel extends ProductCardViewModel {
  descriptionHtml: string;
  options: Array<{
    name: string;
    values: string[];
  }>;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: Array<{name: string; value: string}>;
    price: {amount: string; currencyCode: string};
  }>;
}

export interface CollectionFilterState {
  sortKey: string;
  reverse: boolean;
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  productType?: string;
  vendor?: string;
  tag?: string;
}

export interface CartViewModel {
  id?: string;
  checkoutUrl?: string;
  totalQuantity: number;
  cost: {
    subtotalAmount?: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: Array<{
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      product: {
        handle: string;
        title: string;
      };
      image?: {
        url: string;
        altText?: string;
      };
      price: {
        amount: string;
        currencyCode: string;
      };
    };
  }>;
}

export interface SeoMetaModel {
  title: string;
  description: string;
  canonical: string;
  alternates: {
    pl: string;
    en: string;
  };
}
