import { Component, computed, inject, input, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { EstablishmentService } from '../../services/establishment.service';
import { DocumentsPanel } from '../../components/documents-panel/documents-panel';

@Component({
  selector: 'app-establishment-documents',
  imports: [RouterLink, DocumentsPanel],
  templateUrl: './establishment-documents.html',
})
export class EstablishmentDocuments {
  private readonly establishmentService = inject(EstablishmentService);

  readonly id = input.required<string>();

  private readonly panel = viewChild.required(DocumentsPanel);

  private readonly establishmentResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.establishmentService.findOne(params).pipe(catchError(() => of(null))),
  });
  readonly establishment = computed(() => this.establishmentResource.value());

  openCreate(): void {
    this.panel().openCreate();
  }
}
