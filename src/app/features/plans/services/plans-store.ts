import { Injectable, signal } from '@angular/core';
import { PlanModel } from '../models/plan-model';
import { PLAN_FEATURE_CATALOG } from '../models/plan-options';

function featuresFor(included: string[]): PlanModel['features'] {
  return PLAN_FEATURE_CATALOG.map((label) => ({ label, included: included.includes(label) }));
}

@Injectable({ providedIn: 'root' })
export class PlansStore {
  readonly plans = signal<PlanModel[]>([
    {
      id: 'plan-bienvenida',
      name: 'Bienvenida',
      amount: 199,
      repeatEvery: 1,
      repeatUnit: 'Mensual',
      trialDays: 15,
      retryAttempts: 3,
      notes: 'Ideal para negocios pequeños que están comenzando.',
      features: featuresFor([
        'Conectividad con las autoridades',
        'Plataforma de monitoreo',
        'GIA (Aplicación de mensajería segura)',
      ]),
    },
    {
      id: 'plan-bienvenida-plus',
      name: 'Bienvenida Plus',
      amount: 299,
      repeatEvery: 1,
      repeatUnit: 'Mensual',
      trialDays: 0,
      retryAttempts: 3,
      notes: 'Para negocios en crecimiento que necesitan más respaldo.',
      features: featuresFor([
        'Conectividad con las autoridades',
        'Plataforma de monitoreo',
        'Almacenamiento de grabación',
        'GIA (Aplicación de mensajería segura)',
      ]),
    },
    {
      id: 'plan-premium',
      name: 'Premium',
      amount: 999,
      repeatEvery: 1,
      repeatUnit: 'Mensual',
      trialDays: 0,
      retryAttempts: 3,
      notes: 'Pensado para operaciones robustas con mayor exigencia.',
      features: featuresFor([
        'Conectividad con las autoridades',
        'Plataforma de monitoreo',
        'Almacenamiento de grabación',
        'Adhesión de software con biometría',
        'GIA (Aplicación de mensajería segura)',
      ]),
    },
    {
      id: 'plan-empresarial',
      name: 'Empresarial',
      amount: 3499,
      repeatEvery: 1,
      repeatUnit: 'Mensual',
      trialDays: 0,
      retryAttempts: 3,
      notes: 'Cobertura completa para corporativos y cadenas.',
      features: featuresFor(PLAN_FEATURE_CATALOG),
    },
  ]);

  getById(id: string): PlanModel | undefined {
    return this.plans().find((item) => item.id === id);
  }

  add(plan: PlanModel): void {
    this.plans.update((items) => [...items, plan]);
  }

  update(id: string, changes: Omit<PlanModel, 'id'>): void {
    this.plans.update((items) => items.map((item) => (item.id === id ? { ...changes, id } : item)));
  }

  remove(id: string): void {
    this.plans.update((items) => items.filter((item) => item.id !== id));
  }
}
