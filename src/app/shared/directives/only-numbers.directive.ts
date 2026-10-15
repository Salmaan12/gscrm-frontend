import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumbers]'
})
export class OnlyNumbersDirective {

  @HostBinding('autocomplete')
  public autocomplete = 'off';

  @HostListener('keydown', ['$event'])
  public disableKeys(event: KeyboardEvent): void {

    const input = event.target as HTMLInputElement;
    const key = event.key;

    // Allow navigation/control keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(key)) {
      return;
    }

    // Allow Ctrl/Cmd + A, C, V, X
    if (
      (event.ctrlKey || event.metaKey) &&
      ['a', 'c', 'v', 'x'].includes(key.toLowerCase())
    ) {
      return;
    }

    // Allow numbers
    if (/^[0-9]$/.test(key)) {
      return;
    }

    // Allow only one decimal point
    if (key === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    // Block everything else
    event.preventDefault();
  }
}