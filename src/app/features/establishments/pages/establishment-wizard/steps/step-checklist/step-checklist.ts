import { Component, effect, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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
  readonly loadingChecklist = signal(false);

  private readonly loadExisting = effect(() => {
    const id = this.establishmentId();
    if (!id) return;

    this.loadingChecklist.set(true);
    this.checklistService.findChecklist(id).subscribe({
      next: (entries: EstablishmentChecklistEntry[]) => {
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
        this.loadingChecklist.set(false);
      },
      error: () => this.loadingChecklist.set(false),
    });
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
