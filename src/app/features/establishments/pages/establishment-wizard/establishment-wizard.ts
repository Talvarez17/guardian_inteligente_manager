import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StepId } from '../../models/establishment-wizard-model';
import { EstablishmentStepGeneral } from './steps/step-general/step-general';
import { EstablishmentStepContact } from './steps/step-contact/step-contact';
import { EstablishmentStepOperation } from './steps/step-operation/step-operation';
import { EstablishmentStepBilling } from './steps/step-billing/step-billing';
import { EstablishmentStepChecklist } from './steps/step-checklist/step-checklist';

@Component({
  selector: 'app-establishment-wizard',
  imports: [RouterLink, EstablishmentStepGeneral, EstablishmentStepContact, EstablishmentStepOperation, EstablishmentStepBilling, EstablishmentStepChecklist],
  templateUrl: './establishment-wizard.html',
})
export class EstablishmentWizard {
  private readonly router = inject(Router);

  readonly id = input<string>();
  readonly isEditMode = computed(() => !!this.id());

  readonly steps: { id: StepId; label: string; icon: string }[] = [
    { id: 'general', label: 'Datos generales', icon: 'store' },
    { id: 'contacto', label: 'Contacto', icon: 'call' },
    { id: 'operacion', label: 'Operación y riesgo', icon: 'security' },
    { id: 'facturacion', label: 'Facturación', icon: 'payments' },
    { id: 'checklist', label: 'Checklist operativo', icon: 'checklist' },
  ];

  readonly currentStep = signal<StepId>('general');
  readonly establishmentId = signal<string | null>(null);
  readonly canLeaveGeneral = computed(() => !!this.establishmentId());

  constructor() {
    effect(() => {
      const routeId = this.id();
      if (routeId && routeId !== this.establishmentId()) {
        this.establishmentId.set(routeId);
      }
    });
  }

  goToStep(step: StepId): void {
    if (step !== 'general' && !this.canLeaveGeneral()) {
      return;
    }
    this.currentStep.set(step);
  }

  onGeneralSaved(establishmentId: string): void {
    this.establishmentId.set(establishmentId);
    this.goToStep('contacto');
  }

  finish(): void {
    const establishmentId = this.establishmentId();
    if (!establishmentId) {
      this.router.navigate(['/establecimientos']);
      return;
    }
    this.router.navigate(['/establecimientos', establishmentId]);
  }

  cancel(): void {
    this.router.navigate(['/establecimientos']);
  }
}
