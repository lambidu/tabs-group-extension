import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';

import { DragulaModule } from 'ng2-dragula';

import { AppComponent } from './app.component';

import { COMPONENTS } from './components';
import { SERVICES } from './services';
import { PIPES } from './pipes';
import { APP_ROUTES } from './app.routes';



@NgModule({
	declarations: [
		AppComponent,

		COMPONENTS,
		PIPES
	],
	imports: [
		BrowserModule,
		FormsModule,
		DragulaModule,

		APP_ROUTES
	],
	providers: [
		SERVICES,

		{ provide: APP_BASE_HREF, useValue: '/' }
	],
	bootstrap: [
		AppComponent
	]
})
export class AppModule {
}
