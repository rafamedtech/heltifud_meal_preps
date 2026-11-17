# Políticas de pedidos, cobros y entregas

Decididas por Heltifud el 17 de noviembre de 2026. Las reglas que el cliente ve
están en `layers/menu/shared/utils/orderPolicy.ts` (`ORDER_POLICY`) y se muestran
en `/pedido`, en «Revisa y envía».

## Corte

- Viernes a las 9:00 p.m. (America/Tijuana). Es un ajuste: Menú → Ajustes para
  las semanas nuevas y «Editar corte» para una semana existente.
- Administración puede capturar pedidos después del corte; quedan marcados
  «Fuera de corte».

## Cobro

- Cobro manual por transferencia, tarjeta (terminal externa) o efectivo. Sin
  pago en línea.
- **Pago completo antes de preparar.** «Iniciar preparación» con saldo pendiente
  se rechaza (409 `PAYMENT_PENDING`). Administración puede hacer una excepción
  para clientes que pagan después: marca «Preparar con saldo pendiente» y
  escribe el motivo. El historial guarda «Preparación con saldo pendiente de
  $X: motivo».

## Cobertura

Toda la ciudad, sin zonas ni recargos. La aplicación no limita direcciones ni
suma cargos.

## Cambios y cancelaciones

| Momento | Regla |
| --- | --- |
| Antes del corte | El cliente pide cambios de platillos, días o dirección por WhatsApp; administración los aplica en el pedido. Si cancela, se devuelve el total. |
| Después del corte | No hay devolución de lo ya preparado. La segunda entrega se puede cancelar solo con aviso previo; **falta definir hasta qué día y hora**. Mientras tanto, el texto al cliente dice que se confirmará por WhatsApp. |

## Devoluciones y saldo a favor

- Se devuelve por el mismo medio de pago o como **saldo a favor**.
- En Cobros, una devolución con medio «Saldo a favor» no sale dinero: queda como
  crédito del cliente. Un abono con «Saldo a favor» lo consume, hasta el saldo
  disponible y el saldo del pedido.
- El saldo a favor se calcula del libro de cobros (inmutable): devoluciones
  `CREDIT` menos abonos `CREDIT` de todos los pedidos del cliente. No hay una
  tabla de saldos que se pueda editar. Los movimientos se serializan por cliente.
- No existe todavía devolver en efectivo un saldo a favor ni un ajuste manual de
  saldo sin un cobro previo.

## Entregas fallidas

1. «Marcar fallida» con motivo (cliente ausente, dirección incorrecta, etc.).
2. Reintento:
   - **Mismo día:** «Iniciar reparto» desde Fallida.
   - **Otro día:** «Reprogramar», con la nueva fecha (no anterior a hoy). El
     historial guarda «Reprogramada al AAAA-MM-DD».
3. Si el cliente nunca respondió: «Cerrar sin entregar» con motivo. La entrega
   queda **No entregada** (`LOST`), sin devolución, y deja de contar como
   pendiente o atrasada. El pedido se cierra igual que uno entregado. Se puede
   deshacer volviendo a Fallida.

## Verificación

- Unidad: `tests/unit/orderWorkflow.test.ts`, `tests/unit/operations.test.ts`.
- PostgreSQL real, en un esquema temporal:
  `TSX_TSCONFIG_PATH=.nuxt/tsconfig.server.json node --env-file=.env --import tsx scripts/verify-operations.ts`
  cubre la excepción de saldo, saldo a favor (también con concurrencia),
  reprogramación y cierre sin entregar.
