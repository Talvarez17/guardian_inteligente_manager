import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, of } from 'rxjs';
import { EstablishmentChecklistService } from '../../../../services/establishment-checklist.service';
import { EstablishmentChecklistEntry } from '../../../../models/establishment-checklist-model';
import { ChecklistRowState } from '../../../../models/establishment-wizard-model';
import { resolveErrorMessage } from '../../../../../../shared/utils/resolve-error-message';

@Component({
  selector: 'app-establishment-step-checklist',
  templateUrl: './step-checklist.html',
})
export class EstablishmentStepChecklist {
  
  private readonly checklistService = inject(EstablishmentChecklistService);

  readonly establishmentId = input<string | null>(null);
  readonly back = output<void>();
  readonly finish = output<void>();

  readonly checklistRows = signal<ChecklistRowState[]>([]);

  private readonly existingChecklistResource = rxResource({
    params: () => this.establishmentId() ?? undefined,
    defaultValue: [] as EstablishmentChecklistEntry[],
    stream: ({ params }) =>
      this.checklistService.findChecklist(params).pipe(catchError(() => of([] as EstablishmentChecklistEntry[]))),
  });
  readonly loadingChecklist = computed(() => this.existingChecklistResource.isLoading());

  private readonly syncChecklistRows = effect(() => {
    const entries = this.existingChecklistResource.value();
    this.checklistRows.set(
      entries.map((entry) => ({
        item_type: entry.item_type,
        completed: entry.completed,
        document_url: entry.document_url,
        file: null,
        saving: false,
        error: null,
      })),
    );
  });

  onChecklistFileSelected(row: ChecklistRowState, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.checklistRows.update((rows) =>
      rows.map((r) => (r.item_type.id === row.item_type.id ? { ...r, file } : r)),
    );
  }

  toggleChecklistCompleted(row: ChecklistRowState): void {
    this.checklistRows.update((rows) =>
      rows.map((r) => (r.item_type.id === row.item_type.id ? { ...r, completed: !r.completed } : r)),
    );
  }

  async saveChecklistItem(row: ChecklistRowState): Promise<void> {
    const establishmentId = this.establishmentId();
    if (!establishmentId) return;

    this.checklistRows.update((rows) =>
      rows.map((r) => (r.item_type.id === row.item_type.id ? { ...r, saving: true, error: null } : r)),
    );

    try {
      const entry = await firstValueFrom(
        this.checklistService.upsertItem(establishmentId, row.item_type.id, row.completed, row.file ?? undefined),
      );
      this.checklistRows.update((rows) =>
        rows.map((r) =>
          r.item_type.id === row.item_type.id
            ? { ...r, completed: entry.completed, document_url: entry.document_url, file: null, saving: false }
            : r,
        ),
      );
    } catch (error) {
      this.checklistRows.update((rows) =>
        rows.map((r) =>
          r.item_type.id === row.item_type.id ? { ...r, saving: false, error: resolveErrorMessage(error) } : r,
        ),
      );
    }
  }
}
