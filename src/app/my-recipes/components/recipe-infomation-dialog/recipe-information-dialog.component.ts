import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatFabButton, MatMiniFabButton } from '@angular/material/button';
import { RecipeStepComponent } from '../recipe-step/recipe-step.component';

@Component({
  selector: 'app-recipe-infomation-dialog',
  standalone: true,
  imports: [
    MatIcon,
    MatChipSet,
    MatChip,
    MatFabButton,
    MatMiniFabButton,
    RecipeStepComponent,
  ],
  templateUrl: './recipe-information-dialog.component.html',
  styleUrl: './recipe-information-dialog.component.scss',
})
export class RecipeInformationDialogComponent {
  instructions = [
    {
      stepHeader: 'Soak the meat in cold water for 30 min.',
      steps: [
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vel ipsum quam. Morbi rhoncus nunc urna, nec gravida tortor tristique eu. Proin ultrices condimentum turpis, efficitur sollicitudin nulla rutrum et.',
          imagePath: '',
        },
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vel ipsum quam. Morbi rhoncus nunc urna, nec gravida tortor tristique eu. Proin ultrices condimentum turpis, efficitur sollicitudin nulla rutrum et.',
          imagePath: '',
        },
      ],
    },
    {
      stepHeader: 'Prepare the vegetables',
      steps: [
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vel ipsum quam. Morbi rhoncus nunc urna, nec gravida tortor tristique eu. Proin ultrices condimentum turpis, efficitur sollicitudin nulla rutrum et.',
          imagePath:
            'https://s3-alpha-sig.figma.com/img/b9bd/2b2c/97cdc4eb2ffe4501a1b8eb9fc1da6f88?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qhpULhxQghDfPUjfbK6aGuwyRsDLOQnaPLFd~TxHrNROSQCzYs~GpQCOh4Sps8kXYH3XERpnZ7C1KH7X75wuwTT0M-3DMnE27sPJecW08vKaxQl0D8r-o17ujPcAgSQC82dII5D31IO1lMLPfLXuq~twnxrGcP39kG3TOPxtC6EyOM8souU2kWmmSXCiNkz8kSWeV8zsyRdEdxQD9UaT5iKU7aMFnzzAz~ve1rhmPnW6087BKrt6AvjQfnV-o5Z4Q683RnkRuS-ENDWCqDWEd6Nvi0Cq57Zw0p4q6ir-yEQb9SArukqM76-4lWm09LDOqqe16-E9pFIkJqSiA31SuA__',
        },
      ],
    },
    {
      stepHeader: 'Add Vegetables to the pot',
      steps: [
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vel ipsum quam. Morbi rhoncus nunc urna, nec gravida tortor tristique eu. Proin ultrices condimentum turpis, efficitur sollicitudin nulla rutrum et.',
          imagePath:
            'https://s3-alpha-sig.figma.com/img/b9bd/2b2c/97cdc4eb2ffe4501a1b8eb9fc1da6f88?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qhpULhxQghDfPUjfbK6aGuwyRsDLOQnaPLFd~TxHrNROSQCzYs~GpQCOh4Sps8kXYH3XERpnZ7C1KH7X75wuwTT0M-3DMnE27sPJecW08vKaxQl0D8r-o17ujPcAgSQC82dII5D31IO1lMLPfLXuq~twnxrGcP39kG3TOPxtC6EyOM8souU2kWmmSXCiNkz8kSWeV8zsyRdEdxQD9UaT5iKU7aMFnzzAz~ve1rhmPnW6087BKrt6AvjQfnV-o5Z4Q683RnkRuS-ENDWCqDWEd6Nvi0Cq57Zw0p4q6ir-yEQb9SArukqM76-4lWm09LDOqqe16-E9pFIkJqSiA31SuA__',
        },
      ],
    },
    {
      stepHeader: 'Add Vegetables to the pot',
      steps: [
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vel ipsum quam. Morbi rhoncus nunc urna, nec gravida tortor tristique eu. Proin ultrices condimentum turpis, efficitur sollicitudin nulla rutrum et.',
          imagePath:
            'https://s3-alpha-sig.figma.com/img/b9bd/2b2c/97cdc4eb2ffe4501a1b8eb9fc1da6f88?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qhpULhxQghDfPUjfbK6aGuwyRsDLOQnaPLFd~TxHrNROSQCzYs~GpQCOh4Sps8kXYH3XERpnZ7C1KH7X75wuwTT0M-3DMnE27sPJecW08vKaxQl0D8r-o17ujPcAgSQC82dII5D31IO1lMLPfLXuq~twnxrGcP39kG3TOPxtC6EyOM8souU2kWmmSXCiNkz8kSWeV8zsyRdEdxQD9UaT5iKU7aMFnzzAz~ve1rhmPnW6087BKrt6AvjQfnV-o5Z4Q683RnkRuS-ENDWCqDWEd6Nvi0Cq57Zw0p4q6ir-yEQb9SArukqM76-4lWm09LDOqqe16-E9pFIkJqSiA31SuA__',
        },
      ],
    },
  ];
}
