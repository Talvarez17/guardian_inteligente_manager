import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [],
  templateUrl: './confirm-delete-modal.html',
})
export class ConfirmDeleteModal {
  readonly title = input('Confirmar acción');
  readonly actionLabel = input('dar de baja');
  readonly confirmWord = input('ELIMINAR');

  readonly confirmed = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly entityLabel = signal('');
  readonly typedValue = signal('');

  readonly isMatch = computed(
    () => this.typedValue().trim().toUpperCase() === this.confirmWord().trim().toUpperCase(),
  );

  open(entityLabel: string): void {
    this.entityLabel.set(entityLabel);
    this.typedValue.set('');
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onInput(event: Event): void {
    this.typedValue.set((event.target as HTMLInputElement).value);
  }

  confirm(): void {
    if (!this.isMatch()) return;
    this.close();
    this.confirmed.emit();
  }
}
