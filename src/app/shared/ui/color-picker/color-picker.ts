import { Component, ElementRef, afterNextRender, effect, model, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import iro from '@jaames/iro';

@Component({
  selector: 'app-color-picker',
  imports: [],
  templateUrl: './color-picker.html',
})
export class ColorPicker implements FormValueControl<string> {
  readonly value = model.required<string>();

  private readonly pickerContainer = viewChild.required<ElementRef<HTMLElement>>('pickerContainer');
  private colorPicker?: iro.ColorPicker;

  constructor() {
    afterNextRender(() => {
      this.colorPicker = iro.ColorPicker(this.pickerContainer().nativeElement, {
        width: 180,
        color: this.value(),
        layout: [
          { component: iro.ui.Wheel },
          { component: iro.ui.Slider, options: { sliderType: 'value' } },
        ],
      });

      this.colorPicker.on('color:change', (color: iro.Color) => {
        if (color.hexString !== this.value()) {
          this.value.set(color.hexString);
        }
      });
    });

    effect(() => {
      const next = this.value();
      if (this.colorPicker && this.colorPicker.color.hexString.toLowerCase() !== next.toLowerCase()) {
        this.colorPicker.color.hexString = next;
      }
    });
  }
}
