// This file is added to the /index-bundle.js

Roundup = {};

Roundup.ManageProjectsUI = function(elmt) {
    var self = this;

    this._elmt = elmt;
    this._customPanels = [];
    this._controllers = [];

    // Load HTML at /extension/roundup/scripts/manage-projects.html
    this._sourceSelectionElmt = $(DOM.loadHTML("roundup", "scripts/manage-projects.html")).appendTo(this._elmt);
    this._sourceSelectionElmts = DOM.bind(this._sourceSelectionElmt);

    // Draw the interface
    this._render();
}

Roundup.ManageProjectsUI.controllers = [];

Roundup.ManageProjectsUI.prototype.resize = function() {
    // TODO, actually implement this
    // var totalHeight = this._elmt.height();
    // var tabBodyContainer = $('#create-project-ui-source-selection-tab-bodies');
    // var selectedTabBody = $('.create-project-ui-source-selection-tab-body.selected');
    //
    // var top = tabBodyContainer.position().top;
    // var tabBodyHeight = totalHeight - top - DOM.getVPaddings(selectedTabBody);
    // $('.create-project-ui-source-selection-tab-body').css('height', tabBodyHeight + 'px');
}

Roundup.ManageProjectsUI.prototype._getRoundupMeta = function(cb) {
    this._fetchProjects(function(data) {
        const projSets = new Map();
        let setName, projs, proj;
        for (let projID in data["projects"]) {
            proj = data["projects"][projID];

            // Filter out projects without Roundup metadata
            // TODO would be better to just namespace our stuff within customMetadata
            if (!Object.keys(proj.customMetadata).length) { continue; }
            if (Object.keys(proj.customMetadata).filter(k => k.slice(0,7) !== 'roundup').length) { continue; }

            setName = proj.customMetadata["roundup-project-set-name"];
            projs = projSets.has(setName) ? projSets.get(setName) : [];
            projs.push({
                projectName: proj.name,
                projectID: projID,
            });
            projSets.set(setName, projs);
        }
        cb(projSets);
    })
};

/**
 * _fetchProjects
 *
 * @param cb
 * @private
 */
Roundup.ManageProjectsUI.prototype._fetchProjects = function(cb) {
    $.getJSON(
        "command/core/get-all-project-metadata",
        null,
        cb,
    )
};

/**
 * _postMetadataUpdate
 * Update project metadata specific to Roundup. Sends a POST request
 * to an extension command (API endpoint) specifically for handling
 * Roundup metadata.
 *
 * @param data
 * @returns {Roundup.ManageProjectsUI}
 * @private
 */
Roundup.ManageProjectsUI.prototype._postMetadataUpdate = function(data) {
    const url = '/command/roundup/set-metadata';
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function () {
            console.log('success')
        },
        dataType: 'json'
    });

    return this;
}

/**
 * _template
 * @param id a project ID created by OpenRefine
 * @param pm a ProjectMetadata object
 * @returns {*|jQuery|HTMLElement}
 * @private
 */
Roundup.ManageProjectsUI.prototype._template = function(id, pm) {
    const self = this;
    const template = `
        <form class="row" data-project-id="${id}">
            <div class="col">${pm.name}</div>
            <div class="col">
                <input type="text" value="${pm.customMetadata['roundup-project-set-name']}" name="roundup-project-set-name">
            </div>
            <div class="col">
                <button type="submit">Submit</button>
            </div>            
        </form>
    `;
    const $form = $(template);

    $form.on('submit', function(event) {
        event.preventDefault();
        const $target = $(event.target);
        const formData = $target.serializeArray();
        const data = [];
        data.push({name: 'project', value: $target.attr('data-project-id')})
        data.push({name: 'name', value: formData[0].name});
        data.push({name: 'value', value: formData[0].value});
        data.push({name: 'csrf_token', value: undefined });
        self._postMetadataUpdate(data);
    });
    return $form;
}

Roundup.ManageProjectsUI.prototype._render = function() {
    const $div = $('#roundup-projects');
    const self = this;

    this._fetchProjects(function(data) {
        for (const [projectID, projectMeta] of Object.entries(data["projects"])) {
            $div.append(self._template(projectID, projectMeta));
        }

    });

    return this;
}

// Add Roundup's manage projects tab to the action area
Refine.actionAreas.push({
    id: "roundup-manage-projects",
    label: "Manage projects",
    uiClass: Roundup.ManageProjectsUI
});