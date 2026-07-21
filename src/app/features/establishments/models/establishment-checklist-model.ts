export interface ChecklistItemType {
  id: number;
  name: string;
  status: boolean;
}

export interface EstablishmentChecklistEntry {
  item_type: ChecklistItemType;
  completed: boolean;
  document_url: string | null;
  completed_at: string | null;
}
