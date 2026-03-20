/**
 * Environment Configuration with Validation
 * Validates required environment variables on startup
 */

// Required environment variables
const REQUIRED_SERVER_VARS = ['KYBER_CLIENT_ID', 'KYBER_FEE_RECEIVER', 'BSC_RPC_URL'] as const
const REQUIRED_PUBLIC_VARS = ['NEXT_PUBLIC_BSC_RPC_URL', 'NEXT_PUBLIC_APP_NAME'] as const

export interface EnvConfig {
  // KyberSwap API
  kyberClientId: string
  kyberFeeReceiver: string
  kyberFeeAmount: number
  kyberFeeIsInBps: boolean
  kyberFeeChargeBy: 'currency_in' | 'currency_out'
  
  // Blockchain
  bscRpcUrl: string
  isServer: boolean
  
  // WalletConnect
  walletConnectProjectId: string
  
  // App
  appName: string
}

function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key]
  }
  return undefined
}

function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Get validated environment configuration
 * Throws if required variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const errors: string[] = []
  
  // Server-side required vars
  for (const varName of REQUIRED_SERVER_VARS) {
    const value = getEnv(varName)
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }
  
  // Public required vars
  for (const varName of REQUIRED_PUBLIC_VARS) {
    const value = getEnv(varName)
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }
  
  // Validate fee receiver address
  const feeReceiver = getEnv('KYBER_FEE_RECEIVER')
  if (feeReceiver && !validateAddress(feeReceiver)) {
    errors.push('KYBER_FEE_RECEIVER must be a valid Ethereum address')
  }
  
  // Throw if validation fails
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`
    if (typeof window === 'undefined') {
      // Server-side: throw error
      throw new Error(errorMessage)
    } else {
      // Client-side: console warning (prevents app crash)
      console.warn(errorMessage)
    }
  }
  
  // Parse fee amount
  const feeAmountStr = getEnv('KYBER_FEE_AMOUNT') || '0'
  const feeAmount = parseInt(feeAmountStr, 10)
  
  // Parse fee isInBps
  const feeIsInBpsStr = getEnv('KYBER_FEE_IS_IN_BPS') || 'true'
  const feeIsInBps = feeIsInBpsStr.toLowerCase() === 'true'
  
  // Parse fee chargeBy
  const feeChargeBy = (getEnv('KYBER_FEE_CHARGE_BY') || 'currency_in') as EnvConfig['kyberFeeChargeBy']
  const validChargeByOptions = ['currency_in', 'currency_out']
  if (!validChargeByOptions.includes(feeChargeBy)) {
    console.warn(`Invalid KYBER_FEE_CHARGE_BY value: ${feeChargeBy}. Using 'currency_in'.`)
  }
  
  return {
    kyberClientId: getEnv('KYBER_CLIENT_ID') || 'UnknownApp',
    kyberFeeReceiver: feeReceiver || '0x0000000000000000000000000000000000000000',
    kyberFeeAmount: isNaN(feeAmount) ? 0 : feeAmount,
    kyberFeeIsInBps: feeIsInBps,
    kyberFeeChargeBy: validChargeByOptions.includes(feeChargeBy) ? feeChargeBy : 'currency_in',
    bscRpcUrl: getEnv('BSC_RPC_URL') || getEnv('NEXT_PUBLIC_BSC_RPC_URL') || 'https://bsc-dataseed.binance.org',
    isServer: typeof window === 'undefined',
    walletConnectProjectId: getEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') || '',
    appName: getEnv('NEXT_PUBLIC_APP_NAME') || 'KyberSwap DEX',
  }
}

/**
 * Singleton instance (created lazily)
 */
let cachedConfig: EnvConfig | null = null

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = getEnvConfig()
  }
  return cachedConfig
}

// Development mode check
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'
