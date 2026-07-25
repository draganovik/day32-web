import { ProviderError } from '@/domain/provider'

const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const GOOGLE_IDENTITY_SCRIPT_ID = 'google-identity-services'

let loadPromise: Promise<void> | undefined

export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof google !== 'undefined' && google.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_IDENTITY_SCRIPT_ID,
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new ProviderError('Google Identity Services could not be loaded.', 'network')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_IDENTITY_SCRIPT_ID
    script.src = GOOGLE_IDENTITY_SCRIPT_URL
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new ProviderError('Google Identity Services could not be loaded.', 'network')),
      { once: true },
    )
    document.head.append(script)
  })

  return loadPromise
}
