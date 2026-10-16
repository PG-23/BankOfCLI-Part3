import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { Toast } from '../../shared/ui/toast/toast';
import { CurrentUserService } from '../../core/services/current.user.services';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [Navbar, Sidebar, RouterOutlet, Toast],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private currentUser = inject(CurrentUserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  readonly sidebarOpen = signal(false);

  logout(): void {
    this.closeSidebar();
    this.currentUser.setUser(null);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // adjust `.user()` to whatever your CurrentUserService exposes
  readonly userName = computed(() => {
    const u = this.currentUser.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  readonly userId = computed(() => this.currentUser.user()?.id ?? '');
  readonly userEmail = computed(() => this.currentUser.user()?.email ?? '');

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }
}