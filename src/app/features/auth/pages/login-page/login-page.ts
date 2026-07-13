import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormField, apply, form } from '@angular/forms/signals';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import gsap from 'gsap';
import { LoginModel } from '../../../../core/models/login-model';
import { emailSchema, passwordSchema } from '../../../../shared/forms/field-schemas';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [FormField, LottieComponent],
  templateUrl: './login-page.html',
})
export class LoginPage implements AfterViewInit {

  router = inject(Router);

  lottieOptions: AnimationOptions = {
    path: '/animations/loginLottie.json',
  };

  private loginCard = viewChild.required<ElementRef<HTMLElement>>('loginCard');
  private loginTitle = viewChild.required<ElementRef<HTMLElement>>('loginTitle');
  private loginFormEl = viewChild.required<ElementRef<HTMLElement>>('loginFormEl');
  private loginImage = viewChild.required<ElementRef<HTMLElement>>('loginImage');

  loginModel = signal<LoginModel>({
    email: '',
    password: ''
  })

  loginForm = form(this.loginModel, (f) => {
    apply(f.email, emailSchema);
    apply(f.password, passwordSchema);
  });


  ngAfterViewInit(): void {
    const tl = gsap.timeline();

    tl.from(this.loginCard().nativeElement, {
      y: -80,
      opacity: 0,
      scale: 0.9,
      duration: 0.9,
      ease: 'power3.out',
    });

    tl.from(this.loginTitle().nativeElement, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.4');

    tl.from(this.loginImage().nativeElement, {
      x: 60,
      opacity: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.6)',
    }, '-=0.6');
  }

  goto(){
    this.router.navigate(['/dashboard']);
  }

}
