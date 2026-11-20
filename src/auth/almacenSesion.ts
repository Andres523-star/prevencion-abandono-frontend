import type { Sesion } from '../types'

/**
 * Dónde vive la sesión en el navegador.
 *
 * Antes el token se guardaba en localStorage: quedaba en el disco indefinidamente y lo compartían
 * todas las pestañas, incluso después de cerrar el navegador. Ahora va en sessionStorage, que se
 * borra al cerrar la pestaña, y el backend además vence la sesión por inactividad (2 h) y la
 * revoca al cerrar sesión. Una cookie httpOnly sería aún mejor, pero con el frontend en Vercel y el
 * backend en otro dominio exigiría cookies de terceros, que los navegadores bloquean cada vez más.
 */
const CLAVE_SESION = 'permanencia.sesion'

// Limpia el token persistente que dejaron las versiones anteriores.
try {
  window.localStorage.removeItem(CLAVE_SESION)
} catch {
  // Almacenamiento no disponible (modo privado estricto): no hay nada que limpiar.
}

export function leerSesion(): Sesion | null {
  try {
    const guardada = window.sessionStorage.getItem(CLAVE_SESION)
    return guardada ? (JSON.parse(guardada) as Sesion) : null
  } catch {
    borrarSesion()
    return null
  }
}

export function guardarSesion(sesion: Sesion): void {
  try {
    window.sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
  } catch {
    // Sin almacenamiento la sesión dura lo que dure la página.
  }
}

export function borrarSesion(): void {
  try {
    window.sessionStorage.removeItem(CLAVE_SESION)
  } catch {
    // Nada que borrar.
  }
}

export function tokenActual(): string | null {
  return leerSesion()?.token ?? null
}
