import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input('8px');
  readonly lines = input(1);
  readonly lineIndexes = computed(() => Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i));
}
