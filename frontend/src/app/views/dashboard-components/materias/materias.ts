import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IMateria } from '../../../model/materia.model';
import { MateriaService } from '../../../services/materia.service';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class Materias implements OnInit {

  materias = signal<IMateria[]>([]);

  cargando = signal(false);

  error = signal<string | null>(null);

  private readonly colores = [
    'bg-red-300',
    'bg-blue-300',
    'bg-green-300',
    'bg-yellow-300',
    'bg-purple-300',
    'bg-pink-300',
    'bg-teal-300'
  ];

  constructor(
    private readonly materiaService: MateriaService
  ) {}

  ngOnInit(): void {
    this.cargarMaterias();
  }

  private cargarMaterias(): void {
    this.cargando.set(true);
    this.error.set(null);

    const estudianteId = this.obtenerEstudianteId();

    /*
     * Si existe el ID del estudiante utilizamos el endpoint
     * específico que ya tenemos disponible.
     *
     * Si todavía no está disponible desde el login, usamos
     * obtenerMaterias() como fallback para no romper la vista
     * mientras termina la integración de autenticación.
     */
    if (estudianteId !== null) {

      this.materiaService
        .cargarMateriasDisponiblesParaEstudiante(estudianteId)
        .subscribe({
          next: (data: IMateria[]) => {
            this.materias.set(data);
            this.cargando.set(false);
          },

          error: (err) => {
            console.error(
              'Error cargando materias del estudiante:',
              err
            );

            this.error.set(
              'No se pudieron cargar tus materias.'
            );

            this.cargando.set(false);
          }
        });

      return;
    }

    /*
     * Fallback temporal:
     * si todavía no tenemos disponible el ID del estudiante
     * desde el sistema de autenticación, usamos el endpoint
     * general de materias.
     */
    this.materiaService.obtenerMaterias().subscribe({
      next: (data: IMateria[]) => {
        this.materias.set(data);
        this.cargando.set(false);
      },

      error: (err) => {
        console.error(
          'Error cargando materias:',
          err
        );

        this.error.set(
          'No se pudieron cargar las materias.'
        );

        this.cargando.set(false);
      }
    });
  }

  obtenerColor(index: number): string {
    return this.colores[index % this.colores.length];
  }

  obtenerPath(materia: IMateria): string[] {
    if (materia.id === undefined || materia.id === null) {
      return ['/dashboard/materias'];
    }

    return [
      '/view-materia',
      materia.id.toString(),
      'portada'
    ];
  }

  private obtenerEstudianteId(): number | null {

    const claves = [
      'usuario',
      'user',
      'usuarioLogueado',
      'userData',
      'currentUser'
    ];

    for (const clave of claves) {

      const valor = localStorage.getItem(clave);

      if (!valor) {
        continue;
      }

      try {

        const usuario = JSON.parse(valor);

        const id =
          usuario?.id ??
          usuario?.usuario?.id ??
          usuario?.user?.id ??
          usuario?.estudiante?.id ??
          usuario?.estudiante_id;

        if (id !== undefined && id !== null) {
          const numeroId = Number(id);

          if (!Number.isNaN(numeroId)) {
            return numeroId;
          }
        }

      } catch {

        const numeroId = Number(valor);

        if (!Number.isNaN(numeroId)) {
          return numeroId;
        }
      }
    }

    return null;
  }
}