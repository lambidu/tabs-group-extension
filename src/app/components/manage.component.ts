import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { TabsService } from '../services';
import { Group } from '../models';



@Component({
	templateUrl: '../views/manage.component.html'
})
export class ManageComponent implements OnInit {
	public model: Array<Group> = [];
	public current: Group = null;



	public constructor(private tabs: TabsService, private detector: ChangeDetectorRef, private sanitizer: DomSanitizer) {
	}



	public ngOnInit() {
		this.tabs.getGroups().subscribe((groups) => {
			this.model = groups;

			if (this.current === null) {
				this.current = this.model.filter((group) => {
					return group.active;
				})[0];
			}

			this.detector.detectChanges();
		});
	}



	/**
	 * Changes active group
	 */
	public onGroupClick(group): void {
		this.current = group;
		this.detector.detectChanges();
	}



	/**
	 * Saves changes
	 */
	public save(): void {
		this.tabs.saveGroups();
		this.detector.detectChanges();
	}



	/**
	 * Removes tab from group
	 * @param tab
	 */
	public onRemoveTab(tab) {
		this.tabs.closeTab(this.current, tab);
	}



	/**
	 * Creates new group and assigns current tab to it
	 */
	public onCreateGroup() {
		// Create new group
		this.tabs.createGroup().then((group) => {
			// Select newly created
			this.current = group;
		});
	}



	/**
	 * Changes group
	 */
	public onChangeGroup() {
		// Save active changes
		this.tabs.changeGroup(this.current);
	}



	/**
	 * Removes group
	 */
	public onRemoveGroup() {
		let question = [
			'You are about to remove group "' + this.current.name + '"',
			'This will also remove ' + this.current.tabs.length + ' tabs in this group!',
			'Are you sure you want continue?'
		].join('\n');

		// Ask user confirmation only if group has tabs
		let confirmed = (this.current.tabs.length > 0) ? confirm(question) : true;

		// Check if group removal has been confirmed
		if (confirmed) {
			// Remove selected group
			this.tabs.removeGroup(this.current).then(() => {
				this.current = this.model[0];
			});
		}
	}
}
