import Empty from "@/components/empty";
import Error from "@/components/error";
import Skeleton, { SkeletonText } from "@/components/skeleton";
import { Input } from "@/components/ui/input";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { useCryptoCurrencies, useCryptoPrices } from "@/hooks/api/use-crypto";
import { CryptoCurrency } from "@/services/api/crypto";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// CoinGecko ID mapping for price changes
const COIN_GECKO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  SOL: "solana",
  TRX: "tron",
  DOGE: "dogecoin",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  XRP: "ripple",
  ADA: "cardano",
  DOT: "polkadot",
  LINK: "chainlink",
  AAVE: "aave",
  ATOM: "cosmos",
  AVAX: "avalanche-2",
  DAI: "dai",
  EOS: "eos",
  FLOKI: "floki",
  FLOW: "flow",
  HFT: "hashflow",
  KSM: "kusama",
  NEAR: "near",
  SHIB: "shiba-inu",
  TWT: "trust-wallet-token",
  ACH: "alchemy-pay",
  CRV: "curve-dao-token",
  DYDX: "dydx",
  PEPE: "pepe",
  POL: "matic-network",
  PYUSD: "paypal-usd",
  BONK: "bonk",
  CAT: "catcoin",
  TRUMP: "official-trump",
  WIF: "dogwifcoin",
};

const { height } = Dimensions.get("window");

export default function CryptoDepositScreen() {
  const router = useRouter();
  const {
    data: currenciesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCryptoCurrencies();
  const [searchQuery, setSearchQuery] = useState("");

  // Get all currencies from API (now flat array)
  const allCurrencies = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies;
  }, [currenciesData]);

  // Get CoinGecko IDs for price fetching
  const coinGeckoIds = useMemo(() => {
    const ids = new Set<string>();
    allCurrencies.forEach((currency) => {
      const coinId = COIN_GECKO_MAP[currency.coin?.toUpperCase() || ""];
      if (coinId) {
        ids.add(coinId);
      }
    });
    return Array.from(ids);
  }, [allCurrencies]);

  // Fetch crypto prices from CoinGecko
  const { data: cryptoPrices } = useCryptoPrices(coinGeckoIds, "usd", 30000);

  // Format price
  const formatPrice = (rate: number) => {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate)}`;
  };

  // Format holdings
  const formatHoldings = (balance: number, rate: number) => {
    const usdValue = balance * rate;
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdValue)}`;
  };

  // Get price and change for currency
  const getCurrencyPriceData = (currency: CryptoCurrency) => {
    const coinId = COIN_GECKO_MAP[currency.coin?.toUpperCase() || ""];
    if (coinId && cryptoPrices) {
      const priceData = cryptoPrices.find((p) => p.id === coinId);
      if (priceData) {
        return {
          price: priceData.current_price,
          change: priceData.price_change_percentage_24h,
        };
      }
    }
    return {
      price: currency.rate_usd || 0,
      change: 0,
    };
  };

  // Get holdings for currency (using balance from API)
  const getCurrencyHoldings = (currency: CryptoCurrency) => {
    const balance = currency.balance || 0;
    const priceData = getCurrencyPriceData(currency);
    return formatHoldings(balance, priceData.price);
  };

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return allCurrencies;
    const query = searchQuery.toLowerCase();
    return allCurrencies.filter(
      (currency) =>
        currency.name?.toLowerCase().includes(query) ||
        currency.coin?.toLowerCase().includes(query) ||
        currency.network?.toLowerCase().includes(query)
    );
  }, [allCurrencies, searchQuery]);

  // Handle currency selection
  const handleSelectCurrency = (currency: CryptoCurrency) => {
    router.push({
      pathname: "/btc-deposit",
      params: {
        currencyId: currency.currency_id.toString(),
        wallet: JSON.stringify({
          id: currency.currency_id,
          name: currency.name,
          symbol: currency.coin,
          image_url: currency.image_url,
          network: currency.network,
          min_deposit: currency.min_deposit,
        }),
        network: currency.network,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScreenTitle title="Crypto Deposit" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search cryptocurrency..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          leftIcon={
            <Ionicons
              name="search-outline"
              size={20}
              color={AppColors.textSecondary}
            />
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <>
            {[...Array(8)].map((_, index) => (
              <View key={index} style={styles.currencyCard}>
                <Skeleton type="circle" size={48} style={styles.skeletonIcon} />
                <View style={styles.currencyInfo}>
                  <SkeletonText
                    width="60%"
                    height={16}
                    style={styles.skeletonName}
                  />
                </View>
              </View>
            ))}
          </>
        ) : error ? (
          <Error
            message="Failed to load currencies"
            onRetry={() => refetch()}
            isLoading={isRefetching}
            style={{ minHeight: height - 200 }}
          />
        ) : filteredCurrencies.length === 0 ? (
          <Empty
            style={{ minHeight: height - 200 }}
            title="No currencies found"
            description={
              searchQuery.trim()
                ? "Try adjusting your search"
                : "No cryptocurrencies available"
            }
          />
        ) : (
          filteredCurrencies.map((currency) => {
            return (
              <TouchableOpacity
                key={`${currency.currency_id}-${currency.network}`}
                style={styles.currencyCard}
                onPress={() => handleSelectCurrency(currency)}
                activeOpacity={0.7}
              >
                <View style={styles.currencyIcon}>
                  <Image
                    source={{ uri: currency.image_url }}
                    style={styles.currencyIconImage}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  <View style={styles.currencyPriceRow}>
                    <Text style={styles.currencyNetwork}>
                      {currency.coin}
                      {""}
                      {currency.network &&
                        currency.network !== currency.name && (
                          <Text style={styles.currencyNetwork}>
                            {" "}
                            ({currency.network})
                          </Text>
                        )}
                    </Text>
                    {/* <Text style={styles.currencyPrice}>
                      {formatPrice(priceData.price)}
                    </Text> */}
                    {/* {priceData.change !== 0 && (
                      <View style={styles.priceChangeContainer}>
                        <Ionicons
                          name={isPositive ? "arrow-up" : "arrow-down"}
                          size={12}
                          color={isPositive ? AppColors.green : AppColors.red}
                        />
                        <Text
                          style={[
                            styles.priceChange,
                            {
                              color: isPositive
                                ? AppColors.green
                                : AppColors.red,
                            },
                          ]}
                        >
                          {Math.abs(priceData.change).toFixed(2)}%
                        </Text>
                      </View>
                    )} */}
                  </View>
                </View>
                {/* <View style={styles.currencyHoldings}>
                  <Text style={styles.holdingsValue}>{holdings}</Text>
                </View> */}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  searchInput: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  currencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  currencyIconImage: {
    width: 36,
    height: 36,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  currencyNetwork: {
    fontSize: 12,
    fontWeight: "400",
    color: AppColors.textSecondary,
  },
  currencyPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencyPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.text,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceChange: {
    fontSize: 10,
    fontWeight: "500",
  },
  currencyHoldings: {
    alignItems: "flex-end",
  },
  holdingsValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  skeletonIcon: {
    marginRight: 10,
  },
  skeletonName: {
    marginBottom: 4,
  },
  skeletonPrice: {
    marginRight: 6,
  },
  skeletonChange: {
    marginLeft: 4,
  },
  skeletonHoldings: {
    marginTop: 0,
  },
});
