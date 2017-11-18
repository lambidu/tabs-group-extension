import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';

import { Group } from '../models';



@Injectable()
export class TabsService {
	private readonly STORAGE_KEY = 'groups';

	private groups: Array<Group> = [];

	private subject: Subject<Array<Group>>;



	public constructor() {
		this.subject = new Subject<Array<Group>>();

		// Load stored groups
		this.loadGroups().then((groups) => {
			this.subject.next(groups);
		});

		// Watch changes to groups
		this.subject.subscribe((groups) => {
			this.groups = groups;
		});

		let tabStripChangedListener = () => {
			this.onTabStripChanged();
		};

		// Watch tabs strip changes
		browser.tabs.onCreated.addListener(tabStripChangedListener);
		browser.tabs.onRemoved.addListener(tabStripChangedListener);
		browser.tabs.onUpdated.addListener(tabStripChangedListener);
		browser.tabs.onMoved.addListener(tabStripChangedListener);
		browser.tabs.onActivated.addListener(tabStripChangedListener);
		browser.tabs.onAttached.addListener(tabStripChangedListener);
		browser.tabs.onDetached.addListener(tabStripChangedListener);
		browser.tabs.onReplaced.addListener(tabStripChangedListener);
		browser.tabs.onHighlighted.addListener(tabStripChangedListener);
	}



	/**
	 * Loads saved groups from browser.storage.local
	 */
	public loadGroups(): Promise<Array<Group>> {
		let promise = new Promise<Array<Group>>((resolve) => {
			// Get saved groups list
			browser.storage.local.get(this.STORAGE_KEY).then((data) => {
				let stored = data[this.STORAGE_KEY];

				// Defaults to empty array
				this.groups = [];

				// Check if groups was stored before
				if (stored === undefined) {
					// Create default group if no one was saved before
					this.createGroup(true).then((group) => {
						// Get opened tabs
						browser.tabs.query({ pinned: false, currentWindow: true }).then((tabs) => {
							// Add opened tabs to newly created group
							group.tabs = tabs;

							// Save changes
							this.saveGroups();
						});
					});
				} else {
					// Add each saved group to groups array
					(stored as Array<Object>).forEach((group) => {
						this.groups.push(group as Group);
					});

					// Notify subscribers about changes
					resolve(this.groups);
				}
			});
		});

		// Return observable array of groups
		return promise;
	}



	/**
	 * Creates new group and returns it
	 */
	public createGroup(active?: boolean): Promise<Group> {
		let promise = new Promise<Group>((resolve) => {
			let group = new Group();

			// Create new group
			group.name = this.getNewGroupName();
			group.tabs = [];
			group.active = active || false;

			// Add newly created group to groups list
			this.groups.push(group);

			// Save changes
			this.saveGroups().then(() => {
				resolve(group);
			});

		});

		// Return created group
		return promise;
	}



	/**
	 * Saves groups to browser.storage.local
	 */
	public saveGroups(): Promise<void> {
		// Create object to store
		let data = {};

		// Set groups
		data[this.STORAGE_KEY] = this.groups;

		// Save groups to local storage
		let promise = browser.storage.local.set(data);

		// Notify subscribers about changes
		promise.then(() => {
			// Notify subscribers about changes
			this.subject.next(this.groups);
		});

		// Return promise
		return promise;
	}



	/**
	 * Sync groups to browser.storage.sync
	 */
	public syncGroups(): Promise<void> {
		// Create object to store
		let data = {};

		// Set groups
		data[this.STORAGE_KEY] = this.groups;

		// Save groups to local storage
		let promise = browser.storage.sync.set(data);

		// Notify subscribers about changes
		promise.then(
			// On success
			() => {
				// Notify subscribers about changes
				this.subject.next(this.groups);
			},

			// On rejected
			() => {
				console.error('Tabs Groups sync failed :(');
			}
		);

		// Return promise
		return promise;
	}



	/**
	 * Removes group
	 */
	public removeGroup(group: Group): Promise<void> {
		// Add newly created group to groups list
		this.groups = this.groups.filter((entry) => {
			return entry != group;
		});

		// Check if removed group was active
		if (group.active) {
			// Set first group as active
			this.changeGroup(this.groups[0]);
		}

		// Save changes
		return this.saveGroups();
	}



	/**
	 * Switches active group
	 */
	public changeGroup(group: Group): Promise<Array<browser.tabs.Tab>> {
		// Get all opened tabs
		let promise = this.getOpenedTabs()

		// Close opened tabs and open group tabs only if group is not already active
		if (group.active === false) {
			// Close currently opened tabs and open tabs from selected group
			promise.then((tabs) => {
				// Get extension root URL
				let root = browser.runtime.getURL('');

				// Close currently opened tabs
				tabs.forEach((tab) => {
					// Check if tab is does not belong to this extension
					if (tab.url.startsWith(root) === false) {
						// Close tab
						browser.tabs.remove(tab.id);
					}
				});

				// Open tabs from selected group
				group.tabs
					.sort((a, b) => {
						return a.index === b.index ? 0 : a.index > b.index ? 1 : -1;
					})
					.forEach((groupTab, index) => {
						browser.tabs.create({
							index: index,
							url: groupTab.url,
							active: groupTab.active
						});
					});

				// Set all groups as inactive
				this.groups.forEach((group) => { group.active = false });

				// Set selected group as active
				group.active = true;

				// Save changes
				this.saveGroups();
			});
		}

		// Return promise
		return promise;
	}



	/**
	 * Returns observable groups array
	 */
	public getGroups(): Subject<Array<Group>> {
		return this.subject;
	}



	/**
	 * Returns active group
	 */
	public getActiveGroup(): Group {
		return this.groups.filter((group) => {
			return group.active === true;
		})[0];
	}



	/**
	 * Closes tab in specified group
	 * @param group
	 * @param tab
	 */
	public closeTab(group: Group, tab: browser.tabs.Tab) {
		// Iterate tabs in current group
		group.tabs = group.tabs.filter((entry) => {
			return entry.id !== tab.id;
		});

		// Check if group is currently active
		if (group.active) {
			// Remove tab from tab strip
			browser.tabs.remove(tab.id);
		}
	}



	/**
	 * Returns list of opened tabs
	 */
	public getOpenedTabs(): Promise<Array<browser.tabs.Tab>> {
		// Return opened tabs
		return browser.tabs.query({ pinned: false, currentWindow: true });
	}



	/**
	 * Returns next sequential group name
	 */
	private getNewGroupName(): string {
		// Find all numbered groups
		let numbers = this.groups
			.map((group) => {
				let matches = (/^Group ([\d]+)$/gi).exec(group.name);

				if (!matches) {
					return 0;
				}

				return parseInt(matches[1]);
			})
			.sort();

		// Get the maximum allocated group number
		let number = numbers[numbers.length - 1] || 0;

		// Return next group name
		return 'Group ' + (number + 1);
	}



	/**
	 * Saves tab strip changes to active group
	 */
	private onTabStripChanged() {
		// Get active group
		let group = this.getActiveGroup();

		// Get opened tabs
		this.getOpenedTabs().then((tabs) => {
			// Get extension URL
			let root = browser.runtime.getURL('');

			// Filter out extension URLs
			tabs = tabs.filter((tab) => {
				return tab.url.startsWith(root) === false;
			});

			// Check if group is defined
			if (group) {
				// Update group tabs
				group.tabs = tabs;

				// Save changes
				this.saveGroups();
			}
		});
	}
}
