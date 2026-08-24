import { importLibrary, setOptions } from "@googlemaps/js-api-loader"

let configuredApiKey: string | null = null
let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | null = null

export function loadGooglePlacesLibrary(apiKey: string) {
  if (!placesLibraryPromise) {
    configuredApiKey = apiKey
    setOptions({
      key: apiKey,
      v: "weekly",
      language: "es",
      region: "MX"
    })
    placesLibraryPromise = importLibrary("places")
  }

  if (configuredApiKey !== apiKey) {
    return Promise.reject(new Error("Google Maps ya fue inicializado con otra API key."))
  }

  return placesLibraryPromise
}
