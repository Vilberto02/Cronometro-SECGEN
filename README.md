# Cronómetro

Este es un programa que ejecuta un cronómetro.

## Pasos para ejecutar tauri

1. Instalar Rust, Node.js y el cliente de Tauri.
2. Para Windows: Instalar Visual Studio Build Tolls y Microsoft Edge WebView2 Runtime
3. Iniciar Tauri dentro del proyecto con el comando `npx tauri init` 
4. Correr el proyecto en desarrollo con Tauri con el comando `npx tauri dev`
5. Llevar el proyecto a producción con el comando `npm run build`
6. Configurar el identifier en `tauri.conf`
7. Generar el ejecutable e instalador del proyecto con el comando `npx tauri build`

## Configurar next.conf

Para generar la carpeta `/out`.

```jsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

```