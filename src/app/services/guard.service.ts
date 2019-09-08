import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';



@Injectable()
export class GuardService implements CanActivate {
	public constructor(private router: Router) {
	}



	public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		let page = route.queryParams['page'] || 'background';

		this.router.navigate(['/' + page]);

		return false;
	}
}
