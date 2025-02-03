import React, { useState } from "react";
import {
  Container,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Stack,
  Box,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { exchangeStore } from "../store";

const CryptoExchange = observer(() => {
  const [convertedAmount, setConvertedAmount] = useState("0");
  const [fromPriceUSD, setFromPriceUSD] = useState(0);
  const [toPriceUSD, setToPriceUSD] = useState(0);

  const [loading, setLoading] = useState(false);

  const handleExchange = async () => {
    if (
      !exchangeStore.amountFrom ||
      isNaN(Number(exchangeStore.amountFrom)) ||
      Number(exchangeStore.amountFrom) <= 0
    )
      return;
    if (
      !exchangeStore.amountTo ||
      isNaN(Number(exchangeStore.amountTo)) ||
      Number(exchangeStore.amountTo) <= 0
    )
      return;

    setLoading(true);
    try {
      await exchangeStore.getExchangeRate();
      //@ts-ignore
      setConvertedAmount(
        (exchangeStore.amountFrom * exchangeStore.exchangeRate).toFixed(6)
      );
      setFromPriceUSD(
        //@ts-ignore
        (exchangeStore.amountFrom * exchangeStore.fromUsdPrice).toFixed(6)
      );
      setToPriceUSD(
        //@ts-ignore
        (exchangeStore.amountTo * exchangeStore.toUsdPrice).toFixed(6)
      );
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
    setLoading(false);
  };

  const handleReverse = () => {
    exchangeStore.reverseCurrencies();
    handleExchange();
  };

  const handleSetCurrencyTiker = (way: 'from' | 'to') => (e: any) => {
    if(way === 'from'){
      exchangeStore.setFromCurrency(e.target.value)
    } else {
      exchangeStore.setToCurrency(e.target.value);
    }
    
    handleExchange()
  }
  return (
    <Container
      maxWidth="sm"
      sx={{ p: 10, gap: 4, display: "flex", flexDirection: "column" }}
    >
      <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
        <Box>
          <TextField
            label="Amount"
            type="number"
            value={exchangeStore.amountFrom}
            onChange={(e) => exchangeStore.setAmountFrom(e.target.value)}
            fullWidth
            margin="normal"
            error={
              !!exchangeStore.amountFrom &&
              (isNaN(Number(exchangeStore.amountFrom)) ||
                Number(exchangeStore.amountFrom) < 0)
            }
          />
          {!!fromPriceUSD && <span children={`${fromPriceUSD}$`} />}
        </Box>

        <TextField
          select
          label="From"
          value={exchangeStore.fromCurrency}
          onChange={handleSetCurrencyTiker('from')}
          fullWidth
          margin="normal"
        >
          {exchangeStore.cryptos.map((crypto) => (
            <MenuItem key={crypto.id} value={crypto.symbol}>
              {crypto.symbol} - {crypto.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Button
        disabled={!exchangeStore.toCurrency || !exchangeStore.fromCurrency}
        color="secondary"
        children="Swap"
        onClick={handleReverse}
      />

      <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
        <Box>
          <TextField
            label="Amount"
            type="number"
            value={exchangeStore.amountTo}
            onChange={(e) => exchangeStore.setAmountTo(e.target.value)}
            fullWidth
            margin="normal"
            error={
              !!exchangeStore.amountTo &&
              (isNaN(Number(exchangeStore.amountTo)) ||
                Number(exchangeStore.amountTo) < 0)
            }
          />
          {!!toPriceUSD && <span children={`${toPriceUSD}$`} />}
        </Box>

        <TextField
          select
          label="To"
          value={exchangeStore.toCurrency}
          onChange={handleSetCurrencyTiker('to')}

          fullWidth
          margin="normal"
        >
          {exchangeStore.cryptos.map((crypto) => (
            <MenuItem key={crypto.id} value={crypto.symbol}>
              {crypto.symbol} - {crypto.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        children="Convert"
        onClick={handleExchange}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <p>Converted Amount: {convertedAmount}</p>
      )}
    </Container>
  );
});

export default CryptoExchange;
