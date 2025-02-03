import { makeAutoObservable, runInAction } from "mobx";
import { fetchCryptoList, fetchExchangeRate } from "../api";

export interface CryptoCurrency {
  id: number;
  name: string;
  symbol: string;
}

class ExchangeStore {
  cryptos: CryptoCurrency[] = [];
  fromCurrency: CryptoCurrency | string = '';
  toCurrency: CryptoCurrency | string = '';
  fromUsdPrice: number = 0;
  toUsdPrice: number = 0;
  amountFrom: number = 0;
  amountTo: number = 0;
  exchangeRate: number = 0;
  loading: boolean = false;
  error: string = "";

  constructor() {
    makeAutoObservable(this);
    this.loadCryptoList();
  }

  async loadCryptoList() {
    try {
      this.loading = true;
      const list = await fetchCryptoList();
      runInAction(() => {
        this.cryptos = list.data.slice(0, 300).map((item: any) => ({
          id: item.id,
          name: item.name,
          symbol: item.symbol,
        }));
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
    }
  }

   reverseCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
  }

  async getExchangeRate() {
    if (!this.fromCurrency || !this.toCurrency) return;
    
    try {
      this.loading = true;
      const res: {
        tiker_from_price: number;
        tiker_to_price: number;
        exchange_rate: number;
        //@ts-ignore
      } = await fetchExchangeRate(this.fromCurrency, this.toCurrency);
      runInAction(() => {
        this.exchangeRate = res.exchange_rate;
        this.fromUsdPrice = res.tiker_from_price
        this.toUsdPrice = res.tiker_to_price

        // Обновляем сумму конвертации, если было введено значение
        if (this.amountFrom > 0) {
          this.amountTo = this.amountFrom * this.exchangeRate;
        } else if (this.amountTo > 0) {
          this.amountFrom = this.amountTo / this.exchangeRate;
        }
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
    }
  }
  
  setFromCurrency(currency: CryptoCurrency) {
    this.fromCurrency = currency;
  }

  setToCurrency(currency: CryptoCurrency) {
    this.toCurrency = currency;
  }

  setAmountFrom(value: string) {
        //@ts-ignore
    this.amountFrom = value;
        //@ts-ignore
    this.amountTo = value * this.exchangeRate;
  }

  setAmountTo(value: string) {
        //@ts-ignore
    this.amountTo = value;
    if (this.exchangeRate !== 0) {
        //@ts-ignore
      this.amountFrom = value / this.exchangeRate;
    }
  }
}

export const exchangeStore = new ExchangeStore();
