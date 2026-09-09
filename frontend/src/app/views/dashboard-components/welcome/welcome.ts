import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { Noticia } from '../../../model/noticia.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { MateriaService } from '../../../services/materia.service';
import { IMateria } from '../../../model/materia.model';

@Component({
  selector: 'app-welcome',
  imports: [RouterModule, CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit {
  private authService = inject(AuthService);
  private materiaService = inject(MateriaService);
  private currentUser = this.authService.currentUser;

  userName = computed(() => {
    const persona = this.currentUser()?.persona;
    if (!persona) return 'Invitado';
    return `${persona.nombre}`;
  });

  noticias = signal<Noticia[]>([
    {
      titulo: 'Inicio del ciclo lectivo',
      autor: 'Dirección',
      fecha: '20/08/2026',
      hora: '08:00',
      contenido: 'El ciclo lectivo comienza oficialmente el lunes 24 de agosto.'
    },
    {
      titulo: 'Taller de Robótica',
      autor: 'Profesor Gómez',
      fecha: '19/08/2026',
      hora: '15:30',
      contenido: 'Se dictará un taller de robótica para alumnos de 5° año en el laboratorio.'
    }
  ]);

  // Signals para materias del backend (usar IMateria)
  materias = signal<IMateria[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMaterias();
  }

  private cargarMaterias(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.materiaService.obtenerMaterias().subscribe({
      next: (data) => {
        this.materias.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener materias:', err);
        this.error.set('No se pudieron cargar las materias');
        this.cargando.set(false);
      }
    });
  }
}