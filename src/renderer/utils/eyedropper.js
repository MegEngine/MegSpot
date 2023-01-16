/**
 * const { isSupported, open, sRGBHex } = useEyeDroper()
 * await open()
 * console.log('sRGBHex', isSupported, sRGBHex, sRGBHex.value)
 */
export const useEyeDroper = () => {
  let isSupported = true
  const sRGBHex = { value: '' }
  let open = async () => {
    return ''
  }

  if (!window.EyeDropper) {
    isSupported = false
  } else {
    const eyeDropper = new EyeDropper()
    open = async (copyToClipboard = true) => {
      try {
        const result = await eyeDropper.open()
        if (result?.sRGBHex) {
          const hex = result.sRGBHex
          sRGBHex.value = hex
          if (copyToClipboard) {
            navigator.clipboard.writeText(hex)
          }
          return hex
        }
      } catch (e) {}
      return ''
    }
  }

  return { isSupported, open, sRGBHex }
}
