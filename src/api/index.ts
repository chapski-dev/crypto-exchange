const BASE_URL = "https://crypto-exchange-server-uwj6.onrender.com";

export const fetchCryptoList = () =>
  fetch(BASE_URL + "/api/cryptocurrency/map").then((res) => res.json());

export const fetchExchangeRate = (fromCurrency: string, toCurrency: string) =>
  fetch(
    BASE_URL +
      "/api/exchange-rate?" +
      new URLSearchParams({
        fromCurrency,
        toCurrency,
      }).toString()
  ).then((res) => res.json());
