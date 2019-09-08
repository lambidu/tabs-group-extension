import { Routes, RouterModule } from '@angular/router';

import { GuardService } from "./services";

import {
	HostComponent,
	ManageComponent,
	SettingsComponent,
	BackgroundComponent,
	PopupComponent
} from './components';



export const routes: Routes = [{
	path: 'popup',
	component: PopupComponent,
}, {
	path: 'manage',
	component: ManageComponent,
}, {
	path: 'settings',
	component: SettingsComponent,
}, {
	path: 'background',
	component: BackgroundComponent,
}, {
	path: '**',
	component: HostComponent,
	canActivate: [GuardService]
}];

export const APP_ROUTES = RouterModule.forRoot(routes);
