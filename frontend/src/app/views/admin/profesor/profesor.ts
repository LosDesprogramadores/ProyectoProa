import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterModule} from '@angular/router';
import { IPersona, Persona, RolId } from '../../../model/Persona.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfesorService } from '../../../services/profesor.service';
import { IMateria, IMateriaAsignacion } from '../../../model/materia.model';
import { MateriaService } from '../../../services/materia.service';


@Component({
  selector: 'app-profesor',
  imports: [ReactiveFormsModule,RouterModule, CommonModule],
  templateUrl: './profesor.html',
  styleUrl: './profesor.css',
})
export class Profesor implements OnInit {
private fb = inject(FormBuilder);
private materiaService = inject(MateriaService);
private profesorService = inject(ProfesorService)
profesores = signal<Persona[]>([])
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  selectedId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  docenteParaAsignar = signal<Persona | null>(null);
materiasDisponibles = signal<IMateria[]>([]);
selectedMateriaIds = signal<number[]>([]);
isLoadingMaterias = signal<boolean>(false);


  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.minLength(7)]],
    email: ['', [Validators.required, Validators.email]],
    fecha_nacimiento: ['', [Validators.required]],
    tel_contacto: ['']
  });

 
  ngOnInit(): void {
     this.cargarProfesores()
  }

  cargarProfesores():void{
      this.isLoading.set(true);
    this.profesorService.obtenerProfesores().subscribe({
      next : (data) => {this.profesores.set(data);
          this.isLoading.set(false);
            console.log(data)},
      error: (err) => {console.error('Error al cargar profesores:', err )
        this.isLoading.set(false);
      }
      })
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedId.set(null);
    this.form.reset();
    this.isModalOpen.set(true);
  }

  openEditModal(profesores: Persona): void {
    this.isEditing.set(true);
    this.selectedId.set(profesores.id);
    this.form.patchValue(profesores);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
         this.form.markAllAsTouched();
         return;
       }
       const formValues = this.form.getRawValue();
   
       if (this.isEditing() && this.selectedId()) {
        const estudianteActualizado: Persona = {
         ...formValues,
         id: this.selectedId()!
       };
      
     } else {
     
       const nuevoProfesor: IPersona = {
         ...formValues,
         rol: RolId.PROFESOR 
       };
   
       this.profesorService.crearProfesores(nuevoProfesor).subscribe({
         next: (res: Persona) => {
           console.log('Profesor creado con éxito:', res);
           this.profesores.update(lista => [...lista, res]);
           this.closeModal();
         },
         error: (err) => {
           console.error('Error al registrar el profesor:', err);
         }
       });
     }
      this.closeModal();
}
 eliminar(id: number): void {
  //   if (confirm('¿Deseas eliminar este estudiante?')) {
  //     this.students.update(lista => lista.filter(item => item.id !== id));
  //   }
  }

  asignar(docente: Persona): void {
    console.log('Asignando materias al docente:', docente);
    this.docenteParaAsignar.set(docente);
    this.selectedMateriaIds.set([]);
    this.isLoadingMaterias.set(true);

    this.materiaService.cargarMateriasQueNoTengaElProfesor(this.docenteParaAsignar()!.id).subscribe({
      next: (materias) => {
        this.materiasDisponibles.set(materias);
        this.isLoadingMaterias.set(false);
      },
      error: (err) => {
        console.error('Error al cargar materias:', err);
        this.isLoadingMaterias.set(false);
      }
    });
  }

   consultar(profesor: Persona): void {
   
  }

  guardarAsignacion(): void {
  const docente = this.docenteParaAsignar();
  const ids = this.selectedMateriaIds();

  if (!docente || ids.length === 0) return;
this.materiaService.asignarProfesorAMaterias(docente.id, ids).subscribe({
    next: (res) => {
      console.log('Asignación completada:', res);
      this.cerrarModalAsignar();
  
    },
    error: (err) => {
      console.error('Error al asignar materias al profesor:', err);
    }
  });
}

cerrarModalAsignar(): void {
  this.docenteParaAsignar.set(null);
  this.selectedMateriaIds.set([]);
}


toggleMateria(id: number | undefined): void {
  if (!id) return;
  this.selectedMateriaIds.update(current =>
    current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  );
}

isMateriaSelected(id: number | undefined): boolean {
  return id ? this.selectedMateriaIds().includes(id) : false;
}

seleccionarTodasMaterias(): void {
  const todas = this.materiasDisponibles();
  const idsValidos = todas
    .map(m => m.id)
    .filter((id): id is number => id !== undefined);

  if (this.selectedMateriaIds().length === idsValidos.length) {
    this.selectedMateriaIds.set([]);
  } else {
    this.selectedMateriaIds.set(idsValidos);
  }
}

}



