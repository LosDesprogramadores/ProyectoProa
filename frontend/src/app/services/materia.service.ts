import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMateria, Materia } from '../model/materia.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}materias/`;

  obtenerMaterias(): Observable<IMateria[]> {
    return this.http.get<IMateria[]>(this.baseUrl);
  }

  obtenerMateriaPorId(id: number): Observable<IMateria> {
    return this.http.get<IMateria>(`${this.baseUrl}${id}/`);
  }

  crearMateria(materia: IMateria): Observable<IMateria> {
    return this.http.post<IMateria>(this.baseUrl, materia);
  }

  cargarMateriasQueNoTengaElProfesor(
    profesorId: number
  ): Observable<IMateria[]> {
    return this.http.get<IMateria[]>(
      `${this.baseUrl}?excluir_profesor=${profesorId}`
    );
  }

  actualizarMateria(
    id: number,
    materia: IMateria
  ): Observable<IMateria> {
    return this.http.put<IMateria>(
      `${this.baseUrl}${id}/`,
      materia
    );
  }

  eliminarMateria(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${id}/`
    );
  }

  asignarProfesorAMaterias(
    profesorId: number,
    materiaIds: number[]
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}asignar-profesor/`,
      {
        profesor_id: profesorId,
        materia_ids: materiaIds
      }
    );
  }

  obtenerMateriasPorProfesor(
    profesorId: number
  ): Observable<IMateria[]> {
    return this.http.get<IMateria[]>(
      `${this.baseUrl}?profesor=${profesorId}`
    );
  }

  cargarMateriasDisponiblesParaEstudiante(
    estudianteId: number
  ): Observable<IMateria[]> {
    return this.http.get<IMateria[]>(
      `${this.baseUrl}?disponibles_estudiante=${estudianteId}`
    );
  }

  inscribirEstudianteEnMaterias(
    estudianteId: number,
    materiaIds: number[]
  ): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}inscripciones/inscribir/`,
      {
        estudiante_id: estudianteId,
        materia_ids: materiaIds
      }
    );
  }
}