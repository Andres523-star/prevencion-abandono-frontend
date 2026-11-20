# Permanencia · Frontend

Frontend de la demo de **Permanencia**, la plataforma de acompañamiento universitario para
prevenir el abandono. Está construido con React 19, TypeScript, Vite, React Router y Recharts,
y consume el backend de demostración (`demo-backend`) que simula **1.109.845 estudiantes** de
las 17 sedes en memoria.

> Datos ficticios para presentaciones académicas. La autenticación es simplificada.

## Cuentas de la demo

| Rol                  | Correo                       | Contraseña       | Sede por defecto |
| -------------------- | ---------------------------- | ---------------- | ---------------- |
| Estudiante           | `estudiante@ucc.edu.co`       | `Estudiante2026` | Pasto            |
| Profesor             | `profesor@ucc.edu.co`         | `Profesor2026`   | Bogotá           |
| Jefe de programa     | `jefe.programa@ucc.edu.co`    | `Programa2026`   | Medellín         |
| Coordinador de sede  | `coordinador.sede@ucc.edu.co` | `Coordinador2026`| Bogotá           |
| Decano               | `decano@ucc.edu.co`           | `Decano2026`     | Pasto (facultad completa) |
| Rector               | `rector@ucc.edu.co`           | `Rector2026`     | Nacional         |

## Cómo correr la demo

1. **Backend** (puerto 8080, sin base de datos):

   ```bash
   # Clona el repo del backend y entra a la carpeta de la demo
   cd ../prevencion-abandono-backend/demo-backend
   ./mvnw spring-boot:run
   ```

2. **Frontend** (puerto 5173):

   ```bash
   npm install
   npm run dev
   ```

Abrir `http://localhost:5173` e iniciar sesión.

## Qué incluye

- **Panel de permanencia**: tarjetas de resumen, riesgo por semestre, distribución del riesgo,
  causas que más pesan, casos prioritarios, riesgo por programa y semáforo del semestre.
- **Estudiantes**: directorio con búsqueda, filtros (programa, semestre, causa, riesgo),
  paginación y registro de nuevos estudiantes.
- **Ficha del estudiante**: contexto del caso, materias con notas, evolución del riesgo,
  acciones rápidas y **plan de acción con IA** (motor local, o Claude si hay
  `ANTHROPIC_API_KEY` en el backend).
- **Estadísticas**: gráficas interactivas con filtros, insight automático, tabla por programa y
  exportación a CSV.
- **Acompañamiento (chat)**: conversaciones con texto, notas de voz, PDF y Word; el estudiante
  responde automáticamente unos segundos después.
- **Campanita de alertas**: notificaciones de riesgo alto con enlace para agendar cita.
- **Asistente de IA**: botón flotante con escalas de tamaño, preguntas rápidas por rol y
  respuestas sobre riesgo, materias, faltas y próximas citas.
- **Menú de usuario**: cierre de sesión con doble confirmación.

## Configuración

La URL del backend se define con `VITE_API_URL`. Copia `.env.example` a `.env` (el `.env` ya no
se sube al repositorio) y ajusta la URL; en Vercel, define la variable en *Project Settings →
Environment Variables*:

```
VITE_API_URL=http://localhost:8080/api
```

## Seguridad en el cliente

- La sesión se guarda en `sessionStorage` (se borra al cerrar la pestaña), no en `localStorage`.
- "Cerrar sesión" revoca el token en el backend (`POST /api/auth/logout`).
- El registro público solo crea cuentas de profesor, con sede y programa.
- Los adjuntos del chat se descargan con el enlace firmado que entrega el backend; se aceptan PDF,
  Word `.docx` y audio (no `.doc` ni Word con macros).

## Scripts

- `npm run dev` — servidor de desarrollo en el puerto 5173.
- `npm run build` — verificación de tipos + build de producción en `dist/`.
- `npm run lint` — ESLint.
