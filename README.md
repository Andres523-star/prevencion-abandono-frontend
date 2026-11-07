# Permanencia · Frontend

Frontend de la demo de **Permanencia**, la plataforma de acompañamiento universitario para
prevenir el abandono. Está construido con React 19, TypeScript, Vite, React Router y Recharts,
y consume el backend de demostración (`demo-backend`) que guarda 600 estudiantes de prueba en
memoria.

> Datos ficticios para presentaciones académicas. La autenticación es simplificada.

## Cuentas de la demo

| Cuenta                | Correo                             | Contraseña        |
| --------------------- | ---------------------------------- | ----------------- |
| Andrés Felipe (tú)    | `facb129@gmail.com`                | `Permanencia2026` |
| Docente (Esteban)     | `esteban@universidad.edu.co`       | `demo123`         |
| Coordinación (Camila) | `coordinacion@universidad.edu.co`  | `demo123`         |

## Cómo correr la demo

1. **Backend** (puerto 8080, sin base de datos):

   ```bash
   cd ../demo-backend
   sh mvnw spring-boot:run
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
- **Menú de usuario**: en la esquina superior, con la opción de cerrar sesión.

## Configuración

La URL del backend se define en `.env`:

```
VITE_API_URL=http://localhost:8080/api
```

## Scripts

- `npm run dev` — servidor de desarrollo en el puerto 5173.
- `npm run build` — verificación de tipos + build de producción en `dist/`.
- `npm run lint` — ESLint.
