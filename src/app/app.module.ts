import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { JamsilModule } from './jamsil/jamsil.module';
import { RndModule } from './rnd/rnd.module';
import { SangamModule } from './sangam/sangam.module';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    JamsilModule,
    RndModule,
    SangamModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }