import { supabase } from "@shared/api/supabase";
import type { CreateProyectoDto, ProyectoTesis, UpdateProyectoDto } from "../model/types";

const TABLE = "proyectos_tesis";

export const proyectoApi = {
  /** Obtiene todos los proyectos ordenados por fecha de creación */
  async getAll(): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[proyectoApi.getAll]", error.message);
      throw new Error(error.message);
    }
    return data ?? [];
  },

  /** Obtiene un proyecto por su ID */
  async getById(id: string): Promise<ProyectoTesis> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /** Actualiza un proyecto existente */
  async update(id: string, data: UpdateProyectoDto): Promise<ProyectoTesis> {
    // Construir el payload limpiando valores vacíos
    const payload: Record<string, any> = {};

    if (data.titulo !== undefined) payload.titulo = data.titulo;
    if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
    if (data.autores !== undefined) payload.autores = data.autores;
    if (data.tutor_docente !== undefined) payload.tutor_docente = data.tutor_docente;
    if (data.tecnologias_utilizadas !== undefined) payload.tecnologias_utilizadas = data.tecnologias_utilizadas;
    if (data.fecha_inicio !== undefined) payload.fecha_inicio = data.fecha_inicio;
    
    // Solo incluir fecha_fin si tiene valor
    if (data.fecha_fin !== undefined) {
      if (data.fecha_fin && data.fecha_fin.trim()) {
        payload.fecha_fin = data.fecha_fin.trim();
      } else {
        payload.fecha_fin = null;
      }
    }
    
    // Solo incluir repositorio_github si tiene valor
    if (data.repositorio_github !== undefined) {
      if (data.repositorio_github && data.repositorio_github.trim()) {
        payload.repositorio_github = data.repositorio_github.trim();
      } else {
        payload.repositorio_github = null;
      }
    }
    
    if (data.estado !== undefined) payload.estado = data.estado;

    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("[proyectoApi.update]", error.message);
      throw new Error(error.message);
    }

    return updated;
  },

  /** Elimina un proyecto por su ID */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error("[proyectoApi.delete]", error.message);
      throw new Error(error.message);
    }
  },

  /** Crea un nuevo proyecto de tesis */
  async create(dto: CreateProyectoDto): Promise<ProyectoTesis> {
    const payload: CreateProyectoDto = { ...dto };

    // Evita enviar strings vacios a columnas opcionales (ej. fecha/date).
    if (!payload.fecha_fin?.trim()) delete payload.fecha_fin;
    if (!payload.repositorio_github?.trim()) delete payload.repositorio_github;

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[proyectoApi.create]", error.message);
      throw new Error(error.message);
    }
    return data;
  },

  /** Busca proyectos por título o autor */
  async search(query: string): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .or(`titulo.ilike.%${query}%,autores.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};