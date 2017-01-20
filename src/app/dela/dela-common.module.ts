import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, JsonpModule } from '@angular/http';

import { DelaService } from './dela.service';
import { UnescapePipe } from './unescape.pipe';
import { CaloriesPipe } from './calories.pipe';
import { ToNumberPipe } from './toNumber.pipe';
import { DiscountPipe } from './discount.pipe';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    JsonpModule
  ],
  declarations: [
    UnescapePipe,
    CaloriesPipe,
    ToNumberPipe,
    DiscountPipe
  ],
  providers: [
    DelaService
  ],
  exports: [
    UnescapePipe,
    CaloriesPipe,
    ToNumberPipe,
    DiscountPipe
  ]
})
export class DelaCommonModule { }