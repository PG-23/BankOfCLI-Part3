import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private host = inject(ElementRef<HTMLElement>);

  readonly title = input('Bank of Airlines');
  readonly menuOpen = input(false);
  readonly userName = input('');
  readonly userId = input('');
  readonly userEmail = input('');
  readonly menuToggled = output<void>();
  readonly logoutRequested = output<void>();

  readonly userMenuOpen = signal(false);
  readonly initial = computed(() => this.userName().trim().charAt(0).toUpperCase() || '?');

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.logoutRequested.emit();
  }

  // close the dropdown when clicking anywhere outside the navbar, or pressing Escape
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.userMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.userMenuOpen.set(false);
  }
}