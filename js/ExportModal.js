import { state, settings } from './globalState.js';
import { profileToMatrix } from './utils.js';
import { rules } from './constants.js';

function downloadExport(exportPre, filename) {
    let text = document.getElementById(exportPre).innerText;
    let blob = new Blob([text], { type: 'text/plain' });
    let elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export function populateExportModal() {
    document.getElementById("matrix-export").innerHTML = profileToMatrix(state);
    // preflib cat export
    let resultPreflibCat = window.pyodide.runPython(`
        fileio.write_profile_to_preflib_cat_file("abc-profile.cat", profile=profile)
        open("abc-profile.cat", "r").read()
    `);
    document.getElementById("cat-export").innerHTML = resultPreflibCat;
    // abcvoting yaml export
    let compute_instances = [];
    for (let rule in rules) {
        if (rules[rule].active) {
            compute_instances.push({
                "rule_id": rule,
                "result": [state.storedCommittee[rule]],
                "resolute": settings.resolute,
            });
        }
    }
    let resultYaml = window.pyodide.runPython(`
        fileio.write_abcvoting_instance_to_yaml_file(
            profile=profile, 
            committeesize=${state.committeeSize}, 
            compute_instances=${JSON.stringify(compute_instances).replaceAll("true", "True").replaceAll("false", "False")}
        )
    `);
    document.getElementById("yaml-export").innerHTML = resultYaml;
    // button events
    document.getElementById("export-matrix-button").addEventListener("click", () => { downloadExport('matrix-export', 'abc-profile.txt') });
    document.getElementById("export-cat-button").addEventListener("click", () => { downloadExport('cat-export', 'abc-profile.cat') });
    document.getElementById("export-yaml-button").addEventListener("click", () => { downloadExport('yaml-export', 'profile.abc.yaml') });
}