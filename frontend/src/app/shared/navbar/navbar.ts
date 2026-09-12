import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/auth/auth.model';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast.service';
import { RolId } from '../../model/Persona.model';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule, Toast],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  currentUser = this.authService.currentUser
  loading = signal<boolean>(true);
  isMobileMenuOpen = signal<boolean>(false);
  isProfileMenuOpen = signal<boolean>(false);
  isProfileModalOpen = signal<boolean>(false);
  unreadCount = signal<number>(4);
  navLinksAdmi: NavLink[] = [];
  userAvatar = signal<string>('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

  navLinks = [
    { label: 'Materias', path: '/materias' },
    { label: 'Foros', path: '/foros' },
    { label: 'Actividades', path: '/actividades' }
   ];
 userName = computed(() => {
    
    const persona = this.currentUser()?.persona;;
    if (!persona) return 'invitado';
    return `${persona.nombre} ${persona.apellido}`;
  });
   
  roleName = computed(() => {
    const user = this.currentUser();
    const rolId = user?.rolId ?? user?.persona?.rolId;

    switch (rolId) {
      case RolId.ADMINISTRADOR:
      case UserRole.ADMIN:
        return 'Administrador';
      case RolId.PROFESOR:
        return 'Profesor';
      case RolId.ESTUDIANTE:
        return 'Estudiante';
      default:
        return 'Usuario';
    }
  });

 constructor() {
    effect(() => {
      const user = this.currentUser();
      if (!user) {
        this.navLinksAdmi = [];
        return;
      }

      switch (user.rolId) {
        case UserRole.ADMIN:
          this.navLinksAdmi = [
            { label: 'Profesores', path: 'admin/profesores' },
            { label: 'Estudiantes', path: 'admin/estudiantes' },
            { label: 'Materias', path: 'admin/materias' }
          ];
          break;

        default:
          console.warn('Rol no reconocido:', user.rolId);
          this.navLinksAdmi = [];
          break;
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(v => !v);
  }

  closeMenus(): void {
    this.isMobileMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  openProfileModal(): void {
    this.closeMenus();
    this.isProfileModalOpen.set(true);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
  }

  logout(): void {
    this.closeMenus();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-button') && !target.closest('#user-menu-dropdown')) {
      this.isProfileMenuOpen.set(false);
    }
  }

  configuracion(): void {
  this.closeMenus();
  const persona = this.currentUser()?.persona;

  if (persona) {
    this.toastService.info(`Configuración para ${persona.nombre}: en desarrollo`);
  } else {
    this.toastService.info('Configuración: en desarrollo');
  }
}
}