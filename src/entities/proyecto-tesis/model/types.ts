// Estado del proyecto, usado en el formulario de registro.
export type EstadoProyecto = "En Progreso" | "Completado" | "Suspendido";

// DTO para la creación de un proyecto. Coincide con los campos del formulario.
export interface CreateProyectoDto {
  titulo: string;
  descripcion: string;
  autores: string;
  tutor_docente: string;
  tecnologias_utilizadas: string;
  fecha_inicio: string;
  fecha_fin: string;
  repositorio_github: string;
  estado: EstadoProyecto;
  documento_url?: string | null;
}

// Interfaz principal de la entidad Proyecto, como se representa en la base de datos.
// Hereda los campos del DTO y añade el 'id' que es generado por la BD.
export interface Proyecto extends CreateProyectoDto {
  id: string;
}

// Alias para mantener consistencia si se usa en otras partes.
export type ProyectoTesis = Proyecto;
