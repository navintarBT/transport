import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { IonIcon } from '@ionic/react'
import { closeOutline } from 'ionicons/icons'
import { supabase } from '../lib/supabase'

type ScanResult = { type: 'success' | 'error'; text: string }

export default function Scan() {
  const history = useHistory()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const processingRef = useRef(false)
  const lastCodeRef = useRef<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let stopped = false
    let controls: { stop: () => void } | null = null

    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, videoRef.current!, (res) => {
        if (stopped || !res) return
        handleDetected(res.getText())
      })
      .then((c) => {
        controls = c
      })
      .catch(() => setCameraError('ບໍ່ສາມາດເປີດກ້ອງໄດ້ — ກະລຸນາອະນຸຍາດການໃຊ້ກ້ອງໃນເບົາເຊີ'))

    return () => {
      stopped = true
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDetected(code: string) {
    if (processingRef.current || code === lastCodeRef.current) return
    processingRef.current = true
    lastCodeRef.current = code

    const { data: parcel, error } = await supabase.from('parcels').select('*').eq('tracking_no', code).maybeSingle()

    if (error || !parcel) {
      setResult({ type: 'error', text: `ບໍ່ພົບພັດສະດຸ ${code}` })
    } else if (parcel.status !== 'pending_pickup') {
      setResult({
        type: 'error',
        text: parcel.status === 'picked_up' ? `${code} ຖືກຮັບໄປແລ້ວ` : `${code} ບໍ່ຢູ່ໃນສະຖານະຂອງຄ້າງ`,
      })
    } else {
      const { error: updateError } = await supabase
        .from('parcels')
        .update({ status: 'picked_up', picked_up_at: new Date().toISOString() })
        .eq('id', parcel.id)

      if (updateError) {
        setResult({ type: 'error', text: updateError.message })
      } else {
        await supabase.from('transactions').update({ payment_status: 'paid' }).eq('parcel_id', parcel.id).eq('type', 'cod')
        setResult({ type: 'success', text: `ຮັບ ${code} (${parcel.receiver_name}) ໃຫ້ລູກຄ້າແລ້ວ` })
      }
    }

    setTimeout(() => {
      processingRef.current = false
      lastCodeRef.current = null
    }, 2000)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />

      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between p-5"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top))' }}
      >
        <span className="text-base font-semibold">ສະແກນຮັບເຄື່ອງ</span>
        <button
          onClick={() => history.goBack()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 transition-colors active:bg-black/60"
        >
          <IonIcon icon={closeOutline} className="text-xl" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-72 rounded-2xl border-2 border-white/70" />
      </div>

      {cameraError && (
        <div className="absolute inset-x-5 bottom-24 rounded-xl bg-danger p-4 text-center text-sm font-medium">
          {cameraError}
        </div>
      )}

      {result && !cameraError && (
        <div
          className={
            'absolute inset-x-5 bottom-24 rounded-xl p-4 text-center text-sm font-medium ' +
            (result.type === 'success' ? 'bg-success' : 'bg-danger')
          }
        >
          {result.text}
        </div>
      )}

      {!result && !cameraError && (
        <p className="absolute inset-x-5 bottom-24 text-center text-sm text-white/70">
          ເອົາກ້ອງສ່ອງໄປທີ່ບາໂຄດເລກພັດສະດຸ
        </p>
      )}
    </div>
  )
}
