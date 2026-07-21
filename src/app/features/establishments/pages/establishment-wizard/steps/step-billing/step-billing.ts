import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, of } from 'rxjs';
import { EstablishmentBillingService } from '../../../../services/establishment-billing.service';
import { EstablishmentCatalogsService } from '../../../../services/establishment-catalogs.service';
import { PaymentForm, PaymentMethod, UpsertEstablishmentBillingPayload } from '../../../../models/establishment-billing-model';
import { BillingModel } from '../../../../models/establishment-wizard-model';
import { strictlyPositiveNumberSchema } from '../../../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../../../shared/utils/resolve-error-message';

function emptyBillingModel(): BillingModel {
  return { monthly_bill: 0, payment_method_id: 0, payment_form_id: 0 };
}

@Component({
  selector: 'app-establishment-step-billing',
  imports: [FormField],
  templateUrl: './step-billing.html',
})
export class EstablishmentStepBilling {
  private readonly billingService = inject(EstablishmentBillingService);
  private readonly catalogs = inject(EstablishmentCatalogsService);

  readonly establishmentId = input<string | null>(null);
  readonly saved = output<void>();
  readonly back = output<void>();

  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly paymentForms = signal<PaymentForm[]>([]);

  readonly billingModel = signal<BillingModel>(emptyBillingModel());
  readonly billingForm = form(this.billingModel, (f) => {
    apply(f.monthly_bill, strictlyPositiveNumberSchema);
  });
  readonly paymentMethodTouched = signal(false);
  readonly paymentFormTouched = signal(false);
  readonly savingBilling = signal(false);
  readonly billingError = signal<string | null>(null);

  private readonly loadExisting = effect(() => {
    const id = this.establishmentId();
    if (!id) return;

    this.billingService
      .findByEstablishment(id)
      .pipe(catchError(() => of(null)))
      .subscribe((billing) => {
        if (!billing) return;
        this.billingModel.set({
          monthly_bill: billing.monthly_bill,
          payment_method_id: billing.payment_method.id,
          payment_form_id: billing.payment_form.id,
        });
      });
  });

  constructor() {
    this.catalogs.getPaymentMethods().subscribe((methods) => this.paymentMethods.set(methods));
    this.catalogs.getPaymentForms().subscribe((forms) => this.paymentForms.set(forms));
  }

  onPaymentMethodChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.billingModel.update((m) => ({ ...m, payment_method_id: value }));
    this.paymentMethodTouched.set(true);
  }

  onPaymentFormChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.billingModel.update((m) => ({ ...m, payment_form_id: value }));
    this.paymentFormTouched.set(true);
  }

  async save(): Promise<void> {
    const establishmentId = this.establishmentId();
    if (!establishmentId) return;

    await submit(this.billingForm, async () => {

      this.paymentMethodTouched.set(true);
      this.paymentFormTouched.set(true);
      
      if (this.billingModel().payment_method_id === 0 || this.billingModel().payment_form_id === 0) {
        return;
      }

      this.savingBilling.set(true);
      this.billingError.set(null);

      try {
        const payload: UpsertEstablishmentBillingPayload = this.billingModel();
        await firstValueFrom(this.billingService.upsert(establishmentId, payload));
        this.saved.emit();
      } catch (error) {
        this.billingError.set(resolveErrorMessage(error));
      } finally {
        this.savingBilling.set(false);
      }
    });
  }
}
