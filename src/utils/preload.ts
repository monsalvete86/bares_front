/**
 * Este módulo precarga los recursos críticos para mejorar el rendimiento inicial
 */

// Importamos todas las dependencias de Lucide React que usamos en la aplicación
import * as LucideIcons from 'lucide-react';

/**
 * Precarga los recursos y dependencias importantes
 */
export const preloadResources = async () => {
  // Precargar iconos para evitar pequeñas solicitudes múltiples
  console.log('Precargando recursos de iconos...');
  
  // En algunos navegadores, esto ayuda a que los recursos se carguen en caché
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Forzar que Lucide se cargue completamente al inicio
      Object.keys(LucideIcons).forEach(icon => {
        const IconComponent = (LucideIcons as any)[icon];
        if (typeof IconComponent === 'function') {
          // Crear elemento para asegurar que el código se evalúe
          const element = document.createElement('span');
          element.style.display = 'none';
          element.setAttribute('data-icon-preload', 'true');
          document.body.appendChild(element);
          setTimeout(() => element.remove(), 0);
        }
      });
    });
  }
};

// Iniciar precarga
preloadResources().catch(console.error);

export default preloadResources; 