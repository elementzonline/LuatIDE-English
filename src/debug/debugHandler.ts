import * as vscode from "vscode";

export function runProject(resource: vscode.Uri): void {
	vscode.debug.startDebugging(undefined, {
		type: 'luat',
		name: 'LuatIDE Run',
		request: 'launch',
		program: "${command:activityProjectGet}",
		stopOnEntry: false,
		noDebug: true
	}
	);
}
export function debugProject(resource: vscode.Uri): void {
	vscode.debug.startDebugging(undefined, {
		type: 'luat',
		name: 'LuatIDE Debug',
		request: 'launch',
		program: "${command:activityProjectGet}",
		stopOnEntry: true,
		noDebug: false
	});
}