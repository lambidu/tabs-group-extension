import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';



@Pipe({
	name: 'safe'
})
export class SafePipe {
	public constructor(private sanitizer: DomSanitizer) {
	}



	public transform(value) {
		return this.sanitizer.bypassSecurityTrustUrl(value);
	}
}
