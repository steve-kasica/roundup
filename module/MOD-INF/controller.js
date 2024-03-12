/**
 * controller.js
 *
 * Restart OpenRefine after making changes to this file, no need to recompile the extension or OpenRefine.
 */

var html = "text/html";
var encoding = "UTF-8";
var ClientSideResourceManager = Packages.com.google.refine.ClientSideResourceManager;

/**
 * Register extension commands.
 *
 * Each Roundup command is accessible via /command/roundup/<endpoint>.
 */
function registerCommands() {
    Packages.java.lang.System.out.println("Registering Roundup commands");

    var refineServlet = Packages.com.google.refine.RefineServlet;
    var commands = Packages.com.google.refine.roundup.commands;

    // Register commands
    [
        {endpoint: 'insert-rows', className: new commands.row.InsertRowsCommand()},
        {endpoint: 'aggregate-rows', className: new commands.row.AggregateRowsCommand()},
        {endpoint: 'copy-project', className: new commands.project.CopyProjectCommand()},
        {endpoint: 'slice-project', className: new commands.project.SliceProjectCommand()},
        {endpoint: 'interpolate-rows', className: new commands.row.InterpolateRowsCommand()},
        {endpoint: 'get-rows-partitioned', className: new commands.row.GetRowsPartitionedCommand()},
        {endpoint: 'scratch', className: new commands.Scratch()},
        // {endpoint: 'set-metadata', className: new commands.SetMetadata()},
    ].forEach(function(cmd) {
        Packages.java.lang.System.out.println("\t/commands/roundup/" + cmd.endpoint);
        refineServlet.registerCommand(module, cmd.endpoint, cmd.className);
    });
}

/**
 * Function invoked to initialize the extension.
 */
function init() {
    print("Initializing Roundup extension");
    print(module.getMountPoint());

    var RefineServlet = Packages.com.google.refine.RefineServlet;
    var roundup = Packages.com.google.refine.roundup;

    // Register model changes
    RefineServlet.registerClassMapping(
        "com.google.refine.roundup.model.changes.RowAdditionChange",
        "com.google.refine.roundup.model.changes.RowAdditionChange"
    );

    RefineServlet.cacheClass(roundup.model.changes.RowAdditionChange);

    // Register operations
    [
        { "name": "insert-rows", "klass": roundup.operations.row.RowsInsertOperation },
        { "name": "interpolate-rows", "klass": roundup.operations.row.RowsInterpolateOperation },
        { "name": "aggregate-rows", "klass": roundup.operations.row.RowsAggregateOperation }
    ].forEach(registerOperation);

    registerCommands();

    function print(message) {
        Packages.java.lang.System.err.println(message);
    }

    // ClientSideResourceManager.addPaths(
    //     "index/scripts", // Find this script at /index-bundle.js
    //     module,
    //     [
    //         "scripts/roundup.js"
    //     ]
    // );
    //
    // ClientSideResourceManager.addPaths(
    //     "index/styles", // Find these stylesheets at /extension/roundup/*
    //     module,
    //     [
    //         "styles/roundup.less"
    //     ]
    // );

    function registerOperation(op) {
        Packages.com.google.refine.operations.OperationRegistry.registerOperation(module, op["name"], op["klass"]);
    }
}

/*
 * Function invoked to handle each request in a custom way.
 */
function process(path, request, response) {
  // Analyze path and handle this request yourself.

  if (path == "/" || path == "") {
    var context = {};
    // here's how to pass things into the .vt templates
    context.someList = ["Superior","Michigan","Huron","Erie","Ontario"];
    context.someString = "foo";
    // context.someInt = Packages.com.google.refine.roundup.SampleUtil.stringArrayLength(context.someList);
    // context.projects = Packages.com.google.refine.ProjectManager;

    send(request, response, "index.vt", context);
  }
}

function send(request, response, template, context) {
  butterfly.sendTextFromTemplate(request, response, context, template, encoding, html);
}
