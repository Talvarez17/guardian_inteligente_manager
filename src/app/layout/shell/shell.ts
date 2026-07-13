import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidemenu } from '../sidemenu/sidemenu';

@Component({
  selector: 'app-shell',
  imports: [Sidemenu, RouterOutlet],
  templateUrl: './shell.html',
})
export class Shell {}
