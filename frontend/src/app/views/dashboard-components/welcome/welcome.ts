import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { MateriaService } from '../../../services/materia.service';
import { IMateria } from '../../../model/materia.model';

interface Noticia {
  fecha: string;
  hora: string;
  titulo: string;
  autor: string;
  contenido: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class Welcome implements OnInit {
  // Signals existentes
  materias = signal<IMateria[]>([]);
  noticias = signal<Noticia[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  userName = signal('Profesor');

  // NUEVOS: Signals para expand de materias
  expandedMaterias = signal(false);
  readonly itemsToShow = 3; // Mostrar 3 materias por defecto

  constructor(private materiaService: MateriaService) {}

  ngOnInit(): void {
    this.loadMaterias();
    this.loadNoticias();
  }

  private loadMaterias(): void {
    this.cargando.set(true);
    this.error.set(null);
    // CORREGIDO: cambié getMaterias() a obtenerMaterias()
    this.materiaService.obtenerMaterias().subscribe({
      next: (data: IMateria[]) => {
        this.materias.set(data);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando materias:', err);
        this.error.set('No se pudieron cargar las materias');
        this.cargando.set(false);
      }
    });
  }

  private loadNoticias(): void {
    // Simular carga de noticias o conectar a servicio real
    // Por ahora dejamos el array vacío
    this.noticias.set([
      {
        fecha: '20/08/2026',
        hora: '08:00',
        titulo: 'Inicio del ciclo lectivo',
        autor: 'Dirección',
        contenido: 'El ciclo lectivo comienza oficialmente el lunes 24 de agosto.'
      }
    ]);
  }

  // ============================================
  // NUEVOS GETTERS Y MÉTODOS PARA EXPAND
  // ============================================

  /**
   * Devuelve solo las materias visibles (3 por defecto, todas si está expandido)
   */
  get materiasVisibles(): IMateria[] {
    if (this.expandedMaterias()) {
      return this.materias();
    }
    return this.materias().slice(0, this.itemsToShow);
  }

  /**
   * Verifica si hay más materias que las que se muestran por defecto
   */
  get tieneMasMaterias(): boolean {
    return this.materias().length > this.itemsToShow;
  }

  /**
   * Toggle para expandir/contraer la lista de materias
   */
  toggleExpandMaterias(): void {
    this.expandedMaterias.update(value => !value);
  }
}