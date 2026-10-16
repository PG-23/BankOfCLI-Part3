import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [FormsModule],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly type = input<'text' | 'password' | 'email' | 'number' | 'search'>('text');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly id = input(`input-${Math.floor(Math.random() * 1_000_000)}`);
  readonly value = model('');
}
