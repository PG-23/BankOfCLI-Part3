import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { Toast } from '../../shared/ui/toast/toast';
import { CurrentUserService } from '../../core/services/current.user.services';

@Component({
  selector: 'app-shell',
  imports: [Navbar, Sidebar, RouterOutlet, Toast],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private currentUser = inject(CurrentUserService);

  readonly sidebarOpen = signal(false); // starts closed, like the Figma

  // NOTE: adjust `.user()` to whatever Gbolahan's CurrentUserService exposes
  readonly userName = computed(() => {
    const u = this.currentUser.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  readonly userId = computed(() => this.currentUser.user()?.id ?? '');

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