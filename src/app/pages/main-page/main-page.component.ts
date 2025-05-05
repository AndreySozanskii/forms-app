import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsListComponent } from '@components/forms-list';

@Component({
  standalone: true,
  selector: 'app-main-page',
  imports: [FormsListComponent],
  templateUrl: './main-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {}
