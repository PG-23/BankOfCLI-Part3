import { Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarLink {
  label: string;
  path: string;
  icon: string;
  enabled: boolean; // set to true when the page and its route exist
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly open = input(false);
  readonly userName = input('');
  readonly closeRequested = output<void>();

  readonly links = input<SidebarLink[]>([
    { path: '/dashboard',    label: 'Dashboard',    icon: 'images/casa.png',         enabled: true },
    { path: '/profile',      label: 'Profile',      icon: 'images/profile.PNG',      enabled: true },
    { path: '/transactions', label: 'Transactions', icon: 'images/transaction.png', enabled: true },
    { path: '/help',         label: 'Help',         icon: 'images/help.png',         enabled: true },
  ]);

  readonly initial = computed(() => this.userName().trim().charAt(0).toUpperCase() || '?');
}