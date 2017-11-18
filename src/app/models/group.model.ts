export class Group {
	public name: string;
	public tabs: Array<browser.tabs.Tab> = [];
	public order?: number = 0;
	public active?: boolean = false;
}
