import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Group } from '../models';

import { TabsService } from '../services';



@Component({
	templateUrl: '../views/popup.component.html'
})
export class PopupComponent implements OnInit {
	private model: Array<Group> = [];
	private syncing: boolean = false;



	public constructor(private tabs: TabsService, private detector: ChangeDetectorRef) {
	}



	public ngOnInit() {
		this.tabs.getGroups().subscribe((data) => {
			this.model = data;

			this.detector.detectChanges();
		});
	}



	/**
	 * Creates new group and assigns current tab to it
	 */
	public onCreateGroup() {
		// Create new group
		this.tabs.createGroup();
	}



	/**
	 * Opens selected group tabs
	 * @param group
	 */
	public onGroupClick(group: Group) {
		// Change group
		this.tabs.changeGroup(group).then(() => {
			// Close popup window
			window.close();
		});
	}



	/**
	 * Sync local groups with other devices
	 */
	public onSyncGroups() {
		// Start sync icon animation
		this.syncing = true;

		// Sync local groups with other devices
		this.tabs.syncGroups().then(() => {
			// Stop sync icon animation
			this.syncing = false;
		});
	}



	/**
	 * Opens manage tabs page
	 */
	public onManageGroups() {
		// Open management page
		browser.tabs.create({
			url: browser.runtime.getURL('/index.html?page=manage'),
			active: true
		}).then(() => {
			// Close popup window
			window.close();
		});
	}



	/**
	 * Opens settings page
	 */
	public onSettings() {
		// Open extension options page
		browser.runtime.openOptionsPage().then(() => {
			// Close popup window
			window.close();
		});
	}



	/**
	 * Opens extension page
	 */
	public onRate() {
		// Open extension page in a separate tab
		browser.tabs.create({
			url: 'https://addons.mozilla.org/en-US/firefox/addon/tabs-group',
			active: true
		}).then(() => {
			// Close popup window
			window.close();
		});
	}
}
