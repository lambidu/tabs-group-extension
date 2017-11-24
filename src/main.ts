/// <reference path='../node_modules/web-ext-types/global/index.d.ts'/>

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppModule } from './app/app.module';

import './themes/default/theme.scss';



if (process.env.ENV === 'production') {
	enableProdMode();
}



platformBrowserDynamic()
	.bootstrapModule(AppModule);
