import { Component, computed, inject, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Theme } from '../../core/services/theme';
import { SidemenuItemModel } from '../../core/models/sidemenu-item-model';

@Component({
  selector: 'app-sidemenu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidemenu.html',
})
export class Sidemenu {
  private readonly themeService = inject(Theme);

  readonly closeMobile = output<void>();

  readonly collapsed = signal(false);
  readonly theme = this.themeService.current;
  readonly isDark = computed(() => this.theme() === 'pro-dark');

  readonly menuItems: SidemenuItemModel[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'establecimientos', label: 'Establecimientos', icon: 'group' },
    { key: 'planes', label: 'Planes', icon: 'diamond' },
    { key: 'cobranza', label: 'Cobranza', icon: 'calendar_month' },
    { key: 'reportes', label: 'Reportes', icon: 'pie_chart' },
    { key: 'gestion', label: 'Gestión', icon: 'settings' },
  ];

  toggleCollapse(): void {
    this.collapsed.update((value) => !value);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  onNavigate(): void {
    this.closeMobile.emit();
  }
}
