export function openFile(e) {
    e.preventDefault();
    const dialog = window.__TAURI__.dialog;
    const fileRelativeLoc = '../../file';
    var response = dialog.open({
        'defaultPath': fileRelativeLoc,
        'filters': [{
            name: 'casio_rbk',
            extensions: ['rbk']
        }]
    });
}

export function arraysMatch(arr1, arr2) {
	// Check if the arrays are the same length
	if (arr1.length !== arr2.length) return false;

	// Check if all items exist and are in the same order
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	// Otherwise, return true
	return true;
};

export function fsLog(msg) {
    const fs = window.__TAURI__.fs;
}

