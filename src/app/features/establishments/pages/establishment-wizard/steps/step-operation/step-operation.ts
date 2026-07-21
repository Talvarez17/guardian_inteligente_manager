import { Component, effect, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, of } from 'rxjs';
import { EstablishmentOperationService } from '../../../../services/establishment-operation.service';
import { EstablishmentRisk } from '../../../../models/establishment-model';
import { ESTABLISHMENT_RISK_LABELS, ESTABLISHMENT_RISK_OPTIONS } from '../../../../models/establishment-options';
import { UpsertEstablishmentOperationPayload } from '../../../../models/establishment-operation-model';
import { OperationModel } from '../../../../models/establishment-wizard-model';
import { positiveNumberSchema } from '../../../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../../../shared/utils/resolve-error-message';

function emptyOperationModel(): OperationModel {
  return {
    risk: EstablishmentRisk.LOW,
    risk_factor: '',
    gia: false,
    covia: false,
    ria: false,
    inactive_factor: '',
    cameras: 0,
    closing_date: '',
    install_date: '',
    real_install_date: '',
  };
}

@Component({
  selector: 'app-establishment-step-operation',
  imports: [FormField],
  templateUrl: './step-operation.html',
})
export class EstablishmentStepOperation {
  private readonly operationService = inject(EstablishmentOperationService);

  readonly establishmentId = input<string | null>(null);
  readonly saved = output<void>();
  readonly back = output<void>();

  readonly riskOptions = ESTABLISHMENT_RISK_OPTIONS;
  readonly riskLabels = ESTABLISHMENT_RISK_LABELS;

  readonly operationModel = signal<OperationModel>(emptyOperationModel());
  readonly operationForm = form(this.operationModel, (f) => {
    apply(f.cameras, positiveNumberSchema);
  });
  readonly savingOperation = signal(false);
  readonly operationError = signal<string | null>(null);

  private readonly existingOperationResource = rxResource({
    params: () => this.establishmentId() ?? undefined,
    stream: ({ params }) => this.operationService.findByEstablishment(params).pipe(catchError(() => of(null))),
  });

  private readonly syncOperationModel = effect(() => {
    const operation = this.existingOperationResource.value();
    if (!operation) return;
    this.operationModel.set({
      risk: operation.risk,
      risk_factor: operation.risk_factor ?? '',
      gia: operation.gia,
      covia: operation.covia,
      ria: operation.ria,
      inactive_factor: operation.inactive_factor ?? '',
      cameras: operation.cameras,
      closing_date: operation.closing_date ? String(operation.closing_date).slice(0, 10) : '',
      install_date: operation.install_date ? String(operation.install_date).slice(0, 10) : '',
      real_install_date: operation.real_install_date ? String(operation.real_install_date).slice(0, 10) : '',
    });
  });

  async save(): Promise<void> {
    const establishmentId = this.establishmentId();
    if (!establishmentId) return;

    await submit(this.operationForm, async () => {
      this.savingOperation.set(true);
      this.operationError.set(null);

      try {
        const model = this.operationModel();
        const payload: UpsertEstablishmentOperationPayload = {
          ...model,
          closing_date: model.closing_date || undefined,
          install_date: model.install_date || undefined,
          real_install_date: model.real_install_date || undefined,
        };
        await firstValueFrom(this.operationService.upsert(establishmentId, payload));
        this.saved.emit();
      } catch (error) {
        this.operationError.set(resolveErrorMessage(error));
      } finally {
        this.savingOperation.set(false);
      }
    });
  }
}
