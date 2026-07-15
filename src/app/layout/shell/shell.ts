import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidemenu } from '../sidemenu/sidemenu';

@Component({
  selector: 'app-shell',
  imports: [Sidemenu, RouterOutlet],
  templateUrl: './shell.html',
})
export class Shell {
  readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
