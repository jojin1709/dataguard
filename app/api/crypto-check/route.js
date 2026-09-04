import crypto from "crypto";

function isBase58(str) {
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(str);
}

function checkEIP55Checksum(address) {
  const addr = address.replace(/^0x/, "");
  const hash = crypto.createHash("sha3-256").update(addr.toLowerCase()).digest("hex");
  for (let i = 0; i < 40; i++) {
    const char = addr[i];
    const hashNibble = parseInt(hash[i], 16);
    if ((hashNibble > 7 && char.toUpperCase() !== char) || (hashNibble <= 7 && char.toLowerCase() !== char)) {
      return false;
    }
  }
  return true;
}

async function fetchEtherscanData(address) {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) return null;

  try {
    const [balanceRes, priceRes, txCountRes] = await Promise.all([
      fetch(
        `https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
      ).then((r) => r.json()),
      fetch(
        `https://api.etherscan.io/v2/api?chainid=1&module=stats&action=ethprice&apikey=${apiKey}`
      ).then((r) => r.json()),
      fetch(
        `https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${apiKey}`
      ).then((r) => r.json()),
    ]);

    let ethBalance = 0;
    let ethBalanceFormatted = "0 ETH";
    if (balanceRes?.status === "1" && balanceRes.result) {
      const wei = BigInt(balanceRes.result);
      const ethNum = Number(wei) / 1e18;
      ethBalance = ethNum;
      ethBalanceFormatted = `${ethNum.toFixed(4)} ETH`;
    }

    let usdPrice = 0;
    let usdValueFormatted = "$0.00";
    if (priceRes?.status === "1" && priceRes.result?.ethusd) {
      usdPrice = parseFloat(priceRes.result.ethusd);
      const totalUSD = ethBalance * usdPrice;
      usdValueFormatted = `$${totalUSD.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    let txCount = 0;
    if (txCountRes?.result) {
      txCount = parseInt(txCountRes.result, 16) || 0;
    }

    return {
      ethBalance: ethBalanceFormatted,
      usdValue: usdValueFormatted,
      ethPrice: `$${usdPrice.toLocaleString()}`,
      nonceTxCount: txCount,
      isLive: true,
    };
  } catch (err) {
    console.error("Etherscan API error:", err.message);
    return null;
  }
}

export async function POST(req) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return Response.json({ error: "Cryptocurrency wallet address is required" }, { status: 400 });
    }

    const clean = address.trim();

    // 1. Ethereum & EVM Compatible (Polygon, BSC, Arbitrum, Optimism)
    if (/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      const isMixedCase = clean !== clean.toLowerCase() && clean !== clean.toUpperCase();
      let hasValidChecksum = true;
      if (isMixedCase) {
        try {
          hasValidChecksum = checkEIP55Checksum(clean);
        } catch {
          // If sha3-256 unavailable, pass through
        }
      }

      // Query live Etherscan API
      const liveData = await fetchEtherscanData(clean);

      return Response.json({
        raw: address,
        clean,
        network: "Ethereum & EVM Chains",
        symbol: "ETH / MATIC / BNB / ARB",
        chainType: "EVM Account Address",
        isValid: true,
        isChecksummed: isMixedCase && hasValidChecksum,
        liveData,
        summary: liveData
          ? `Live Ethereum balance: ${liveData.ethBalance} (${liveData.usdValue}) with ${liveData.nonceTxCount.toLocaleString()} outbound transactions.`
          : "Valid Ethereum / EVM wallet address compatible with Ethereum, Polygon, BNB Chain, Arbitrum, and Base.",
        explorers: [
          { name: "Etherscan", url: `https://etherscan.io/address/${clean}` },
          { name: "Polygonscan", url: `https://polygonscan.com/address/${clean}` },
          { name: "BscScan", url: `https://bscscan.com/address/${clean}` },
        ],
      });
    }

    // 2. Bitcoin (BTC)
    if (/^bc1[a-zA-HJ-NP-Z0-9]{25,62}$/i.test(clean)) {
      const isTaproot = clean.toLowerCase().startsWith("bc1p");
      return Response.json({
        raw: address,
        clean,
        network: "Bitcoin (BTC)",
        symbol: "BTC",
        chainType: isTaproot ? "Bech32m Taproot (P2TR)" : "Bech32 Native SegWit (P2WPKH)",
        isValid: true,
        summary: `Valid modern Bitcoin ${isTaproot ? "Taproot" : "Native SegWit"} address.`,
        explorers: [
          { name: "Blockchain.com", url: `https://www.blockchain.com/explorer/addresses/btc/${clean}` },
          { name: "Blockchair", url: `https://blockchair.com/bitcoin/address/${clean}` },
        ],
      });
    }

    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(clean) && isBase58(clean)) {
      const isLegacy = clean.startsWith("1");
      return Response.json({
        raw: address,
        clean,
        network: "Bitcoin (BTC)",
        symbol: "BTC",
        chainType: isLegacy ? "Legacy Address (P2PKH)" : "Script Hash (P2SH / Nested SegWit)",
        isValid: true,
        summary: `Valid Bitcoin ${isLegacy ? "Legacy" : "P2SH"} Base58 address.`,
        explorers: [
          { name: "Blockchain.com", url: `https://www.blockchain.com/explorer/addresses/btc/${clean}` },
          { name: "Blockchair", url: `https://blockchair.com/bitcoin/address/${clean}` },
        ],
      });
    }

    // 3. Solana (SOL)
    if (clean.length >= 32 && clean.length <= 44 && isBase58(clean)) {
      return Response.json({
        raw: address,
        clean,
        network: "Solana (SOL)",
        symbol: "SOL",
        chainType: "Base58 Public Key",
        isValid: true,
        summary: "Valid Solana Base58 public key account address.",
        explorers: [
          { name: "Solscan", url: `https://solscan.io/account/${clean}` },
          { name: "Solana Explorer", url: `https://explorer.solana.com/address/${clean}` },
        ],
      });
    }

    // 4. Litecoin (LTC)
    if (/^(L|M|ltc1)[a-zA-HJ-NP-Z0-9]{25,43}$/i.test(clean)) {
      return Response.json({
        raw: address,
        clean,
        network: "Litecoin (LTC)",
        symbol: "LTC",
        chainType: "Litecoin Address",
        isValid: true,
        summary: "Valid Litecoin network address.",
        explorers: [
          { name: "Blockchair", url: `https://blockchair.com/litecoin/address/${clean}` },
        ],
      });
    }

    return Response.json({
      raw: address,
      clean,
      isValid: false,
      message: "Unrecognized cryptocurrency address format. Supports Bitcoin (1..., 3..., bc1...), Ethereum (0x...), Solana, and Litecoin.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
