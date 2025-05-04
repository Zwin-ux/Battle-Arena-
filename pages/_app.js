import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
