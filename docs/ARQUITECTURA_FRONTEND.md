# Arquitectura del Frontend · Plataforma Permanencia UCC

Este documento describe la organizacion de componentes y flujo de datos de la aplicacion cliente.

## Estructura Modular
- `src/components/ui`: Componentes atomicos reutilizables (Badge, Card, Modal, Tabs, Skeleton).
- `src/pages`: Vistas completas de la aplicacion segun rutas de react-router.
- `src/types`: Definiciones e interfaces TypeScript para garantizar seguridad de tipos.
- `src/utils`: Funciones puras de calculo, formato de fechas, validacion y accesibilidad.
- `src/services`: Clientes HTTP para interaccion con el backend REST.

## Criterios de Rendimiento
- Desacoplamiento de componentes de presentacion de la logica de negocio.
- Uso de componentes de carga diferida y placeholders accesibles.
