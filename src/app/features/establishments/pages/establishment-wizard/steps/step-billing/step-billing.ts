import { Component, effect, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, of } from 'rxjs';
import { EstablishmentBillingService } from '../../../../services/establishment-billing.service';
import { EstablishmentCatalogsService } from '../../../../services/establishment-catalogs.service';
import { PaymentForm, PaymentMethod, UpsertEstablishmentBillingPayload } from '../../../../models/establishment-billing-model';
import { BillingModel } from '../../../../models/establishment-wizard-model';
import { requiredSelectSchema, strictlyPositiveNumberSchema } from '../../../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../../../shared/utils/resolve-error-message';

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

  readonly paymentMethods = toSignal(this.catalogs.getPaymentMethods(), { initialValue: [] as PaymentMethod[] });
  readonly paymentForms = toSignal(this.catalogs.getPaymentForms(), { initialValue: [] as PaymentForm[] });

  readonly billingModel = signal<BillingModel>({
    monthly_bill: 0,
    payment_method_id: '',
    payment_form_id: '',
  });
  
  readonly billingForm = form(this.billingModel, (f) => {
    apply(f.monthly_bill, strictlyPositiveNumberSchema);
    apply(f.payment_method_id, requiredSelectSchema);
    apply(f.payment_form_id, requiredSelectSchema);
  });
  
  readonly savingBilling = signal(false);
  readonly billingError = signal<string | null>(null);

  private readonly existingBillingResource = rxResource({
    params: () => this.establishmentId() ?? undefined,
    stream: ({ params }) => this.billingService.findByEstablishment(params).pipe(catchError(() => of(null))),
  });

  private readonly syncBillingModel = effect(() => {
    const billing = this.existingBillingResource.value();
    if (!billing) return;
    this.billingModel.set({
      monthly_bill: billing.monthly_bill,
      payment_method_id: String(billing.payment_method.id),
      payment_form_id: String(billing.payment_form.id),
    });
  });

  async save(): Promise<void> {
    const establishmentId = this.establishmentId();
    if (!establishmentId) return;

    await submit(this.billingForm, async () => {
      this.savingBilling.set(true);
      this.billingError.set(null);

      try {
        const payload: UpsertEstablishmentBillingPayload = {
          ...this.billingModel(),
          payment_method_id: Number(this.billingModel().payment_method_id),
          payment_form_id: Number(this.billingModel().payment_form_id),
        };
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
