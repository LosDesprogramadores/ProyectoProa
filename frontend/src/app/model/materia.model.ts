export interface Materia {
    nombre: string;
    color: string;
    path: string;
}

export interface IMateria {
  id?: number;
  titulo: string;
  descripcion?: string | null;
  criterios_evaluacion?: string | null;
  anio: number;
  curso: string;
  profesor_id?: number | null;
}

export interface IMateriaAsignacion {
  profesor_id: number;
  materia_ids: number[];
}

