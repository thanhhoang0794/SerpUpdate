'use client'
import { Toaster } from 'react-hot-toast'
import { ChakraProvider, defaultConfig, createSystem, defineConfig } from '@chakra-ui/react'
const config = defineConfig({
  globalCss: {
    'div[data-scope="checkbox"][data-part="control"][data-state="checked"]': {
      backgroundColor: 'primary.500 !important'
    },
    'button > svg[viewBox="0 0 512 512"]': {
      color: 'red.500 !important'
    },
    'button[aria-current="page"][data-scope="pagination"]': {
      backgroundColor: 'primary.500 !important',
      color: 'white !important',
      _hover: {
        backgroundColor: 'primary.600 !important'
      }
    },
    'button[data-scope="pagination"]': {
      border: 'none !important',
      borderRadius: 'md !important',
      _hover: {
        backgroundColor: 'blackAlpha.200 !important'
      }
    },
    'span[data-part="ellipsis"]': {
      border: 'none !important',
      cursor: 'default !important'
    },
    'button[aria-label="previous page"]': {
      borderRadius: 'md !important',
      paddingX: '12px !important',
      gap: '8px !important',
      _hover: {
        backgroundColor: 'blackAlpha.200 !important'
      }
    },
    'button[aria-label="next page"]': {
      borderRadius: 'md !important',
      paddingX: '12px !important',
      gap: '8px !important',
      _hover: {
        backgroundColor: 'blackAlpha.200 !important'
      }
    },
    'input[type="time"]::-webkit-calendar-picker-indicator': {
      display: 'none !important'
    },
    'div[data-scope="steps"][data-part="indicator"][data-current]': {
      backgroundColor: 'white !important',
      borderColor: 'primary.500 !important',
      color: 'primary.500 !important'
    },
    'div[data-scope="steps"][data-part="separator"][data-complete]': {
      backgroundColor: 'gray.400 !important'
    },
    'div[data-scope="steps"][data-part="indicator"][data-complete]': {
      backgroundColor: 'primary.500 !important'
    }
  },
  theme: {
    tokens: {
      colors: {
        blue: {
          50: { value: '#EBF8FF' },
          100: { value: '#BEE3F8' },
          200: { value: '#90CDF4' },
          300: { value: '#63B3ED' },
          400: { value: '#4299E1' },
          500: { value: '#3182CE' },
          600: { value: '#2B6CB0' },
          700: { value: '#2C5282' },
          800: { value: '#2A4365' },
          900: { value: '#1A365D' }
        },
        primary: {
          50: { value: '#F1F5FF' },
          100: { value: '#DCE5FF' },
          200: { value: '#B9CAFF' },
          300: { value: '#97ADFF' },
          400: { value: '#7D96FF' },
          500: { value: '#5271FF' },
          600: { value: '#3B55DB' },
          700: { value: '#293DB7' },
          800: { value: '#1A2993' },
          900: { value: '#0F1A7A' }
        },
        gray: {
          50: { value: '#F7FAFC' },
          100: { value: '#EDF2F7' },
          200: { value: '#E2E8F0' },
          300: { value: '#CBD5E0' },
          400: { value: '#A0AEC0' },
          500: { value: '#718096' },
          600: { value: '#4A5568' },
          700: { value: '#2D3748' },
          800: { value: '#1A202C' },
          900: { value: '#171923' }
        },
        red: {
          50: { value: '#FFF5F5' },
          100: { value: '#FED7D7' },
          200: { value: '#FEB2B2' },
          300: { value: '#FC8181' },
          400: { value: '#F56565' },
          500: { value: '#E53E3E' },
          600: { value: '#C53030' },
          700: { value: '#9B2C2C' },
          800: { value: '#822727' },
          900: { value: '#63171B' }
        },
        green: {
          100: { value: '#C6F6D5' },
          400: { value: '#48BB78' },
          500: { value: '#38A169' },
          800: { value: '#22543D' },
        }
      },
      spacing: {
        0.5: { value: '2px' },
        1: { value: '4px' },
        1.5: { value: '6px' },
        2: { value: '8px' },
        2.5: { value: '10px' },
        3: { value: '12px' },
        3.5: { value: '14px' },
        4: { value: '16px' },
        5: { value: '20px' },
        6: { value: '24px' },
        7: { value: '28px' },
        8: { value: '32px' },
        9: { value: '36px' },
        10: { value: '40px' },
        12: { value: '48px' },
        14: { value: '56px' },
        16: { value: '64px' },
        18: { value: '72px' },
        20: { value: '80px' },
        24: { value: '96px' },
        28: { value: '112px' },
        32: { value: '128px' },
        36: { value: '144px' },
        40: { value: '160px' },
        44: { value: '176px' },
        48: { value: '192px' },
        52: { value: '208px' },
        56: { value: '224px' },
        60: { value: '240px' },
        64: { value: '256px' },
        72: { value: '288px' },
        80: { value: '320px' },
        96: { value: '384px' }
      }
    }
  }
})

const system = createSystem(defaultConfig, config)

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      {props.children}
      <Toaster />
    </ChakraProvider>
  )
}
