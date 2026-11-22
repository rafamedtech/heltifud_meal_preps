import { describe, expect, it } from "vitest"
import { loginErrorMessage } from "../../layers/auth/app/utils/loginErrorMessage"

describe("loginErrorMessage", () => {
  it("translates wrong credentials", () => {
    expect(loginErrorMessage({ code: "invalid_credentials", status: 400, message: "Invalid login credentials" }))
      .toBe("Correo o contraseña incorrectos.")
  })

  it("explains an unconfirmed email and a rate limit", () => {
    expect(loginErrorMessage({ code: "email_not_confirmed", status: 400 })).toMatch(/no está confirmado/)
    expect(loginErrorMessage({ code: "over_request_rate_limit", status: 429 })).toMatch(/Demasiados intentos/)
  })

  it("treats network failures and server errors as a connection problem", () => {
    const connection = /conectar con el servidor/
    expect(loginErrorMessage({ name: "AuthRetryableFetchError", status: 0 })).toMatch(connection)
    expect(loginErrorMessage(new TypeError("Failed to fetch"))).toMatch(connection)
    expect(loginErrorMessage({ status: 503 })).toMatch(connection)
  })

  it("never leaks the raw English message", () => {
    expect(loginErrorMessage({ message: "Something odd" })).toBe("No fue posible iniciar sesión. Intenta de nuevo.")
    expect(loginErrorMessage(undefined)).toBe("No fue posible iniciar sesión. Intenta de nuevo.")
  })
})
