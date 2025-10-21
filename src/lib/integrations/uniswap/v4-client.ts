/**
 * Uniswap V4 Subgraph Client for Base Network
 * Queries The Graph to find top Zora creator coin pools
 */

const UNISWAP_V4_BASE_SUBGRAPH_ID = '2L6yxqUZ7dT6GWoTy9qxNBkf9kEk65me3XPMvbGsmJUZ';
const THE_GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY;

if (!THE_GRAPH_API_KEY) {
  console.warn('⚠️ THE_GRAPH_API_KEY not set. Uniswap V4 queries will fail.');
}

const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${THE_GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V4_BASE_SUBGRAPH_ID}`;

interface Pool {
  id: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
  };
  volumeUSD: string;
  totalValueLockedUSD: string;
  feeTier: string;
}

/**
 * Query top pools by trading volume from Uniswap V4 Base subgraph
 */
export async function getTopPoolsByVolume(limit: number = 100): Promise<Pool[]> {
  const query = `
    query GetTopPools($limit: Int!) {
      pools(
        first: $limit
        orderBy: volumeUSD
        orderDirection: desc
        where: { volumeUSD_gt: "1000" }
      ) {
        id
        token0 {
          id
          symbol
          name
        }
        token1 {
          id
          symbol
          name
        }
        volumeUSD
        totalValueLockedUSD
        feeTier
      }
    }
  `;

  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { limit },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error('Failed to query subgraph');
    }

    return result.data?.pools || [];
  } catch (error) {
    console.error('Error fetching top pools:', error);
    return [];
  }
}

/**
 * Extract Zora creator coin token addresses from pools
 * Zora creator coins are paired with WETH (0x4200000000000000000000000000000000000006 on Base)
 */
export async function getZoraCreatorCoins(limit: number = 50): Promise<string[]> {
  const pools = await getTopPoolsByVolume(200); // Query more to filter

  const WETH_BASE = '0x4200000000000000000000000000000000000006'.toLowerCase();

  const zoraTokens = pools
    .filter(pool => {
      // Zora creator coins are paired with WETH
      const token0Lower = pool.token0.id.toLowerCase();
      const token1Lower = pool.token1.id.toLowerCase();

      return token0Lower === WETH_BASE || token1Lower === WETH_BASE;
    })
    .map(pool => {
      // Return the non-WETH token (the Zora creator coin)
      const token0Lower = pool.token0.id.toLowerCase();
      return token0Lower === WETH_BASE ? pool.token1.id : pool.token0.id;
    })
    .slice(0, limit);

  return zoraTokens;
}

export const uniswapV4Client = {
  getTopPoolsByVolume,
  getZoraCreatorCoins,
};
