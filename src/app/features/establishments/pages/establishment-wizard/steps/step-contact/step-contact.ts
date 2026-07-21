import { Component, effect, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, of } from 'rxjs';
import { EstablishmentContactService } from '../../../../services/establishment-contact.service';
import { EstablishmentCatalogsService } from '../../../../services/establishment-catalogs.service';
import { ClientRole, UpsertEstablishmentContactPayload } from '../../../../models/establishment-contact-model';
import { ContactModel } from '../../../../models/establishment-wizard-model';
import { emailSchema, phoneSchema, requiredTextSchema } from '../../../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../../../shared/utils/resolve-error-message';

function emptyContactModel(): ContactModel {
  return { contact_role_id: 0, contact_name: '', contact_number: '', contact_email: '' };
}

@Component({
  selector: 'app-establishment-step-contact',
  imports: [FormField],
  templateUrl: './step-contact.html',
})
export class EstablishmentStepContact {
  private readonly contactService = inject(EstablishmentContactService);
  private readonly catalogs = inject(EstablishmentCatalogsService);

  readonly establishmentId = input<string | null>(null);
  readonly saved = output<void>();
  readonly back = output<void>();

  readonly clientRoles = toSignal(this.catalogs.getClientRoles(), { initialValue: [] as ClientRole[] });

  readonly contactModel = signal<ContactModel>(emptyContactModel());
  readonly contactForm = form(this.contactModel, (f) => {
    apply(f.contact_name, requiredTextSchema);
    apply(f.contact_number, phoneSchema);
    apply(f.contact_email, emailSchema);
  });
  readonly contactRoleTouched = signal(false);
  readonly savingContact = signal(false);
  readonly contactError = signal<string | null>(null);

  private readonly existingContactResource = rxResource({
    params: () => this.establishmentId() ?? undefined,
    stream: ({ params }) => this.contactService.findByEstablishment(params).pipe(catchError(() => of(null))),
  });

  private readonly syncContactModel = effect(() => {
    const contact = this.existingContactResource.value();
    if (!contact) return;
    this.contactModel.set({
      contact_role_id: contact.contact_role.id,
      contact_name: contact.contact_name,
      contact_number: contact.contact_number,
      contact_email: contact.contact_email,
    });
  });

  onContactRoleChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.contactModel.update((m) => ({ ...m, contact_role_id: value }));
    this.contactRoleTouched.set(true);
  }

  async save(): Promise<void> {
    const establishmentId = this.establishmentId();
    if (!establishmentId) return;

    await submit(this.contactForm, async () => {
      this.contactRoleTouched.set(true);
      if (this.contactModel().contact_role_id === 0) {
        return;
      }

      this.savingContact.set(true);
      this.contactError.set(null);

      try {
        const payload: UpsertEstablishmentContactPayload = this.contactModel();
        await firstValueFrom(this.contactService.upsert(establishmentId, payload));
        this.saved.emit();
      } catch (error) {
        this.contactError.set(resolveErrorMessage(error));
      } finally {
        this.savingContact.set(false);
      }
    });
  }
}
