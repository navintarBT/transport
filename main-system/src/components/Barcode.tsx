import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

export function Barcode({ value, className }: { value: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current || !value) return
    JsBarcode(ref.current, value, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 16,
      height: 50,
      margin: 8,
    })
  }, [value])

  return <svg ref={ref} className={className} />
}
