import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-step',
  templateUrl: './recipe-step.component.html',
  styleUrl: './recipe-step.component.scss',
  standalone: true,
})
export class RecipeStepComponent {
  @Input() stepHeader = '';
  @Input() steps: { desc: string; imagePath: string }[] = [];
}
