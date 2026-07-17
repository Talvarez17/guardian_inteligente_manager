import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import gsap from 'gsap';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginModel } from '../../../../core/models/login-model';
import { emailSchema, passwordSchema } from '../../../../shared/forms/field-schemas';

@Component({
  selector: 'app-login-page',
  imports: [FormField, LottieComponent],
  templateUrl: './login-page.html',
})
export class LoginPage implements AfterViewInit {

  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  router = inject(Router);

  lottieOptions: AnimationOptions = {
    path: '/animations/loginLottie.json',
  };

  private loginCard = viewChild.required<ElementRef<HTMLElement>>('loginCard');
  private loginTitle = viewChild.required<ElementRef<HTMLElement>>('loginTitle');
  private loginImage = viewChild.required<ElementRef<HTMLElement>>('loginImage');

  loginModel = signal<LoginModel>({
    email: '',
    password: ''
  })

  loginForm = form(this.loginModel, (f) => {
    apply(f.email, emailSchema);
    apply(f.password, passwordSchema);
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);


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

  async login(): Promise<void> {

    await submit(this.loginForm, async () => {

      this.loading.set(true);
      this.errorMessage.set(null);

      try {
        await firstValueFrom(this.auth.login(this.loginModel()));
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      } 
      catch (error) {
        this.errorMessage.set(this.resolveErrorMessage(error));
      } 
      finally {
        this.loading.set(false);
      }
    });
  }

  private resolveErrorMessage(error: unknown): string {

    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      
      if (Array.isArray(message)) {
        return message[0];
      }
      if (typeof message === 'string') {
        return message;
      }
    }
    return 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
  }

}
